<?php
// api/config/database.php

class Database {
    private $host = "localhost";
    private $db_name = "greenwood_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        // Try reading config from environment variables (or easily change credentials here for BigRock hosting)
        if (getenv('DB_HOST')) $this->host = getenv('DB_HOST');
        if (getenv('DB_NAME')) $this->db_name = getenv('DB_NAME');
        if (getenv('DB_USER')) $this->username = getenv('DB_USER');
        if (getenv('DB_PASS')) $this->password = getenv('DB_PASS');

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            // Return JSON error
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                "error" => "Database connection failed. Please ensure database exists and schema is loaded."
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>
