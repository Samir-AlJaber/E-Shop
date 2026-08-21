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

$product_id = intval($data["product_id"] ?? 0);
$stock_quantity = intval($data["stock_quantity"] ?? 0);
$price = floatval($data["price"] ?? 0);
$owner_id = intval($data["owner_id"] ?? 0);
$role = $data["role"] ?? "";

if ($product_id <= 0 || $owner_id <= 0 || $role !== "owner") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request parameters"
    ]);
    exit;
}

$sql = "
UPDATE product
SET stock_quantity = ?, price = ?
WHERE product_id = ? AND owner_id = ?
";

$params = [
    $stock_quantity,
    $price,
    $product_id,
    $owner_id
];

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {

    echo json_encode([
        "success" => false,
        "error" => sqlsrv_errors()
    ]);
    exit;
}

$rows = sqlsrv_rows_affected($stmt);

if ($rows === false) {
    echo json_encode([
        "success" => false,
        "message" => "Could not determine rows affected"
    ]);
    exit;
}

if ($rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "No rows updated. Check product_id or owner_id."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Stock and price updated successfully"
]);
?>