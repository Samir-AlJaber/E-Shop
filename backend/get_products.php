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
$owner_id = intval($data["owner_id"] ?? 0);

if ($role === "owner") {

    $sql = "SELECT 
            p.product_id,
            p.owner_id,
            p.name,
            p.brand,
            p.description,
            p.price,
            p.stock_quantity,
            p.category_id,
            c.category_name
            FROM product p
            LEFT JOIN category c
            ON p.category_id = c.category_id
            WHERE p.owner_id = ?
            AND p.is_deleted = 0";

    $params = array($owner_id);
    $stmt = sqlsrv_query($conn, $sql, $params);

} else {

    $sql = "SELECT 
            p.product_id,
            p.owner_id,
            p.name,
            p.brand,
            p.description,
            p.price,
            p.stock_quantity,
            p.category_id,
            c.category_name
            FROM product p
            LEFT JOIN category c
            ON p.category_id = c.category_id
            WHERE p.is_deleted = 0";

    $stmt = sqlsrv_query($conn, $sql);
}

if ($stmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

$products = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $products[] = $row;
}

echo json_encode([
    "success" => true,
    "products" => $products
]);
?>