<?php
// api/helpers/Response.php

class Response {
    public static function json($data, $status = 200) {
        // Clear any previous output buffers
        if (ob_get_length()) ob_clean();

        // CORS Headers
        header("Access-Control-Allow-Origin: *"); // Adjust in production to the specific domain
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        // Set response code
        http_response_code($status);

        // Output JSON
        echo json_encode($data);
        exit();
    }
}
?>
