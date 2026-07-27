<?php
declare(strict_types=1);

// Destination inbox and the address the email is sent "from".
// FROM_ADDRESS should be on your own domain so the host's mail server accepts it.
const CONTACT_EMAIL = 'designartstudiocraiova@gmail.com';
const FROM_ADDRESS  = 'no-reply@designartstudio.ro';

header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request body']);
    exit;
}

// Single-line fields: trim, cap length, strip CR/LF (prevents header injection).
function field(array $data, string $key, int $max = 200): string
{
    $value = isset($data[$key]) && is_string($data[$key]) ? trim($data[$key]) : '';
    $value = str_replace(["\r", "\n"], ' ', $value);
    return mb_substr($value, 0, $max);
}

$fullName    = field($data, 'fullName');
$email       = field($data, 'email');
$phone       = field($data, 'phone');
$projectType = field($data, 'projectType');
$surface     = field($data, 'surface');

$message = isset($data['message']) && is_string($data['message']) ? trim($data['message']) : '';
$message = str_replace(["\r\n", "\r"], "\n", $message);
$message = mb_substr($message, 0, 10000);

if ($email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Email sau mesaj invalid']);
    exit;
}

$lines = [
    'Nume: ' . ($fullName !== '' ? $fullName : '—'),
    'Email: ' . $email,
];
if ($phone !== '')       $lines[] = 'Telefon: ' . $phone;
if ($projectType !== '') $lines[] = 'Tip proiect: ' . $projectType;
if ($surface !== '')     $lines[] = 'Suprafață aproximativă: ' . $surface . ' mp';
$lines[] = '';
$lines[] = $message;
$body = implode("\n", $lines);

$subject = mb_encode_mimeheader(
    'Mesaj nou de la ' . ($fullName !== '' ? $fullName : $email),
    'UTF-8',
    'B',
    "\r\n"
);

$headers = implode("\r\n", [
    'From: ' . mb_encode_mimeheader('Design Art Studio', 'UTF-8', 'B', "\r\n") . ' <' . FROM_ADDRESS . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = mail(CONTACT_EMAIL, $subject, $body, $headers, '-f' . FROM_ADDRESS);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Mail server error']);
}
