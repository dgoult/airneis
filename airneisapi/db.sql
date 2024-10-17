-- Création de la base de données avec l'encodage UTF-8
CREATE DATABASE airneisdb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE airneisdb;

-- Table Category (catégories de produits) avec colonne image_url
CREATE TABLE Categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  description TEXT
);

-- Table User (utilisateurs)
CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(20),
  email_verified TINYINT(1) DEFAULT 0,
  verification_token VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Users (full_name, email, password_hash, phone_number, role, email_verified, created_at) 
VALUES ('Admin User', 'admin@example.com', '$2y$10$0Kqjjo4ZrJCGKFSgpCOnsubwLv66elX4tntVXLKv6Xq10OfzGskXS', '0123456789', 'admin', 1, NOW());

-- Table Address (adresses de livraison)
CREATE TABLE Addresses (
  address_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  region VARCHAR(255),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Table Payment (données de paiement)
CREATE TABLE Payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  card_name VARCHAR(255) NOT NULL,
  card_number VARCHAR(16) NOT NULL,
  expiration_date DATE NOT NULL,
  cvv VARCHAR(4) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Table Materials (matériaux)
CREATE TABLE Materials (
  material_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

-- Table Product (produits sans JSON pour les images)
CREATE TABLE Products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  price DECIMAL(10, 2),
  stock INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  priority INT DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- Table Product_Materials (relation produit-matériaux many-to-many)
CREATE TABLE Product_Materials (
  product_id INT,
  material_id INT,
  PRIMARY KEY (product_id, material_id),
  FOREIGN KEY (product_id) REFERENCES Products(product_id),
  FOREIGN KEY (material_id) REFERENCES Materials(material_id)
);

-- Table Product_Images (relation produit-images)
CREATE TABLE Product_Images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Table Orders (représente les commandes passées)
CREATE TABLE Orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT, -- Lien avec l'utilisateur qui a commandé
  address_id INT, -- Lien avec l'adresse de livraison
  payment_id INT, -- Lien avec les informations de paiement
  product_id INT, -- Lien avec le produit commandé
  quantity INT NOT NULL, -- Quantité de produits commandée
  status ENUM('en cours', 'annulé', 'livré') DEFAULT 'en cours', -- Statut de la commande
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date de la commande
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (address_id) REFERENCES Addresses(address_id),
  FOREIGN KEY (payment_id) REFERENCES Payments(payment_id),
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Création de la table HomePatern avec gestion de l'ordre des éléments
CREATE TABLE HomePatern (
  homepatern_id INT PRIMARY KEY AUTO_INCREMENT,
  carousel_product_id INT,
  featured_category_id INT,
  highlanders_product_id INT,
  order_index INT NOT NULL, -- Pour stocker l'ordre des éléments
  FOREIGN KEY (carousel_product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (featured_category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
  FOREIGN KEY (highlanders_product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- Table Cart (panier)
CREATE TABLE Carts (
  cart_id INT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(255) NULL, -- ID de session pour les utilisateurs non connectés
  user_id INT NULL, -- ID de l'utilisateur pour les utilisateurs connectés
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Table Cart_Items (éléments du panier)
CREATE TABLE Cart_Items (
  cart_item_id INT PRIMARY KEY AUTO_INCREMENT,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES Carts(cart_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Remplir la table Categories (Catégories)
INSERT INTO Categories (name, image_url, description) 
VALUES 

('Salon', 'salon', 'Catégorie dédiée aux meubles de salon, y compris les canapés, tables basses et fauteuils.'),
('Chambre', 'chambre', 'Catégorie regroupant les lits, armoires, et tables de chevet pour la chambre.'),
('Bureau', 'bureau', 'Tout pour l’aménagement d’un espace de travail : bureaux, chaises ergonomiques, et rangements.'),
('Extérieur', 'exterieur', 'Mobilier résistant aux intempéries pour le jardin et les espaces extérieurs.'),
('Cuisine', 'cuisine', 'Catégorie pour les meubles de cuisine, comme les tables, chaises, et rangements.'),
('Salle à manger', 'salle-a-manger', 'Mobilier pour la salle à manger, comprenant tables à manger et chaises assorties.');

-- Remplir la table Materials (Matériaux)
INSERT INTO Materials (name) 
VALUES 
('Bois'), 
('Métal'), 
('Verre'), 
('Tissu'), 
('Cuir');

-- Remplir la table Products (Produits)
INSERT INTO Products (name, description, category_id, price, stock) 
VALUES 
('Canapé', 'Un canapé 3 places confortable', 1, 599.99, 30), 
('Chaise de bureau', 'Chaise de bureau ergonomique avec hauteur réglable', 3, 149.99, 50), 
('Table basse', 'Table basse en bois avec plateau en verre', 1, 199.99, 15),
('Table extérieure', 'Table extérieure résistante aux intempéries pour le jardin', 4, 349.99, 20),
('Cadre de lit', 'Cadre de lit queen size avec lattes en bois', 2, 449.99, 0);

-- Remplir la table Product_Materials (Matériaux associés aux produits)
INSERT INTO Product_Materials (product_id, material_id) 
VALUES 
(1, 4), -- Canapé en tissu
(2, 2), -- Chaise de bureau en métal
(2, 4), -- Chaise de bureau en tissu
(3, 1), -- Table basse en bois
(3, 3), -- Table basse avec plateau en verre
(4, 1), -- Table extérieure en bois
(4, 2), -- Table extérieure en métal
(5, 1); -- Cadre de lit en bois

-- Remplir la table Product_Images (Images des produits)
INSERT INTO Product_Images (product_id, image_url) 
VALUES 
(1, 'canape-1'), 
(1, 'canape-2'), 
(2, 'chaise-bureau-1'), 
(2, 'chaise-bureau-2'), 
(3, 'table-basse'), 
(4, 'table-exterieur'), 
(5, 'cadre-lit');

-- Remplir la table Users (Utilisateurs)
INSERT INTO Users (full_name, email, password_hash, phone_number, role, email_verified) 
VALUES 
('Jean Dupont', 'jeandupont@example.com', '$2y$10$0Kqjjo4ZrJCGKFSgpCOnsubwLv66elX4tntVXLKv6Xq10OfzGskXS', '0123456789', 'user', 1), 
('Marie Martin', 'mariemartin@example.com', '$2y$10$0Kqjjo4ZrJCGKFSgpCOnsubwLv66elX4tntVXLKv6Xq10OfzGskXS', '0987654321', 'user', 1);

-- Remplir la table Addresses (Adresses de livraison)
INSERT INTO Addresses (user_id, name, first_name, last_name, address_line_1, address_line_2, city, region, postal_code, country, phone_number) 
VALUES 
(1, 'Adresse principale', 'Jean', 'Dupont', '123 Rue de Paris', NULL, 'Paris', 'Île-de-France', '75001', 'France', '0123456789'),
(2, 'Adresse secondaire', 'Marie', 'Martin', '45 Boulevard Saint-Germain', NULL, 'Paris', 'Île-de-France', '75005', 'France', '0987654321');

-- Remplir la table Payments (Paiements)
INSERT INTO Payments (user_id, card_name, card_number, expiration_date, cvv) 
VALUES 
(1, 'Jean Dupont', '4111111111111111', '2025-12-31', '123'), 
(2, 'Marie Martin', '4222222222222222', '2024-11-30', '456');

-- Remplir la table Orders (Commandes)
INSERT INTO Orders (user_id, address_id, payment_id, product_id, quantity, status) 
VALUES 
(1, 1, 1, 1, 2, 'en cours'), -- Jean Dupont achète 2 canapés
(2, 2, 2, 2, 1, 'livré');    -- Marie Martin achète 1 chaise de bureau

-- Exemple d'insertion initiale
INSERT INTO HomePatern (carousel_product_id, featured_category_id, highlanders_product_id, order_index) 
VALUES 
(1, NULL, NULL, 1),  -- Premier produit dans le carousel
(2, NULL, NULL, 2),  -- Deuxième produit dans le carousel
(3, NULL, NULL, 3),  -- Troisième produit dans le carousel
(NULL, 1, NULL, 1),  -- Première catégorie en vedette
(NULL, 2, NULL, 2),  -- Deuxième catégorie en vedette
(NULL, 3, NULL, 3),  -- Troisième catégorie en vedette
(NULL, NULL, 4, 1),  -- Premier highlander
(NULL, NULL, 5, 2);  -- Deuxième highlander
