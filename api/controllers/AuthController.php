<?php
// api/controllers/AuthController.php
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/RateLimiter.php';

class AuthController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function login() {
        if (!RateLimiter::check('login', 5, 900)) {
            Response::json(['error' => 'Too many login attempts. Please try again in 15 minutes.'], 429);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? trim($data['password']) : '';

        if (empty($email) || empty($password)) {
            Response::json(['error' => 'Email and password are required'], 400);
        }

        // Seed a default admin if users table is empty
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM users");
        $res = $stmt->fetch();
        if ($res['count'] == 0) {
            $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
            $seedStmt = $this->db->prepare(
                "INSERT INTO users (name, email, password, role) VALUES ('Super Admin', 'admin@greenwood.edu', ?, 'super_admin')"
            );
            $seedStmt->execute([$hashedPassword]);
        }

        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Update last login
            $updateStmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);

            // Create JWT Token
            $payload = [
                'userId' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'exp' => time() + (24 * 60 * 60) // 24 hours expiry
            ];
            $token = JWT::encode($payload);

            Response::json([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            Response::json(['error' => 'Invalid email or password'], 401);
        }
    }

    public function me($currentUser) {
        // Token is already verified by middleware, return user details
        Response::json([
            'user' => [
                'id' => $currentUser['userId'],
                'name' => $currentUser['name'],
                'email' => $currentUser['email'],
                'role' => $currentUser['role']
            ]
        ]);
    }

    // Request password reset link (forgot password)
    public function forgotPassword() {
        if (!RateLimiter::check('forgot_password', 3, 3600)) {
            Response::json(['error' => 'Too many password reset requests. Please try again in an hour.'], 429);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $email = isset($data['email']) ? trim($data['email']) : '';

        if (empty($email)) {
            Response::json(['error' => 'Email is required'], 400);
        }

        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Secure response: do not reveal whether the email exists or not
            Response::json(['message' => 'If this email exists, a password reset link has been sent.']);
            exit();
        }

        $token = bin2hex(random_bytes(16));
        $expiry = date('Y-m-d H:i:s', time() + 3600); // 1 hour validity

        $updateStmt = $this->db->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?");
        $updateStmt->execute([$token, $expiry, $user['id']]);

        // Build Email
        $resetLink = "http://localhost:5173/admin/reset-password?token=" . $token;
        $emailSubject = "Password Reset Request - Greenwood Public School";
        $emailBody = "
        <html>
        <head>
            <title>Password Reset Request</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fcfdfe; }
                .header { background-color: #A61B24; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
                .header h2 { margin: 0; font-family: Georgia, serif; }
                .content { padding: 25px; background-color: #ffffff; border-radius: 0 0 8px 8px; border: 1px solid #f0f0f0; border-top: none; }
                .btn { display: inline-block; background-color: #D4AF37; color: #111 !important; font-weight: bold; padding: 12px 25px; border-radius: 6px; text-decoration: none; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #888; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Greenwood Admin Portal</h2>
                </div>
                <div class='content'>
                    <p>Hello " . htmlspecialchars($user['name']) . ",</p>
                    <p>We received a request to reset your password for the Greenwood Public School Administration panel.</p>
                    <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
                    <p style='text-align: center;'>
                        <a href='" . $resetLink . "' class='btn'>Reset Password</a>
                    </p>
                    <p>If you cannot click the button, copy and paste the link below into your browser:</p>
                    <p style='font-size: 12px; word-break: break-all; color: #888;'>" . $resetLink . "</p>
                    <p>If you did not request this, you can safely ignore this email.</p>
                </div>
                <div class='footer'>
                    This is an automated system email. Please do not reply.
                </div>
            </div>
        </body>
        </html>
        ";

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Greenwood Public School <noreply@greenwood.edu>\r\n";

        // Send mail
        @mail($email, $emailSubject, $emailBody, $headers);

        // Localhost fallback: write to a file in uploads folder
        $localCopyPath = __DIR__ . '/../../uploads/password_reset_email.html';
        @file_put_contents($localCopyPath, $emailBody);

        Response::json(['message' => 'If this email exists, a password reset link has been sent.']);
    }

    // Reset password using token
    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"), true);
        $token = isset($data['token']) ? trim($data['token']) : '';
        $newPassword = isset($data['password']) ? trim($data['password']) : '';

        if (empty($token) || empty($newPassword)) {
            Response::json(['error' => 'Token and new password are required'], 400);
        }

        if (strlen($newPassword) < 6) {
            Response::json(['error' => 'Password must be at least 6 characters long'], 400);
        }

        // Verify token is active and not expired
        $stmt = $this->db->prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() AND is_active = 1");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::json(['error' => 'Invalid or expired reset token.'], 400);
            exit();
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $this->db->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
        $updateStmt->execute([$hashedPassword, $user['id']]);

        Response::json(['message' => 'Password has been reset successfully. You can now login.']);
    }

    // Change password (inside admin panel, authenticated user)
    public function changePassword($currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $currentPassword = isset($data['currentPassword']) ? trim($data['currentPassword']) : '';
        $newPassword = isset($data['newPassword']) ? trim($data['newPassword']) : '';

        if (empty($currentPassword) || empty($newPassword)) {
            Response::json(['error' => 'Current password and new password are required'], 400);
        }

        if (strlen($newPassword) < 6) {
            Response::json(['error' => 'New password must be at least 6 characters long'], 400);
        }

        $userId = $currentUser['userId'];
        $stmt = $this->db->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($currentPassword, $user['password'])) {
            Response::json(['error' => 'Incorrect current password.'], 400);
            exit();
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$hashedPassword, $userId]);

        Response::json(['message' => 'Password changed successfully.']);
    }
}
?>
