# Projet Airneis

## Sommaire
- [Introduction](#introduction)
- [Manuel d'Installation](#manuel-dinstallation)
  - [Pré-requis](#pré-requis)
  - [Instructions d'Installation](#instructions-dinstallation)
- [Manuel Utilisateur](#manuel-utilisateur)
  - [Fonctionnalités](#fonctionnalités)
  - [Utilisation](#utilisation)
- [Configuration](#configuration)
- [Endpoints de l'API](#endpoints-de-lapi)
- [Licence](#licence)

## Introduction
Le projet Airneis est une solution complète pour gérer un site de e-commerce, développée en utilisant AdonisJS pour le backend (`airneisapi`) et Angular pour le frontend (`airneisapp`). Il permet la gestion des utilisateurs, produits, commandes et paiements, avec une interface intuitive et des fonctionnalités robustes pour un site marchand.

## Manuel d'Installation

### Pré-requis
- Node.js (version recommandée : 16.x)
- PHP (version recommandée : 8.x)
- MySQL Server
- Git (pour cloner le dépôt)
- Un outil de gestion des dépendances (npm ou yarn)

### Instructions d'Installation

1. Cloner le dépôt :
   ```bash
   git clone <URL_DU_DÉPÔT>
   cd airneis
   
2. Configurer la base de données :
   Créez une base de données MySQL appelée ``airneisdb``.
    Importez le script SQL fourni dans airneis/airneisapi pour faire le tout :

   ```bash
   mysql -u root -p airneisdb < airneis/airneisapi/airneisdb.sql

3. Configurer les fichiers `.env` et propriétés `baseUrl` :
   - Renommez le fichier `.env.example` en `.env` dans le dossier `airneis/airneisapi`.
   - Modifiez les variables dans le fichier `.env` pour configurer la connexion à la base de données :
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=<votre_mot_de_passe>
     DB_NAME=airneisdb
     ```
   - Assurez-vous que les propriétés commençant par `baseUrl` dans les fichiers de configuration de `airneis/airneisapp` pointent vers l'URL correcte de l'API.

4. Installer les dépendances pour le backend :
   ```bash
   cd airneis/airneisapi
   composer install

5. Installer les dépendances pour le frontend :

   ```bash
   cd ../airneisapp
   npm install

6. Démarrer le serveur backend :  
   Dans le répertoire `airneis/airneisapi`, exécutez la commande suivante :

   ```bash
   php -S localhost:8000 -t public

7. Démarrer le serveur frontend :  
   Dans le répertoire `airneis/airneisapp`, exécutez la commande suivante :

   ```bash
   npm start

## Manuel Utilisateur

### Fonctionnalités
- Gestion des utilisateurs : Inscription, connexion, gestion des profils, et authentification.
- Gestion des produits : CRUD pour les produits, gestion des stocks et des matériaux.
- Système de paiement : Ajout, mise à jour et gestion des informations de paiement.
- Gestion des commandes : Création et gestion des commandes, suivi du statut.

### Utilisation
1. **Inscription et Connexion** : Les utilisateurs peuvent créer un compte ou se connecter pour accéder aux fonctionnalités du site.
2. **Gestion des produits** : Parcourir les produits, consulter les détails, ajouter au panier, et passer commande.
3. **Paiements sécurisés** : Ajouter et gérer des informations de paiement pour les commandes.
4. **Suivi des commandes** : Voir les commandes passées et leur statut en temps réel.

## Configuration
Toutes les configurations spécifiques, y compris les paramètres de base de données et les clés d'API, se trouvent dans le fichier `.env`.

## Exemples Endpoints de l'API

| Méthode | Endpoint            | Description                       |
|---------|----------------------|-----------------------------------|
| POST    | `/api/register`      | Créer un nouvel utilisateur       |
| POST    | `/api/login`         | Connecter un utilisateur          |
| GET     | `/api/products`      | Récupérer la liste des produits   |
| POST    | `/api/orders`        | Créer une nouvelle commande       |
| PUT     | `/api/payments/:id`  | Mettre à jour un paiement         |

## Licence
Ce projet est sous aucune licence.

