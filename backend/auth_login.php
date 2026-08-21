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

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Email and password required"]);
    exit;
}

$sql = "SELECT user_id, email, password_hash, role, reference_id
        FROM user_account
        WHERE email = ?";

$stmt = sqlsrv_query($conn, $sql, [$email]);

if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Login failed"]);
    exit;
}

$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

if (!password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "message" => "Wrong password"]);
    exit;
}

$reference_id = $user["reference_id"];
$role = $user["role"];
$name = "";
$phone = "";
$address = "";

if ($role === "owner") {
    $infoSql = "SELECT username, phone, address FROM owner WHERE owner_id = ?";
    $infoStmt = sqlsrv_query($conn, $infoSql, [$reference_id]);
    $info = sqlsrv_fetch_array($infoStmt, SQLSRV_FETCH_ASSOC);
    $name = $info["username"] ?? "";
    $phone = $info["phone"] ?? "";
    $address = $info["address"] ?? "";
} elseif ($role === "customer") {
    $infoSql = "SELECT name, phone, address FROM customer WHERE customer_id = ?";
    $infoStmt = sqlsrv_query($conn, $infoSql, [$reference_id]);
    $info = sqlsrv_fetch_array($infoStmt, SQLSRV_FETCH_ASSOC);
    $name = $info["name"] ?? "";
    $phone = $info["phone"] ?? "";
    $address = $info["address"] ?? "";
} elseif ($role === "salesman") {
    $infoSql = "SELECT name, phone, address FROM salesman WHERE salesman_id = ?";
    $infoStmt = sqlsrv_query($conn, $infoSql, [$reference_id]);
    $info = sqlsrv_fetch_array($infoStmt, SQLSRV_FETCH_ASSOC);
    $name = $info["name"] ?? "";
    $phone = $info["phone"] ?? "";
    $address = $info["address"] ?? "";
}

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user["user_id"],
        "email" => $user["email"],
        "role" => $role,
        "reference_id" => $reference_id,
        "name" => $name,
        "phone" => $phone,
        "address" => $address
    ]
]);
?>