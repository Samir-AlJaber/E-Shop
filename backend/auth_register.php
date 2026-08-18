<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$role = trim($data["role"] ?? "customer");

$errors = [];

if (!str_ends_with($email, "@gmail.com")) {
    $errors["email"] = "Email must end with @gmail.com";
}

if (strlen($password) < 8) {
    $errors["password"] = "Password must be at least 8 characters";
}
elseif (!preg_match('/[A-Z]/', $password)) {
    $errors["password"] = "Password must contain at least 1 uppercase letter";
}
elseif (!preg_match('/[a-z]/', $password)) {
    $errors["password"] = "Password must contain at least 1 lowercase letter";
}
elseif (!preg_match('/[0-9]/', $password)) {
    $errors["password"] = "Password must contain at least 1 numeric digit";
}

if (!empty($errors)) {
    echo json_encode([
        "success" => false,
        "errors" => $errors
    ]);
    exit;
}

$checkSql = "SELECT id FROM dbo.users WHERE email = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, [$email]);

if (sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC)) {
    echo json_encode([
        "success" => false,
        "errors" => ["email" => "Email already registered"]
    ]);
    exit;
}

$pass_hash = password_hash($password, PASSWORD_BCRYPT);

$sql = "INSERT INTO dbo.users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)";

$params = [$name, $email, $pass_hash, $role];

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode([
        "success" => false,
        "message" => "Registration failed"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "User registered successfully"
]);
?>