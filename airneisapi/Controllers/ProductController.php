<?php

namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProductController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Récupérer tous les produits avec leurs matériaux et images associés
    public function getAllProducts(Request $request, Response $response, $args) {
        $query = "SELECT * FROM Products";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($products as &$product) {
            $product['materials'] = $this->getProductMaterials($product['product_id']);
            $product['images'] = $this->getProductImages($product['product_id']);
        }

        $response->getBody()->write(json_encode($products));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer un produit par son ID avec ses matériaux et images associés
    public function getProduct(Request $request, Response $response, $args) {
        $product_id = $args['id'];

        $query = "SELECT * FROM Products WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        $product = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$product) {
            $response->getBody()->write(json_encode(["message" => "Produit non trouvé."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        // Ajouter les matériaux et les images associés
        $product['materials'] = $this->getProductMaterials($product_id);
        $product['images'] = $this->getProductImages($product_id);

        $response->getBody()->write(json_encode($product));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Créer un produit avec des matériaux et des images
    public function createProduct(Request $request, Response $response, $args) {
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "INSERT INTO Products (name, description, category_id, price, stock)
                  VALUES (:name, :description, :category_id, :price, :stock)";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':category_id', $data['category_id']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':stock', $data['stock']);
        $stmt->execute();

        $product_id = $this->db->lastInsertId();

        // Associer les matériaux
        if (isset($data['materials'])) {
            $this->associateMaterials($product_id, $data['materials']);
        }

        // Associer les images
        if (isset($data['images'])) {
            $this->associateImages($product_id, $data['images']);
        }

        $response->getBody()->write(json_encode($this->getProductById($product_id)));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Mettre à jour un produit et ses matériaux et images
    public function updateProduct(Request $request, Response $response, $args) {
        $product_id = $args['id'];  // Récupérer le product_id depuis les arguments de la requête
        $data = json_decode($request->getBody()->getContents(), true);  // Récupérer les données de la requête

        // Vérifier si des données ont bien été fournies
        if (!$data) {
            $response->getBody()->write(json_encode(['error' => 'Aucune donnée fournie']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Mettre à jour les informations du produit
        $query = "UPDATE Products SET name = :name, description = :description, category_id = :category_id, price = :price, stock = :stock
                WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':category_id', $data['category_id']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':stock', $data['stock']);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();

        // Mettre à jour les matériaux associés
        if (isset($data['materials'])) {
            $this->updateMaterials($product_id, $data['materials']);
        }

        // Mettre à jour les images associées
        if (isset($data['images'])) {
            $this->updateImages($product_id, $data['images']);
        }

        // Récupérer et retourner le produit mis à jour
        $updatedProduct = $this->getProductById($product_id);
        $response->getBody()->write(json_encode($updatedProduct));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Méthode pour récupérer un produit par son ID
    private function getProductById($product_id) {
        $query = "SELECT * FROM Products WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        $product = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Récupérer les matériaux associés
        $product['materials'] = $this->getProductMaterials($product_id) ?? [];

        // Récupérer les images associées
        $product['images'] = $this->getProductImages($product_id) ?? [];

        return $product;
    }

    // Supprimer un produit et ses matériaux et images associés
    public function deleteProduct(Request $request, Response $response, $args) {
        $product_id = $args['id'];

        if (!$product_id){

            $response->getBody()->write(json_encode(["message" => "Id manquant"]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        // Supprimer les associations de matériaux
        $this->deleteMaterials($product_id);

        // Supprimer les associations d'images
        $this->deleteImages($product_id);

        $query = "DELETE FROM Products WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();

        $response->getBody()->write(json_encode(["message" => "Produit supprimé avec succès"]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer les matériaux associés à un produit
    private function getProductMaterials($product_id) {
        $query = "SELECT m.material_id, m.name FROM Materials m
                  INNER JOIN Product_Materials pm ON m.material_id = pm.material_id
                  WHERE pm.product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // Récupérer les images associées à un produit
    private function getProductImages($product_id) {
        $query = "SELECT image_id, image_url FROM Product_Images WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // Associer des matériaux à un produit
    private function associateMaterials($product_id, $materials) {
        $query = "INSERT INTO Product_Materials (product_id, material_id) VALUES (:product_id, :material_id)";
        $stmt = $this->db->prepare($query);
    
        foreach ($materials as $material) {
            // Vérifier si l'ID du matériau est bien un entier
            if (is_array($material)) {
                $material_id = $material['material_id'];  // Si le tableau contient un ID
            } else {
                $material_id = $material;  // Si c'est directement un ID
            }
            $stmt->bindParam(':product_id', $product_id);
            $stmt->bindParam(':material_id', $material_id);
            $stmt->execute();
        }
    }

    // Associer des images à un produit
    private function associateImages($product_id, $images) {
        $query = "INSERT INTO Product_Images (product_id, image_url) VALUES (:product_id, :image_url)";
        $stmt = $this->db->prepare($query);

        foreach ($images as $image_url) {
            $stmt->bindParam(':product_id', $product_id);
            $stmt->bindParam(':image_url', $image_url['image_url']);
            $stmt->execute();
        }
    }

    // Mettre à jour les matériaux associés à un produit
    private function updateMaterials($product_id, $materials) {
        $this->deleteMaterials($product_id);
        $this->associateMaterials($product_id, $materials);
    }

    // Mettre à jour les images associées à un produit
    private function updateImages($product_id, $images) {
        $this->deleteImages($product_id);
        $this->associateImages($product_id, $images);
    }

    // Supprimer les matériaux associés à un produit
    private function deleteMaterials($product_id) {
        $query = "DELETE FROM Product_Materials WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
    }

    // Supprimer les images associées à un produit
    private function deleteImages($product_id) {
        $query = "DELETE FROM Product_Images WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
    }
}
