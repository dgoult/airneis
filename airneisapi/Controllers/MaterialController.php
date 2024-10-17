<?php

namespace Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MaterialController {
    private $db;

    public function __construct() {
        $database = new \Database();
        $this->db = $database->getConnection();
    }

    // Récupérer tous les matériaux
    public function getAllMaterials(Request $request, Response $response, $args) {
        $query = "SELECT * FROM Materials";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $materials = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($materials));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Récupérer un matériau par son ID
    public function getMaterial(Request $request, Response $response, $args) {
        $material_id = $args['id'];

        $query = "SELECT * FROM Materials WHERE material_id = :material_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':material_id', $material_id);
        $stmt->execute();
        $material = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$material) {
            $response->getBody()->write(json_encode(["message" => "Matériau non trouvé."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $response->getBody()->write(json_encode($material));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Créer un nouveau matériau
    public function createMaterial(Request $request, Response $response, $args) {
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "INSERT INTO Materials (name) VALUES (:name)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->execute();

        $material_id = $this->db->lastInsertId();

        $response->getBody()->write(json_encode($this->getMaterialById($material_id)));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // Mettre à jour un matériau existant
    public function updateMaterial(Request $request, Response $response, $args) {
        $material_id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);

        $query = "UPDATE Materials SET name = :name WHERE material_id = :material_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':material_id', $material_id);
        $stmt->execute();

        $response->getBody()->write(json_encode($this->getMaterialById($material_id)));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Méthode pour récupérer un produit par son ID
    private function getMaterialById($material_id) {
        $query = "SELECT * FROM Materials WHERE material_id = :material_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':material_id', $material_id);
        $stmt->execute();
        $material = $stmt->fetch(\PDO::FETCH_ASSOC);

        return $material;
    }

    // Supprimer un matériau
    public function deleteMaterial(Request $request, Response $response, $args) {
        $material_id = $args['id'];
    
        // Vérifier si des produits sont associés à cette catégorie
        $checkProductsQuery = "SELECT COUNT(*) as product_count FROM Product_Materials WHERE material_id = :material_id";
        $stmt = $this->db->prepare($checkProductsQuery);
        $stmt->bindParam(':material_id', $material_id);
        $stmt->execute();
        $productCount = $stmt->fetchColumn();
    
        if ($productCount > 0) {
            $response->getBody()->write(json_encode(["message" => "Impossible de supprimer ce matériaux car des produits lui sont encore associés."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    
        // Supprimer la catégorie
        $deleteMaterialQuery = "DELETE FROM Materials WHERE material_id = :material_id";
        $stmt = $this->db->prepare($deleteMaterialQuery);
        $stmt->bindParam(':material_id', $material_id);
        $stmt->execute();
    
        $response->getBody()->write(json_encode(["message" => "Matériau supprimée avec succès."]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
