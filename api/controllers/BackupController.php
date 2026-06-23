<?php
// api/controllers/BackupController.php
require_once __DIR__ . '/../helpers/Response.php';

class BackupController {
    private $db;
    private $backupDir;

    public function __construct($db) {
        $this->db = $db;
        $this->backupDir = __DIR__ . '/../backups/';
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }

    // Admin: List all available sql backups
    public function listBackups() {
        $files = glob($this->backupDir . '*.sql');
        $backups = [];
        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'created_at' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }
        
        // Sort newest first
        usort($backups, function($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        Response::json($backups);
    }

    // Admin: Create database backup file
    public function createBackup() {
        try {
            $tables = [];
            // Get all tables
            $stmt = $this->db->query("SHOW TABLES");
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                $tables[] = $row[0];
            }

            $sql = "-- Greenwood Database Backup\n";
            $sql .= "-- Generated on " . date('Y-m-d H:i:s') . "\n\n";
            $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

            foreach ($tables as $table) {
                // Get create table statement
                $createStmt = $this->db->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_NUM);
                $sql .= "DROP TABLE IF EXISTS `$table`;\n";
                $sql .= $createStmt[1] . ";\n\n";

                // Get table records
                $dataStmt = $this->db->query("SELECT * FROM `$table`");
                while ($row = $dataStmt->fetch(PDO::FETCH_ASSOC)) {
                    $keys = array_keys($row);
                    $values = array_values($row);
                    
                    $escapedValues = array_map(function($val) {
                        if ($val === null) return 'NULL';
                        return $this->db->quote($val);
                    }, $values);

                    $sql .= "INSERT INTO `$table` (`" . implode("`, `", $keys) . "`) VALUES (" . implode(", ", $escapedValues) . ");\n";
                }
                $sql .= "\n";
            }
            $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

            $filename = 'backup_' . date('Ymd_His') . '_' . uniqid() . '.sql';
            file_put_contents($this->backupDir . $filename, $sql);

            Response::json([
                'message' => 'Backup created successfully',
                'filename' => $filename
            ]);

        } catch (Exception $e) {
            Response::json(['error' => 'Backup generation failed: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Download a backup file
    public function downloadBackup($filename) {
        $filePath = $this->backupDir . basename($filename);
        if (!file_exists($filePath) || strpos($filename, '..') !== false) {
            Response::json(['error' => 'Backup file not found'], 404);
        }

        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filePath));
        
        // Output file directly
        readfile($filePath);
        exit();
    }

    // Admin: Restore database from SQL
    public function restoreBackup() {
        $filename = isset($_POST['filename']) ? trim($_POST['filename']) : '';
        $filePath = '';

        if (!empty($filename)) {
            $filePath = $this->backupDir . basename($filename);
        } else if (isset($_FILES['sql_file']) && $_FILES['sql_file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['sql_file'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if ($ext !== 'sql') {
                Response::json(['error' => 'Only .sql backup files are allowed'], 400);
            }
            $filePath = $file['tmp_name'];
        }

        if (empty($filePath) || !file_exists($filePath)) {
            Response::json(['error' => 'No valid SQL backup file provided'], 400);
        }

        try {
            $sqlContent = file_get_contents($filePath);
            
            // Execute multi-query using PDO exec with emulation enabled
            $this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, 1);
            $this->db->exec($sqlContent);
            $this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, 0);

            Response::json(['message' => 'Database restored successfully']);
        } catch (Exception $e) {
            Response::json(['error' => 'Restoration failed: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Delete a backup file
    public function deleteBackup($filename) {
        $filePath = $this->backupDir . basename($filename);
        if (file_exists($filePath) && strpos($filename, '..') === false) {
            unlink($filePath);
            Response::json(['message' => 'Backup file deleted successfully']);
        } else {
            Response::json(['error' => 'Backup file not found'], 404);
        }
    }
}
?>
