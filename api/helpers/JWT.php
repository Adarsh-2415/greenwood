<?php
// api/helpers/JWT.php

class JWT {
    private static $secret = "greenwood_secret_key_1234567890_change_in_prod";

    private static function getSecret() {
        if (!empty(getenv('JWT_SECRET'))) {
            return getenv('JWT_SECRET');
        }
        if (!empty($_ENV['JWT_SECRET'])) {
            return $_ENV['JWT_SECRET'];
        }
        if (!empty($_SERVER['JWT_SECRET'])) {
            return $_SERVER['JWT_SECRET'];
        }
        return self::$secret;
    }

    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::getSecret(), true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            return false;
        }

        $header = base64_decode(self::base64UrlDecode($tokenParts[0]));
        $payload = base64_decode(self::base64UrlDecode($tokenParts[1]));
        $signatureProvided = $tokenParts[2];

        // Check expiration
        $payloadObj = json_decode($payload, true);
        if (isset($payloadObj['exp']) && $payloadObj['exp'] < time()) {
            return false;
        }

        // Validate signature
        $base64UrlHeader = $tokenParts[0];
        $base64UrlPayload = $tokenParts[1];
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::getSecret(), true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if ($base64UrlSignature === $signatureProvided) {
            return $payloadObj;
        }

        return false;
    }

    private static function base64UrlEncode($text) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
    }

    private static function base64UrlDecode($text) {
        return str_replace(['-', '_'], ['+', '/'], $text);
    }
}
?>
