<?php
namespace Controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Controllers\Mailer;

class AuthController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    public function login(Request $request, Response $response, $args) {
        // Lire le corps brut de la requête et le décoder manuellement
        $data = json_decode($request->getBody()->getContents(), true);  // Convertir le JSON en tableau associatif
    
        // Vérifiez si l'email et le mot de passe sont fournis
        if (!isset($data['email']) || !isset($data['password'])) {
            $response->getBody()->write(json_encode(["message" => "L'email et le mot de passe sont requis"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $email = $data['email'];
        $password = $data['password'];
        
        // Requête pour récupérer l'utilisateur
        $query = "SELECT * FROM Users WHERE email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        // Vérifiez le mot de passe
        if ($user && password_verify($password, $user['password_hash'])) {
            // Vérifiez si l'utilisateur a confirmé son email
            if ($user['email_verified'] == 0) {
                $response->getBody()->write(json_encode([
                    "message" => "Votre email n'est pas encore confirmé. Veuillez vérifier votre boîte de réception."
                ]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
            }
    
            // Si l'utilisateur est confirmé, générer un token JWT
            $payload = [
                "iss" => "http://yourdomain.com",
                "aud" => "http://yourdomain.com",
                "iat" => time(),
                "nbf" => time(),
                "exp" => time() + (60 * 60), // Token valide 1h
                "data" => [
                    "user_id" => $user['user_id'],
                    "email" => $user['email'],
                    "role" => $user['role']
                ]
            ];
            $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
        
            // Supprimer le hash du mot de passe avant de renvoyer l'utilisateur
            unset($user['password_hash']);
    
            // Réponse incluant le token et les informations utilisateur
            $response->getBody()->write(json_encode([
                "message" => "Connexion réussie",
                "token" => $jwt,
                "user" => $user
            ]));
        } else {
            $response->getBody()->write(json_encode(["message" => "Identifiants incorrects"]));
        }
        
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function register(Request $request, Response $response, $args) {
        $data = json_decode($request->getBody()->getContents(), true);
    
        // Validation des données
        if (!isset($data['full_name'], $data['email'], $data['password']) || 
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $response->getBody()->write(json_encode([
                "message" => "Les champs full_name, email (valide) sont requis"
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    
        // Vérification de l'existence de l'email
        $query = "SELECT * FROM Users WHERE email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $data['email']);
        $stmt->execute();
        if ($stmt->fetch(\PDO::FETCH_ASSOC)) {
            $response->getBody()->write(json_encode(["message" => "Cet email est déjà utilisé"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    
        // Génération du hash de mot de passe et du token de vérification
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        $verificationToken = bin2hex(random_bytes(16)); // Génère un token unique
    
        // Insérer le nouvel utilisateur
        $query = "INSERT INTO Users (full_name, email, password_hash, role, verification_token) VALUES (:full_name, :email, :password_hash, :role, :verification_token)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', $passwordHash);
        $role = 'user'; // Rôle par défaut
        $stmt->bindParam(':role', $role);
        $stmt->bindParam(':verification_token', $verificationToken);
        $stmt->execute();
    
        // Récupérer l'utilisateur créé
        $userId = $this->db->lastInsertId();
        $query = "SELECT * FROM Users WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $newUser = $stmt->fetch(\PDO::FETCH_ASSOC);
    
        // Envoi de l'email de confirmation
        $this->sendConfirmationEmail($newUser['email'], $newUser['full_name'], $verificationToken);
    
        // Supprimer le hash du mot de passe avant de renvoyer l'utilisateur
        unset($newUser['password_hash']);
    
        // Répondre avec l'utilisateur créé
        $response->getBody()->write(json_encode([
            "message" => "Inscription réussie. Veuillez confirmer votre email.",
            "user" => $newUser
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    private function sendConfirmationEmail($email, $fullName, $verificationToken) {
        // Récupérer le domaine à partir de DB_HOST
        $domain = $_ENV['APP_URL'];
    
        // Construire le lien de confirmation
        $confirmationLink = "http://$domain/api/email_confirm?token=" . $verificationToken;
    
        // Contenu de l'email
        $subject = "Confirmez votre inscription";
        $body = "Bonjour $fullName,\n\nMerci de vous être inscrit. Veuillez confirmer votre inscription en cliquant sur le lien suivant :\n\n$confirmationLink\n\nCordialement,\nL'équipe.";
    
        // Utiliser la classe Mailer pour envoyer l'email
        $mailer = new Mailer();
        try {
            $mailer->sendEmail($email, $subject, $body);
        } catch (Exception $e) {
            throw new Exception("L'email n'a pas pu être envoyé. Erreur : " . $e->getMessage());
        }
    }

    public function confirmEmail(Request $request, Response $response, $args) {
        // Récupérer le token depuis la requête
        $token = $request->getQueryParams()['token'] ?? null;
    
        if (!$token) {
            $response->getBody()->write(json_encode(["message" => "Token de confirmation manquant"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    
        // Vérifier si le token est valide
        $query = "SELECT * FROM Users WHERE verification_token = :token";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
    
        if (!$user) {
            $response->getBody()->write(json_encode(["message" => "Token de confirmation invalide"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    
        // Mettre à jour l'utilisateur pour confirmer l'email
        $query = "UPDATE Users SET email_verified = 1, verification_token = NULL WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user['user_id']);
        $stmt->execute();
    
        $response->getBody()->write(json_encode(["message" => "Email confirmé avec succès."]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}