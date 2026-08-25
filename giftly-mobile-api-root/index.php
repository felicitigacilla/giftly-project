<?php
header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:8100',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:8100',
    'https://giftly-mobile-api.onrender.com',
    'http://giftly-mobile-api.onrender.com'
];

if (in_array($origin, $allowedOrigins, true) || preg_match('/^https?:\/\/localhost:\d+$/', $origin) === 1 || preg_match('/^https?:\/\/127\.0\.0\.1:\d+$/', $origin) === 1 || preg_match('/^https?:\/\/.*\.onrender\.com$/', $origin) === 1) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Giftly mobile API is running.',
    'docs' => [
        'auth/login',
        'auth/register',
        'products',
        'cart',
        'orders'
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
