<?php
// api/test_conn.php
header('Content-Type: text/plain');
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "--- Greenwood CMS Database Diagnostic ---\n\n";

require_once __DIR__ . '/config/database.php';

try {
    echo "Attempting database connection...\n";
    $dbClass = new Database();
    $db = $dbClass->getConnection();
    
    if ($db) {
        echo "SUCCESS: Connected to the database successfully!\n\n";
        
        echo "Verifying tables list:\n";
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($tables)) {
            echo "WARNING: Connection worked, but no tables were found! Make sure to import schema.sql.\n";
        } else {
            echo "Found tables:\n";
            foreach ($tables as $table) {
                echo " - $table\n";
            }
        }
    } else {
        echo "ERROR: getConnection() returned null.\n";
    }
} catch (Exception $e) {
    echo "ERROR: Connection failed!\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
}
?>
