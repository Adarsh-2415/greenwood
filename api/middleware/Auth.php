<?php
// api/middleware/Auth.php
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';

class Auth {
    public static function authenticate() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

        if (empty($authHeader)) {
            // Check lowercase as well
            $authHeader = isset($headers['authorization']) ? $headers['authorization'] : '';
        }

        if (empty($authHeader)) {
            Response::json(['error' => 'Authorization header missing'], 401);
        }

        // Match "Bearer <token>"
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
            $decoded = JWT::decode($jwt);

            if ($decoded) {
                return $decoded; // Returns payload: ['userId' => ..., 'email' => ..., 'role' => ...]
            }
        }

        Response::json(['error' => 'Access denied. Invalid or expired token.'], 401);
    }
}
?>
