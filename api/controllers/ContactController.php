<?php
// api/controllers/ContactController.php
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/RateLimiter.php';

class ContactController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Public: Submit contact form and send email notification
    public function submit() {
        if (!RateLimiter::check('contact', 5, 3600)) {
            Response::json(['error' => 'Too many contact submissions. Please try again later.'], 429);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $name = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $phone = isset($data['phone']) ? trim($data['phone']) : '';
        $subject = isset($data['subject']) ? trim($data['subject']) : '';
        $message = isset($data['message']) ? trim($data['message']) : '';

        // Validation
        if (empty($name) || empty($email) || empty($phone) || empty($subject) || empty($message)) {
            Response::json(['error' => 'All fields are required.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Please enter a valid email address.'], 400);
        }

        try {
            // 1. Save to Database
            $stmt = $this->db->prepare(
                "INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$name, $email, $phone, $subject, $message]);

            // 2. Fetch School's configured contact email from settings
            $stmtEmail = $this->db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'email'");
            $stmtEmail->execute();
            $settingsEmailRow = $stmtEmail->fetch();
            
            // Recipient is the school's contact email. Fallback if not found.
            $toEmail = !empty($settingsEmailRow['setting_value']) ? $settingsEmailRow['setting_value'] : 'greenwoodroorkee@gmail.com';

            // 3. Send Notification Email
            $emailSubject = "New Contact Us Query: " . $subject;
            
            // Build modern HTML email body
            $emailBody = "
            <html>
            <head>
                <title>New Contact Inquiry - Greenwood Public School</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fcfdfe; }
                    .header { background-color: #A61B24; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
                    .header h2 { margin: 0; font-family: Georgia, serif; }
                    .content { padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px; border: 1px solid #f0f0f0; border-top: none; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #A61B24; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .value { font-size: 15px; color: #111; margin-top: 2px; }
                    .message-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D4AF37; border-radius: 4px; margin-top: 10px; font-style: italic; }
                    .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #888; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Greenwood Public School</h2>
                        <span style='font-size:12px; opacity:0.9;'>Administrative Contact Form Alert</span>
                    </div>
                    <div class='content'>
                        <div class='field'>
                            <div class='label'>Sender Name</div>
                            <div class='value'>" . htmlspecialchars($name) . "</div>
                        </div>
                        <div class='field'>
                            <div class='label'>Sender Email</div>
                            <div class='value'><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></div>
                        </div>
                        <div class='field'>
                            <div class='label'>Sender Phone</div>
                            <div class='value'><a href='tel:" . htmlspecialchars($phone) . "'>" . htmlspecialchars($phone) . "</a></div>
                        </div>
                        <div class='field'>
                            <div class='label'>Inquiry Subject</div>
                            <div class='value'>" . htmlspecialchars($subject) . "</div>
                        </div>
                        <div class='field'>
                            <div class='label'>Message</div>
                            <div class='message-box'>" . nl2br(htmlspecialchars($message)) . "</div>
                        </div>
                    </div>
                    <div class='footer'>
                        This message was automatically generated by the Greenwood Public School CMS.<br/>
                        Submission Time: " . date('Y-m-d H:i:s') . "
                    </div>
                </div>
            </body>
            </html>
            ";

            // Headers for HTML Mail
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "From: Greenwood Public School Website <noreply@greenwood.edu>\r\n";
            $headers .= "Reply-To: " . $email . "\r\n";

            // Send mail (ignores error if mail transfer agent is not configured, to avoid breaking API success response)
            @mail($toEmail, $emailSubject, $emailBody, $headers);

            // Save a local copy in uploads folder so user can easily verify and preview the email in the browser
            $localCopyPath = __DIR__ . '/../../uploads/contact_email_notification.html';
            @file_put_contents($localCopyPath, $emailBody);

            Response::json(['message' => 'Your message has been submitted successfully.']);

        } catch (Exception $e) {
            Response::json(['error' => 'Failed to process inquiry: ' . $e->getMessage()], 500);
        }
    }

    // Admin: List all contact inquiries
    public function list() {
        try {
            $stmt = $this->db->query("SELECT * FROM contact_submissions ORDER BY created_at DESC");
            Response::json($stmt->fetchAll());
        } catch (Exception $e) {
            Response::json(['error' => 'Failed to load inquiries: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Delete a contact inquiry
    public function delete($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM contact_submissions WHERE id = ?");
            $stmt->execute([$id]);
            Response::json(['message' => 'Inquiry deleted successfully.']);
        } catch (Exception $e) {
            Response::json(['error' => 'Failed to delete inquiry: ' . $e->getMessage()], 500);
        }
    }
}
?>
