<?php
require_once __DIR__ . '/../vendor/autoload.php';  // Accès à Composer autoload
require_once __DIR__ . '/../db.php';               // Connexion à la base de données

// Inclure les middlewares et les contrôleurs avec namespace
use Middleware\AdminMiddleware;
use Middleware\AuthMiddleware;
use Middleware\JwtMiddleware;
use Controllers\UserController;
use Controllers\AuthController;
use Controllers\ProductController;
use Controllers\CategoryController;
use Controllers\AddressController;
use Controllers\OrderController;
use Controllers\MaterialController;
use Controllers\PaymentController;

use Slim\Factory\AppFactory;
use Dotenv\Dotenv;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Charger les variables d'environnement du fichier .env
$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

$app = AppFactory::create();

// Middleware pour ajouter les en-têtes CORS
$app->add(function ($request, $handler) {
    // Gérer les requêtes OPTIONS
    if ($request->getMethod() === "OPTIONS") {
        $response = new \Slim\Psr7\Response();
        return $response
            ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Pour toutes les autres requêtes (GET, POST, etc.)
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200') // Autorise les requêtes de localhost:4200
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

// Grouper toutes les routes sous /api
$app->group('/api', function ($group) {

    $group->get('/assets/{filename}', function (Request $request, Response $response, $args) {
        $filename = $args['filename'];  // Le nom de fichier est passé dans l'URL
        $filePath = __DIR__ . '/../assets/' . $filename . '.png'; // Chemin vers le dossier assets
    
        if (file_exists($filePath)) {
            $imageType = mime_content_type($filePath);  // Récupère le type MIME de l'image
    
            $response = $response->withHeader('Content-Type', $imageType);
            $response->getBody()->write(file_get_contents($filePath));  // Lit le contenu du fichier et l'affiche
            return $response;
        } else {
            // Si l'image n'existe pas, retourner une réponse 404
            return $response->withStatus(405)->getBody()->write("Image non trouvée.");
        }
    });

    $group->post('/assets', function (Request $request, Response $response, $args) {
        $uploadedFiles = $request->getUploadedFiles();
    
        if (empty($uploadedFiles['image'])) {
            // Utilisation de `getBody()->write()` à la place de `write()`
            $response->getBody()->write('Aucun fichier téléchargé.');
            return $response->withStatus(400);
        }
    
        $image = $uploadedFiles['image'];
        $filename = $image->getClientFilename();
        $filePath = __DIR__ . '/../assets/' . $filename;
    
        // Sauvegarder l'image
        $image->moveTo($filePath);
    
        // Extraire le nom du fichier sans l'extension
        $fileNameWithoutExtension = pathinfo($filename, PATHINFO_FILENAME);
    
        // Utilisation de `getBody()->write()` pour la réponse
        $response->getBody()->write(json_encode($fileNameWithoutExtension));
        return $response->withStatus(201);
    });

    $group->delete('/assets/{filename}', function (Request $request, Response $response, $args) {
        $filename = $args['filename'];  // Le nom de fichier est passé dans l'URL
        $filePath = __DIR__ . '/../assets/' . $filename . '.png'; // Chemin vers le dossier assets
        
        if (file_exists($filePath)) {
            // Supprimer le fichier
            unlink($filePath);
            $response->getBody()->write(json_encode("Image supprimée avec succès."));
            return $response->withStatus(200);
        } else {
            $response->getBody()->write("Image non trouvée.");
            return $response->withStatus(404);
        }
    });

    $group->get('/token/check', function (Request $request, Response $response) {
        // Obtenir le token décodé par le middleware
        $decodedToken = $request->getAttribute('token');
    
        if ($decodedToken) {
            // Si le token est valide et n'a pas expiré
            $response->getBody()->write(json_encode(["message" => "Token valide.", "token_data" => $decodedToken]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
    
        // Si le token n'est pas valide ou a expiré, cela sera géré par le middleware
        return $response->withStatus(401);  // Non autorisé
    })->add(new JwtMiddleware());

    $group->get('/homepatern', function (Request $request, Response $response) {
        $db = new Database();
        $conn = $db->getConnection();
    
        // Récupérer les produits du carousel avec les images, en respectant l'ordre
        $carouselQuery = "
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_url) AS images
            FROM HomePatern hp
            JOIN Products p ON hp.carousel_product_id = p.product_id
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
            WHERE hp.carousel_product_id IS NOT NULL
            GROUP BY p.product_id, hp.order_index
            ORDER BY hp.order_index ASC
            LIMIT 3
        ";
        $carouselStmt = $conn->prepare($carouselQuery);
        $carouselStmt->execute();
        $carouselProducts = $carouselStmt->fetchAll(PDO::FETCH_ASSOC);
    
        // Ajouter les matériaux pour chaque produit du carousel
        foreach ($carouselProducts as &$product) {
            $materialsQuery = "
                SELECT m.material_id, m.name 
                FROM Product_Materials pm
                JOIN Materials m ON pm.material_id = m.material_id
                WHERE pm.product_id = :product_id
            ";
            $materialsStmt = $conn->prepare($materialsQuery);
            $materialsStmt->execute([':product_id' => $product['product_id']]);
            $product['materials'] = $materialsStmt->fetchAll(PDO::FETCH_ASSOC);
        }
    
        // Récupérer les catégories en vedette, en respectant l'ordre
        $featuredCategoriesQuery = "
            SELECT c.*
            FROM HomePatern hp
            JOIN Categories c ON hp.featured_category_id = c.category_id
            WHERE hp.featured_category_id IS NOT NULL
            ORDER BY hp.order_index ASC
            LIMIT 3
        ";
        $categoriesStmt = $conn->prepare($featuredCategoriesQuery);
        $categoriesStmt->execute();
        $featuredCategories = $categoriesStmt->fetchAll(PDO::FETCH_ASSOC);
    
        // Récupérer les produits highlanders avec les images, en respectant l'ordre
        $highlandersQuery = "
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_url) AS images
            FROM HomePatern hp
            JOIN Products p ON hp.highlanders_product_id = p.product_id
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
            WHERE hp.highlanders_product_id IS NOT NULL
            GROUP BY p.product_id, hp.order_index
            ORDER BY hp.order_index ASC
        ";
        $highlandersStmt = $conn->prepare($highlandersQuery);
        $highlandersStmt->execute();
        $highlandersProducts = $highlandersStmt->fetchAll(PDO::FETCH_ASSOC);
    
        // Ajouter les matériaux pour chaque produit highlander
        foreach ($highlandersProducts as &$product) {
            $materialsQuery = "
                SELECT m.material_id, m.name 
                FROM Product_Materials pm
                JOIN Materials m ON pm.material_id = m.material_id
                WHERE pm.product_id = :product_id
            ";
            $materialsStmt = $conn->prepare($materialsQuery);
            $materialsStmt->execute([':product_id' => $product['product_id']]);
            $product['materials'] = $materialsStmt->fetchAll(PDO::FETCH_ASSOC);
        }
    
        // Préparer la réponse sous forme d'objet avec les 3 sections
        $responseData = [
            'carouselProducts' => $carouselProducts,
            'featuredCategories' => $featuredCategories,
            'highlandersProducts' => $highlandersProducts
        ];
    
        $response->getBody()->write(json_encode($responseData));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $group->get('/products/{id}/similar', function (Request $request, Response $response, $args) {
        $db = new Database();
        $conn = $db->getConnection();
        
        $productId = $args['id'];
        
        // Obtenir la catégorie du produit principal
        $categoryQuery = "SELECT category_id FROM Products WHERE product_id = :product_id";
        $stmt = $conn->prepare($categoryQuery);
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();
        $category = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$category) {
            $response->getBody()->write(json_encode(["message" => "Produit non trouvé."]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
    
        $categoryId = $category['category_id'];
    
        // Récupérer les produits similaires (même catégorie, aléatoire, en stock de préférence)
        $similarProductsQuery = "
            SELECT p.*, GROUP_CONCAT(pi.image_id) AS image_ids, GROUP_CONCAT(pi.image_url) AS image_urls
            FROM Products p
            LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
            WHERE p.category_id = :category_id AND p.product_id != :product_id
            GROUP BY p.product_id
            ORDER BY p.stock > 0 DESC, RAND() 
            LIMIT 6
        ";
        $stmt = $conn->prepare($similarProductsQuery);
        $stmt->bindParam(':category_id', $categoryId);
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();
        $similarProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        // Ajouter les matériaux et structurer les images pour chaque produit
        foreach ($similarProducts as &$product) {
            // Récupérer les matériaux
            $materialQuery = "
                SELECT m.material_id, m.name
                FROM Product_Materials pm
                JOIN Materials m ON pm.material_id = m.material_id
                WHERE pm.product_id = :product_id
            ";
            $stmt = $conn->prepare($materialQuery);
            $stmt->bindParam(':product_id', $product['product_id']);
            $stmt->execute();
            $product['materials'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Structurer les images
            $imageIds = explode(',', $product['image_ids']);
            $imageUrls = explode(',', $product['image_urls']);
            $product['images'] = [];
    
            foreach ($imageIds as $index => $imageId) {
                if (!empty($imageId)) {
                    $product['images'][] = [
                        'image_id' => $imageId,
                        'image_url' => $imageUrls[$index]
                    ];
                }
            }
    
            // Supprimer les champs intermédiaires pour une réponse propre
            unset($product['image_ids']);
            unset($product['image_urls']);
        }
    
        $response->getBody()->write(json_encode($similarProducts));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    // Route de test pour vérifier que l'API fonctionne
    $group->get('/test', function ($request, $response, $args) {
        $test = password_hash('adminpassword', PASSWORD_BCRYPT);
        $test2 = password_verify('adminpassword', $test);
        $response->getBody()->write("API fonctionne correctement ! Vérification : $test2 | Hash : $test");
        return $response->withHeader('Content-Type', 'text/plain');
    });

    // Route de connexion
    $group->post('/login', [AuthController::class, 'login']);
    $group->post('/register', [AuthController::class, 'register']);
    $group->get('/email_confirm', [AuthController::class, 'confirmEmail']);

    $group->get('/products', [ProductController::class, 'getAllProducts']);
    $group->get('/products/{id}', [ProductController::class, 'getProduct']);
    $group->get('/categories', [CategoryController::class, 'getAllCategories']);
    $group->get('/categories/{id}', [CategoryController::class, 'getCategory']);
    $group->get('/materials', [MaterialController::class, 'getAllMaterials']);


    // Routes protégées par le middleware Admin
    $group->group('/admin', function ($adminGroup) {
        $adminGroup->post('/categories/priority/{id}', [CategoryController::class, 'setCategoryPriorityProducts']);

        //Post de la page d'accueil
        $adminGroup->post('/homepatern', function (Request $request, Response $response) {
            $data = json_decode($request->getBody()->getContents(), true);
            $db = new Database();
            $conn = $db->getConnection();
        
            // Supprimer les anciens éléments de la table HomePatern
            $conn->exec("DELETE FROM HomePatern");
        
            // Insertion des nouveaux éléments avec leur ordre
            $insertQuery = "
                INSERT INTO HomePatern (carousel_product_id, featured_category_id, highlanders_product_id, order_index)
                VALUES (:carousel_product_id, :featured_category_id, :highlanders_product_id, :order_index)
            ";
        
            $stmt = $conn->prepare($insertQuery);
        
            // Sauvegarder les produits du carousel
            foreach ($data['carouselProducts'] as $index => $carouselProductId) {
                $stmt->execute([
                    ':carousel_product_id' => $carouselProductId,
                    ':featured_category_id' => null,
                    ':highlanders_product_id' => null,
                    ':order_index' => $index + 1  // Indexation commence à 1
                ]);
            }
        
            // Sauvegarder les catégories en vedette
            foreach ($data['featuredCategories'] as $index => $categoryId) {
                $stmt->execute([
                    ':carousel_product_id' => null,
                    ':featured_category_id' => $categoryId,
                    ':highlanders_product_id' => null,
                    ':order_index' => $index + 1  // Indexation commence à 1
                ]);
            }
        
            // Sauvegarder les produits highlanders
            foreach ($data['highlandersProducts'] as $index => $highlanderProductId) {
                $stmt->execute([
                    ':carousel_product_id' => null,
                    ':featured_category_id' => null,
                    ':highlanders_product_id' => $highlanderProductId,
                    ':order_index' => $index + 1  // Indexation commence à 1
                ]);
            }
        
            $response->getBody()->write(json_encode(['message' => 'HomePatern saved successfully']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        });
        
        // Routes pour gérer les utilisateurs
        $adminGroup->get('/users', [UserController::class, 'getAllUsers']);
        $adminGroup->get('/users/{id}', [UserController::class, 'getUser']);
        $adminGroup->post('/users', [UserController::class, 'createUser']);
        $adminGroup->put('/users/{id}', [UserController::class, 'updateUser']);
        $adminGroup->delete('/users/{id}', [UserController::class, 'deleteUser']);

        // Routes pour gérer les adresses d'un utilisateur
        $adminGroup->get('/addresses/{user_id}', [AddressController::class, 'getAllAddresses']);
        $adminGroup->get('/addresses_select/{user_id}', [AddressController::class, 'getAddressesForSelect']);
        $adminGroup->post('/addresses/{user_id}', [AddressController::class, 'createAddress']);
        $adminGroup->put('/addresses/{user_id}/{address_id}', [AddressController::class, 'updateAddress']);
        $adminGroup->delete('/addresses/{user_id}/{address_id}', [AddressController::class, 'deleteAddress']);
        
        // Routes pour gérer les paiements d'un utilisateur
        $adminGroup->get('/payments/{user_id}', [PaymentController::class, 'getAllPayments']);
        $adminGroup->post('/payments/{user_id}', [PaymentController::class, 'createPayment']);
        $adminGroup->put('/payments/{user_id}/{payment_id}', [PaymentController::class, 'updatePayment']);
        $adminGroup->delete('/payments/{user_id}/{payment_id}', [PaymentController::class, 'deletePayment']);

        // Routes pour gérer les matériaux
        $adminGroup->get('/materials', [MaterialController::class, 'getAllMaterials']);
        $adminGroup->get('/materials/{id}', [MaterialController::class, 'getMaterial']);
        $adminGroup->post('/materials', [MaterialController::class, 'createMaterial']);
        $adminGroup->put('/materials/{id}', [MaterialController::class, 'updateMaterial']);
        $adminGroup->delete('/materials/{id}', [MaterialController::class, 'deleteMaterial']);

        // Routes pour gérer les catégories
        $adminGroup->get('/categories', [CategoryController::class, 'getAllCategories']);
        $adminGroup->get('/categories/{id}', [CategoryController::class, 'getCategory']);
        $adminGroup->post('/categories', [CategoryController::class, 'createCategory']);
        $adminGroup->put('/categories/{id}', [CategoryController::class, 'updateCategory']);
        $adminGroup->delete('/categories/{id}', [CategoryController::class, 'deleteCategory']);

        // Routes pour gérer les produits
        $adminGroup->get('/products', [ProductController::class, 'getAllProducts']);
        $adminGroup->get('/products/{id}', [ProductController::class, 'getProduct']);
        $adminGroup->post('/products', [ProductController::class, 'createProduct']);
        $adminGroup->put('/products/{id}', [ProductController::class, 'updateProduct']);
        $adminGroup->delete('/products/{id}', [ProductController::class, 'deleteProduct']);

        // Routes pour gérer les commandes
        $adminGroup->get('/orders', [OrderController::class, 'getAllOrders']);
        $adminGroup->get('/orders/{id}', [OrderController::class, 'getOrder']);
        $adminGroup->post('/orders', [OrderController::class, 'createOrder']);
        $adminGroup->put('/orders/{id}', [OrderController::class, 'updateOrder']);
        $adminGroup->put('/orders/status/{id}', [OrderController::class, 'updateOrderStatus']); // Mettre à jour le statut
        $adminGroup->delete('/orders/{id}', [OrderController::class, 'deleteOrder']);
    })->add(new AdminMiddleware());

    // Routes protégées pour gérer les adresses de l'utilisateur
    $group->group('/client', function ($clientGroup) {
        // Routes pour gérer les adresses d'un utilisateur
        $clientGroup->get('/addresses/{user_id}', [AddressController::class, 'getAllAddresses']);
        $clientGroup->get('/addresses_select/{user_id}', [AddressController::class, 'getAddressesForSelect']);
        $clientGroup->post('/addresses/{user_id}', [AddressController::class, 'createAddress']);
        $clientGroup->put('/addresses/{user_id}/{address_id}', [AddressController::class, 'updateAddress']);
        $clientGroup->delete('/addresses/{user_id}/{address_id}', [AddressController::class, 'deleteAddress']);

        // Routes pour gérer les paiements d'un utilisateur
        $clientGroup->get('/payments/{user_id}', [PaymentController::class, 'getAllPayments']);
        $clientGroup->post('/payments/{user_id}', [PaymentController::class, 'createPayment']);
        $clientGroup->put('/payments/{user_id}/{payment_id}', [PaymentController::class, 'updatePayment']);
        $clientGroup->delete('/payments/{user_id}/{payment_id}', [PaymentController::class, 'deletePayment']);
        
        $clientGroup->post('/orders', [OrderController::class, 'createOrder']);
    })->add(new AuthMiddleware());  // Protection via authentification

    $group->group('/cart', function ($groupCart) {
        //Get du cart
        $groupCart->get('', function (Request $request, Response $response) {
            $db = new Database();
            $conn = $db->getConnection();
        
            // Récupérer les paramètres de la requête (session_id ou user_id)
            $queryParams = $request->getQueryParams();
            $session_id = $queryParams['session_id'] ?? null;
            $user_id = $queryParams['user_id'] ?? null;
        
            // Valider la requête pour s'assurer qu'au moins session_id ou user_id est fourni
            if (!$session_id && !$user_id) {
                $response->getBody()->write(json_encode(['message' => 'session_id ou user_id est requis.']));
                return $response->withStatus(400);
            }
        
            // Préparer la requête pour récupérer le panier
            $cartQuery = "
                SELECT c.cart_id, c.session_id, c.user_id, ci.cart_item_id, ci.product_id, ci.quantity, 
                       p.name, p.description, p.price, 
                       GROUP_CONCAT(pi.image_url) AS images
                FROM Carts c
                LEFT JOIN Cart_Items ci ON c.cart_id = ci.cart_id
                LEFT JOIN Products p ON ci.product_id = p.product_id
                LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
                WHERE (c.session_id = :session_id OR c.user_id = :user_id)
                GROUP BY c.cart_id, c.session_id, c.user_id, ci.cart_item_id, ci.product_id, ci.quantity, p.name, p.description, p.price
            ";
        
            $stmt = $conn->prepare($cartQuery);
            $stmt->bindParam(':session_id', $session_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
        
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
            // Si aucun élément trouvé, retourner un panier vide
            if (empty($cartItems)) {
        
                $response->getBody()->write(json_encode(['items' => [], 'total_items' => 0, 'total_price' => 0]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
            }
        
            // Organiser les données du panier
            $total_price = 0;
            $items = [];
            foreach ($cartItems as $item) {
                $total_price += $item['price'] * $item['quantity'];
                $items[] = [
                    'cart_item_id' => $item['cart_item_id'],
                    'product_id' => $item['product_id'],
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['price'] * $item['quantity'],
                    'images' => array_filter(explode(',', $item['images']))
                ];
            }
        
            // Construire la réponse finale
            $responseData = [
                'cart_id' => $cartItems[0]['cart_id'],
                'session_id' => $session_id,
                'user_id' => $user_id,
                'items' => $items,
                'total_items' => count($items),
                'total_price' => $total_price
            ];
        
            $response->getBody()->write(json_encode($responseData));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        });
        
        // Créer un panier ou récupérer un panier existant
        $groupCart->post('', function (Request $request, Response $response) {
            $data = json_decode($request->getBody()->getContents(), true);
            $db = new Database();
            $conn = $db->getConnection();
    
            $sessionId = $data['session_id'] ?? null;
            $userId = $data['user_id'] ?? null;
    
            // Rechercher un panier existant
            $query = "SELECT * FROM Carts WHERE session_id = :session_id OR user_id = :user_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':session_id' => $sessionId, ':user_id' => $userId]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$cart) {
                // Créer un nouveau panier
                $query = "INSERT INTO Carts (session_id, user_id) VALUES (:session_id, :user_id)";
                $stmt = $conn->prepare($query);
                $stmt->execute([':session_id' => $sessionId, ':user_id' => $userId]);
                $cartId = $conn->lastInsertId();
                $cart = ['cart_id' => $cartId, 'session_id' => $sessionId, 'user_id' => $userId];
            }
    
            $response->getBody()->write(json_encode($cart));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        });
    
        // Ajouter un produit au panier
        $groupCart->post('/add', function (Request $request, Response $response) {
            $data = json_decode($request->getBody()->getContents(), true);
            $db = new Database();
            $conn = $db->getConnection();

            $cartId = $data['cart_id'] ?? null;
            $sessionId = $data['session_id'] ?? null;
            $userId = $data['user_id'] ?? null;
            $productId = $data['product_id'];
            $quantity = $data['quantity'];

            // Si aucun cartId n'est fourni, créer ou récupérer un panier
            if (!$cartId) {
                // Rechercher un panier existant pour cette session_id ou user_id
                $query = "SELECT * FROM Carts WHERE session_id = :session_id OR user_id = :user_id LIMIT 1";
                $stmt = $conn->prepare($query);
                $stmt->execute([':session_id' => $sessionId, ':user_id' => $userId]);
                $cart = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$cart) {
                    // Créer un nouveau panier s'il n'existe pas
                    $query = "INSERT INTO Carts (session_id, user_id) VALUES (:session_id, :user_id)";
                    $stmt = $conn->prepare($query);
                    $stmt->execute([':session_id' => $sessionId, ':user_id' => $userId]);
                    $cartId = $conn->lastInsertId();
                } else {
                    $cartId = $cart['cart_id'];
                }
            }

            // Vérifier si le produit est déjà dans le panier
            $query = "SELECT * FROM Cart_Items WHERE cart_id = :cart_id AND product_id = :product_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':cart_id' => $cartId, ':product_id' => $productId]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($cartItem) {
                // Mettre à jour la quantité
                $query = "UPDATE Cart_Items SET quantity = quantity + :quantity WHERE cart_item_id = :cart_item_id";
                $stmt = $conn->prepare($query);
                $stmt->execute([':quantity' => $quantity, ':cart_item_id' => $cartItem['cart_item_id']]);
            } else {
                // Ajouter le produit au panier
                $query = "INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (:cart_id, :product_id, :quantity)";
                $stmt = $conn->prepare($query);
                $stmt->execute([':cart_id' => $cartId, ':product_id' => $productId, ':quantity' => $quantity]);
            }

            $response->getBody()->write(json_encode(["message" => "Produit ajouté au panier"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        });
    
        // Modifier la quantité d'un produit dans le panier
        $groupCart->put('/update', function (Request $request, Response $response) {
            $data = json_decode($request->getBody()->getContents(), true);
            $db = new Database();
            $conn = $db->getConnection();
    
            $cartItemId = $data['cart_item_id'];
            $quantity = $data['quantity'];
    
            $query = "UPDATE Cart_Items SET quantity = :quantity WHERE cart_item_id = :cart_item_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':quantity' => $quantity, ':cart_item_id' => $cartItemId]);
    
            $response->getBody()->write(json_encode(["message" => "Quantité mise à jour"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        });
    
        // Supprimer un produit du panier
        $groupCart->delete('/remove/{cart_item_id}', function (Request $request, Response $response, $args) {
            $db = new Database();
            $conn = $db->getConnection();

            $cartItemId = $args['cart_item_id'] ?? null;

            if (!$cartItemId) {
                $response->getBody()->write(json_encode(["message" => "Identifiant d'article de panier requis."]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
            }

            // Obtenir les détails du cart_item avant de procéder
            $query = "SELECT cart_id, quantity FROM Cart_Items WHERE cart_item_id = :cart_item_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':cart_item_id' => $cartItemId]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$cartItem) {
                $response->getBody()->write(json_encode(["message" => "Article non trouvé dans le panier."]));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
            }

            $cartId = $cartItem['cart_id'];
            $quantity = $cartItem['quantity'];

            if ($quantity > 1) {
                // Si la quantité est supérieure à 1, décrémenter de 1
                $query = "UPDATE Cart_Items SET quantity = quantity - 1 WHERE cart_item_id = :cart_item_id";
                $stmt = $conn->prepare($query);
                $stmt->execute([':cart_item_id' => $cartItemId]);
            } else {
                // Si la quantité est 1, supprimer l'article
                $query = "DELETE FROM Cart_Items WHERE cart_item_id = :cart_item_id";
                $stmt = $conn->prepare($query);
                $stmt->execute([':cart_item_id' => $cartItemId]);
            }

            // Vérifier s'il reste des articles dans le panier
            $query = "SELECT COUNT(*) as item_count FROM Cart_Items WHERE cart_id = :cart_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':cart_id' => $cartId]);
            $itemCount = $stmt->fetch(PDO::FETCH_ASSOC)['item_count'];

            // Si aucun article n'est présent, supprimer le panier
            if ($itemCount == 0) {
                $query = "DELETE FROM Carts WHERE cart_id = :cart_id";
                $stmt = $conn->prepare($query);
                $stmt->execute([':cart_id' => $cartId]);
            }

            $response->getBody()->write(json_encode(["message" => "Produit supprimé du panier"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        });
    });
});

$app->run();