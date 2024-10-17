<?php
require_once __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

class Database {
    private $conn;

    public function __construct() {
        $dotenv = Dotenv::createImmutable(__DIR__);
        $dotenv->load();
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'], 
                $_ENV['DB_USER'], 
                $_ENV['DB_PASS']
            );
            $this->conn->exec("set names utf8");
        } catch (PDOException $exception) {
            echo "Erreur de connexion : " . $exception->getMessage();
        }

        return $this->conn;
    }
}