<?php

namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AddressController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Récupérer toutes les adresses de l'utilisateur via l'user_id passé dans l'URL
    public function getAllAddresses(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];  // Récupérer l'ID utilisateur via l'URL

        $query = "SELECT * FROM Addresses WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $addresses = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($addresses));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer les adresses pour un select en utilisant l'user_id passé dans l'URL
    public function getAddressesForSelect(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];  // Récupérer l'ID utilisateur via l'URL
    
        // Requête pour récupérer les adresses de l'utilisateur
        $query = "SELECT address_id, name FROM Addresses WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $addresses = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
        // Préparer le format pour le select (value = address_id, label = name)
        $addressesForSelect = [];
        foreach ($addresses as $address) {
            $addressesForSelect[] = [
                "value" => $address['address_id'],
                "label" => $address['name']
            ];
        }
    
        // Retourner la liste formatée pour un select
        $response->getBody()->write(json_encode($addressesForSelect));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Créer une nouvelle adresse pour l'utilisateur
    public function createAddress(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "INSERT INTO Addresses (user_id, name, first_name, last_name, address_line_1, address_line_2, city, region, postal_code, country, phone_number) 
                  VALUES (:user_id, :name, :first_name, :last_name, :address_line_1, :address_line_2, :city, :region, :postal_code, :country, :phone_number)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':first_name', $data['first_name']);
        $stmt->bindParam(':last_name', $data['last_name']);
        $stmt->bindParam(':address_line_1', $data['address_line_1']);
        $stmt->bindParam(':address_line_2', $data['address_line_2']);
        $stmt->bindParam(':city', $data['city']);
        $stmt->bindParam(':region', $data['region']);
        $stmt->bindParam(':postal_code', $data['postal_code']);
        $stmt->bindParam(':country', $data['country']);
        $stmt->bindParam(':phone_number', $data['phone_number']);
        $stmt->execute();

        $address_id = $this->db->lastInsertId();

        $response->getBody()->write(json_encode(["message" => "Adresse créée avec succès", "address_id" => $address_id]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Mettre à jour une adresse pour un utilisateur
    public function updateAddress(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];
        $address_id = $args['address_id'];
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "UPDATE Addresses 
                  SET name = :name, first_name = :first_name, last_name = :last_name, address_line_1 = :address_line_1, address_line_2 = :address_line_2, 
                      city = :city, region = :region, postal_code = :postal_code, country = :country, phone_number = :phone_number 
                  WHERE address_id = :address_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':first_name', $data['first_name']);
        $stmt->bindParam(':last_name', $data['last_name']);
        $stmt->bindParam(':address_line_1', $data['address_line_1']);
        $stmt->bindParam(':address_line_2', $data['address_line_2']);
        $stmt->bindParam(':city', $data['city']);
        $stmt->bindParam(':region', $data['region']);
        $stmt->bindParam(':postal_code', $data['postal_code']);
        $stmt->bindParam(':country', $data['country']);
        $stmt->bindParam(':phone_number', $data['phone_number']);
        $stmt->bindParam(':address_id', $address_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Adresse mise à jour avec succès"]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Supprimer une adresse d'un utilisateur
    public function deleteAddress(Request $request, Response $response, $args) {
        $user_id = $args['user_id'];
        $address_id = $args['address_id'];

        $query = "DELETE FROM Addresses WHERE address_id = :address_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':address_id', $address_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Adresse supprimée avec succès"]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
