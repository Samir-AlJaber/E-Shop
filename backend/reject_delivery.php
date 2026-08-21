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
SET status = 'delivery_rejected'
WHERE order_id = ? AND salesman_id = ?";

sqlsrv_query($conn, $sql, [$order_id, $salesman_id]);

$penalty = "UPDATE salesman 
SET rating = CASE 
WHEN rating - 0.2 < 0 THEN 0 
ELSE rating - 0.2 
END
WHERE salesman_id = ?";

sqlsrv_query($conn, $penalty, [$salesman_id]);

echo json_encode([
"success" => true,
"message" => "Delivery rejected"
]);
?>