-- Création de la base de données avec l'encodage UTF-8
CREATE DATABASE airneisdb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE airneisdb;

-- Table Category (catégories de produits)
CREATE TABLE Categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

-- Table User (utilisateurs)
CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Address (adresses de livraison)
CREATE TABLE Addresses (
  address_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
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

-- Table Stock_Movement (représente les commandes passées)
CREATE TABLE Stock_Movements (
  movement_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT, -- Lien avec l'utilisateur qui a commandé
  address_id INT, -- Lien avec l'adresse de livraison
  payment_id INT, -- Lien avec les informations de paiement
  quantity INT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (address_id) REFERENCES Addresses(address_id),
  FOREIGN KEY (payment_id) REFERENCES Payments(payment_id)
);