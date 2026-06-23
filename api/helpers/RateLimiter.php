<?php
// api/helpers/RateLimiter.php

class RateLimiter {
    /**
     * Check if the rate limit is exceeded for a given key.
     * 
     * @param string $key Identifier for the action (e.g. 'login', 'contact')
     * @param int $limit Maximum allowed attempts
     * @param int $seconds Time frame in seconds
     * @return bool True if within limits, False if rate limit exceeded
     */
    public static function check($key, $limit, $seconds) {
        $dir = __DIR__ . '/../rate_limits/';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        
        $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        // Handle proxies (e.g. Cloudflare, load balancers)
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipParts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ipParts[0]);
        }
        
        $file = $dir . md5($key . '_' . $ip) . '.json';
        $now = time();
        $attempts = [];
        
        if (file_exists($file)) {
            $data = json_decode(@file_get_contents($file), true);
            if (is_array($data)) {
                foreach ($data as $timestamp) {
                    if ($now - $timestamp < $seconds) {
                        $attempts[] = $timestamp;
                    }
                }
            }
        }
        
        if (count($attempts) >= $limit) {
            return false;
        }
        
        $attempts[] = $now;
        @file_put_contents($file, json_encode($attempts));
        return true;
    }
}
?>
