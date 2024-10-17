<?php
namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Récupérer tous les utilisateurs
    public function getAllUsers(Request $request, Response $response, $args) {
        $query = "SELECT * FROM Users";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($users));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer un utilisateur par son ID
    public function getUser(Request $request, Response $response, $args) {
        $user_id = $args['id'];
        $query = "SELECT * FROM Users WHERE user_id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Créer un utilisateur
    public function createUser(Request $request, Response $response, $args) {
        $data = json_decode($request->getBody()->getContents(), true);
        $query = "INSERT INTO Users (full_name, email, password_hash, phone_number, role) 
                  VALUES (:full_name, :email, :password_hash, :phone_number, :role)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', password_hash($data['password'], PASSWORD_BCRYPT));
        $stmt->bindParam(':phone_number', $data['phone_number']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->execute();
        $response->getBody()->write(json_encode(['message' => 'Utilisateur créé avec succès']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Mettre à jour un utilisateur
    public function updateUser(Request $request, Response $response, $args) {
        $user_id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        $query = "UPDATE Users SET full_name = :full_name, email = :email, phone_number = :phone_number, role = :role 
                  WHERE user_id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':phone_number', $data['phone_number']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        $response->getBody()->write(json_encode(['message' => 'Utilisateur mis à jour avec succès']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Supprimer un utilisateur
    public function deleteUser(Request $request, Response $response, $args) {
        $user_id = $args['id'];
        $query = "DELETE FROM Users WHERE user_id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        $response->getBody()->write(json_encode(['message' => 'Utilisateur supprimé avec succès']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
