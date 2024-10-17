<?php

namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class OrderController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Créer une nouvelle commande et déduire le stock
    public function createOrder(Request $request, Response $response, $args) {
        $data = json_decode($request->getBody()->getContents(), true);
        $user_id = $data['user_id'];

        // Récupérer les informations sur le produit
        $query = "SELECT stock FROM Products WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $data['product_id']);
        $stmt->execute();
        $product = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Vérifier si le stock est suffisant
        if ($product['stock'] < $data['quantity']) {
            $response->getBody()->write(json_encode(["message" => "Stock insuffisant pour passer la commande."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Déduire la quantité du stock
        $new_stock = $product['stock'] - $data['quantity'];
        $query = "UPDATE Products SET stock = :new_stock WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':new_stock', $new_stock);
        $stmt->bindParam(':product_id', $data['product_id']);
        $stmt->execute();

        // Créer la commande avec le statut "en cours"
        $query = "INSERT INTO Orders (user_id, address_id, payment_id, product_id, quantity, status)
                  VALUES (:user_id, :address_id, :payment_id, :product_id, :quantity, 'en cours')";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':address_id', $data['address_id']);
        $stmt->bindParam(':payment_id', $data['payment_id']);
        $stmt->bindParam(':product_id', $data['product_id']);
        $stmt->bindParam(':quantity', $data['quantity']);
        $stmt->execute();

        // Retourner la réponse avec l'ID de la commande créée
        $order_id = $this->db->lastInsertId();
        $response->getBody()->write(json_encode(["message" => "Commande créée avec succès", "order_id" => $order_id]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Mettre à jour le statut de la commande (Admin)
    public function updateOrderStatus(Request $request, Response $response, $args) {
        $order_id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);

        // Mettre à jour le statut de la commande (en cours, annulé, livré)
        $query = "UPDATE Orders SET status = :status, quantity = :quantity WHERE order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':status', $data['status']); // 'en cours', 'annulé', 'livré'
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':quantity', $data['quantity']);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Statut de la commande mis à jour avec succès."]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateOrder(Request $request, Response $response, $args) {
        $order_id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
    
        // Récupérer la commande actuelle
        $query = "SELECT * FROM Orders WHERE order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
        $order = $stmt->fetch(\PDO::FETCH_ASSOC);
    
        if (!$order) {
            $response->getBody()->write(json_encode(["message" => "Commande non trouvée."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
    
        // Si la quantité ou le produit est modifié, ajuster le stock
        if (isset($data['quantity']) && $data['quantity'] != $order['quantity'] || isset($data['product_id']) && $data['product_id'] != $order['product_id']) {
            // Recalculer le stock de l'ancien produit
            $old_product_id = $order['product_id'];
            $old_quantity = $order['quantity'];
    
            $query = "UPDATE Products SET stock = stock + :old_quantity WHERE product_id = :old_product_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':old_quantity', $old_quantity);
            $stmt->bindParam(':old_product_id', $old_product_id);
            $stmt->execute();
    
            // Si le produit a changé, récupérer le nouveau produit et ajuster le stock
            if (isset($data['product_id'])) {
                $product_id = $data['product_id'];
            } else {
                $product_id = $order['product_id'];
            }
    
            // Récupérer les informations sur le nouveau produit
            $query = "SELECT stock FROM Products WHERE product_id = :product_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':product_id', $product_id);
            $stmt->execute();
            $product = $stmt->fetch(\PDO::FETCH_ASSOC);
    
            // Vérifier si le stock est suffisant pour la nouvelle quantité
            $new_quantity = $data['quantity'] ?? $order['quantity'];
            if ($product['stock'] < $new_quantity) {
                $response->getBody()->write(json_encode(["message" => "Stock insuffisant pour mettre à jour la commande."]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }
    
            // Déduire la nouvelle quantité du stock
            $query = "UPDATE Products SET stock = stock - :new_quantity WHERE product_id = :product_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':new_quantity', $new_quantity);
            $stmt->bindParam(':product_id', $product_id);
            $stmt->execute();
        }
    
        // Mettre à jour les informations de la commande
        $query = "UPDATE Orders SET 
                    address_id = :address_id, 
                    payment_id = :payment_id, 
                    product_id = :product_id, 
                    quantity = :quantity,
                    status = :status
                  WHERE order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':address_id', $data['address_id']);
        $stmt->bindParam(':payment_id', $data['payment_id']);
        $stmt->bindParam(':product_id', $product_id);  // Utilise le produit mis à jour
        $stmt->bindParam(':quantity', $new_quantity);  // Utilise la nouvelle quantité
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
    
        $response->getBody()->write(json_encode(["message" => "Commande mise à jour avec succès"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    // Récupérer toutes les commandes (Admin)
    public function getAllOrders(Request $request, Response $response, $args) {
        $query = "SELECT * FROM Orders";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $orders = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($orders));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer une commande par son ID
    public function getOrder(Request $request, Response $response, $args) {
        $order_id = $args['id'];

        $query = "SELECT * FROM Orders WHERE order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
        $order = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$order) {
            $response->getBody()->write(json_encode(["message" => "Commande non trouvée."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $response->getBody()->write(json_encode($order));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Supprimer une commande (Admin)
    public function deleteOrder(Request $request, Response $response, $args) {
        $order_id = $args['id'];

        $query = "DELETE FROM Orders WHERE order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Commande supprimée avec succès."]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
