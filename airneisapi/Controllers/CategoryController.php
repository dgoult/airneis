<?php

namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CategoryController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Récupérer toutes les catégories avec les images et la description
    public function getAllCategories(Request $request, Response $response, $args) {
        $query = "SELECT * FROM Categories";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($categories));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer une catégorie par son ID avec son image et la description
    public function getCategory(Request $request, Response $response, $args) {
        $category_id = $args['id'];
    
        // Récupérer les informations de la catégorie
        $query = "SELECT * FROM Categories WHERE category_id = :category_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        $category = $stmt->fetch(\PDO::FETCH_ASSOC);
    
        if (!$category) {
            $response->getBody()->write(json_encode(["message" => "Catégorie non trouvée."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
    
        // Récupérer les produits associés à la catégorie triés par priorité et disponibilité
        $query = "
            SELECT p.*, GROUP_CONCAT(pi.image_url) AS images
            FROM Products p
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
            WHERE p.category_id = :category_id
            GROUP BY p.product_id
            ORDER BY 
                CASE WHEN p.priority IS NOT NULL THEN 0 ELSE 1 END, -- Priorité définie en premier
                p.priority ASC, -- Trier par priorité croissante
                CASE WHEN p.stock = 0 THEN 1 ELSE 0 END, -- Produits épuisés à la fin
                p.name ASC -- Trier par nom pour les autres
        ";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        $products = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
        // Ajouter les produits triés à la catégorie
        $category['products'] = $products;
    
        $response->getBody()->write(json_encode($category));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    // Créer une nouvelle catégorie avec une image et une description
    public function createCategory(Request $request, Response $response, $args) {
        $data = json_decode($request->getBody()->getContents(), true);
        $image_url = $data['image_url'] ?? null;
        $description = $data['description'] ?? null;

        $query = "INSERT INTO Categories (name, image_url, description) VALUES (:name, :image_url, :description)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':description', $description);
        $stmt->execute();

        $category_id = $this->db->lastInsertId();

        $response->getBody()->write(json_encode($this->getCategoryById($category_id)));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Mettre à jour une catégorie avec une image et une description
    public function updateCategory(Request $request, Response $response, $args) {
        $category_id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        $image_url = $data['image_url'] ?? null;
        $name = $data['name'] ?? null;
        $description = $data['description'] ?? null;

        $query = "UPDATE Categories SET name = :name, image_url = :image_url, description = :description WHERE category_id = :category_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();

        $response->getBody()->write(json_encode($this->getCategoryById($category_id)));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Méthode pour récupérer un produit par son ID
    private function getCategoryById($category_id) {
        $query = "SELECT * FROM Categories WHERE category_id = :category_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        $category = $stmt->fetch(\PDO::FETCH_ASSOC);

        return $category;
    }

    // Supprimer une catégorie
    public function deleteCategory(Request $request, Response $response, $args) {
        $category_id = $args['id'];
    
        // Vérifier si des produits sont associés à cette catégorie
        $checkProductsQuery = "SELECT COUNT(*) as product_count FROM Products WHERE category_id = :category_id";
        $stmt = $this->db->prepare($checkProductsQuery);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        $productCount = $stmt->fetchColumn();
    
        if ($productCount > 0) {
            $response->getBody()->write(json_encode(["message" => "Impossible de supprimer cette catégorie car des produits lui sont encore associés."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    
        // Supprimer la catégorie
        $deleteCategoryQuery = "DELETE FROM Categories WHERE category_id = :category_id";
        $stmt = $this->db->prepare($deleteCategoryQuery);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
    
        $response->getBody()->write(json_encode(["message" => "Catégorie supprimée avec succès."]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function setCategoryPriorityProducts(Request $request, Response $response, $args) {
        $category_id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        $priorityProducts = $data['priority_products'] ?? [];
    
        // Mettre à jour la priorité des produits pour la catégorie donnée
        $query = "UPDATE Products SET priority = NULL WHERE category_id = :category_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
    
        foreach ($priorityProducts as $index => $productId) {
            $priority = $index + 1; // Priorité commence à 1
            $query = "UPDATE Products SET priority = :priority WHERE product_id = :product_id AND category_id = :category_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':priority', $priority);
            $stmt->bindParam(':product_id', $productId);
            $stmt->bindParam(':category_id', $category_id);
            $stmt->execute();
        }
    
        $response->getBody()->write(json_encode(["message" => "Priorités des produits mises à jour avec succès."]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
