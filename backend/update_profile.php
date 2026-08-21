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

$role = trim($data["role"] ?? "");
$reference_id = intval($data["reference_id"] ?? 0);
$name = trim($data["name"] ?? "");
$phone = trim($data["phone"] ?? "");
$address = trim($data["address"] ?? "");

if ($reference_id <= 0 || $name === "" || $role === "") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid data"
    ]);
    exit;
}

if ($role === "customer") {
    $sql = "UPDATE customer SET name = ?, phone = ?, address = ? WHERE customer_id = ?";
    $params = [$name, $phone, $address, $reference_id];
} elseif ($role === "owner") {
    $sql = "UPDATE owner SET username = ?, phone = ?, address = ? WHERE owner_id = ?";
    $params = [$name, $phone, $address, $reference_id];
} elseif ($role === "salesman") {
    $sql = "UPDATE salesman SET name = ?, phone = ?, address = ? WHERE salesman_id = ?";
    $params = [$name, $phone, $address, $reference_id];
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid role"
    ]);
    exit;
}

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode([
        "success" => false,
        "message" => "Update failed",
        "error" => sqlsrv_errors()
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Profile updated successfully"
]);
?>