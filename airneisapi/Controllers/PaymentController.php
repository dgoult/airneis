<?php

namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PaymentController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Récupérer tous les paiements d'un utilisateur via l'user_id passé dans l'URL
    public function getAllPayments(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];  // Récupérer l'ID utilisateur via l'URL

        $query = "SELECT * FROM Payments WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $payments = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($payments));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Créer un nouveau paiement pour l'utilisateur
    public function createPayment(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "INSERT INTO Payments (user_id, card_name, card_number, expiration_date, cvv) 
                  VALUES (:user_id, :card_name, :card_number, :expiration_date, :cvv)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':card_name', $data['card_name']);
        $stmt->bindParam(':card_number', $data['card_number']);
        $stmt->bindParam(':expiration_date', $data['expiration_date']);
        $stmt->bindParam(':cvv', $data['cvv']);
        $stmt->execute();

        $payment_id = $this->db->lastInsertId();

        $response->getBody()->write(json_encode(["message" => "Paiement créé avec succès", "payment_id" => $payment_id]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Mettre à jour un paiement pour un utilisateur
    public function updatePayment(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];
        $payment_id = $args['payment_id'];
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "UPDATE Payments 
                  SET card_name = :card_name, card_number = :card_number, expiration_date = :expiration_date, cvv = :cvv
                  WHERE payment_id = :payment_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':card_name', $data['card_name']);
        $stmt->bindParam(':card_number', $data['card_number']);
        $stmt->bindParam(':expiration_date', $data['expiration_date']);
        $stmt->bindParam(':cvv', $data['cvv']);
        $stmt->bindParam(':payment_id', $payment_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Paiement mis à jour avec succès"]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Supprimer un paiement d'un utilisateur
    public function deletePayment(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];
        $payment_id = $args['payment_id'];

        $query = "DELETE FROM Payments WHERE payment_id = :payment_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':payment_id', $payment_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Paiement supprimé avec succès"]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
