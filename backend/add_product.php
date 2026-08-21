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
$category_id = intval($data["category_id"] ?? 0);
$brand = trim($data["brand"] ?? "");
$description = trim($data["description"] ?? "");
$price = floatval($data["price"] ?? 0);
$stock_quantity = intval($data["stock_quantity"] ?? 0);
$role = trim($data["role"] ?? "");
$owner_id = intval($data["owner_id"] ?? 0);

if ($role !== "owner") {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit;
}

if ($owner_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid owner"]);
    exit;
}

$sql = "INSERT INTO product (owner_id, name, category_id, brand, description, price, stock_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$params = [$owner_id, $name, $category_id, $brand, $description, $price, $stock_quantity];

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode(["success" => false, "error" => sqlsrv_errors()]);
    exit;
}

echo json_encode(["success" => true, "message" => "Product added successfully"]);
?>