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

$order_id = intval($data["order_id"] ?? 0);
$salesman_id = intval($data["salesman_id"] ?? 0);

if ($order_id <= 0 || $salesman_id <= 0) {
    echo json_encode(["success" => false]);
    exit;
}

$sql = "UPDATE orders 
SET status = 'delivery_accepted'
WHERE order_id = ? AND salesman_id = ?";

$stmt = sqlsrv_query($conn, $sql, [$order_id, $salesman_id]);

if ($stmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

echo json_encode([
"success" => true,
"message" => "Delivery accepted"
]);
?>