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
$rating = intval($data["rating"] ?? 0);
$customer_id = intval($data["customer_id"] ?? 0);

if ($order_id <= 0 || $rating < 1 || $rating > 5 || $customer_id <= 0) {
    echo json_encode(["success" => false]);
    exit;
}

$check = "
SELECT salesman_id
FROM orders
WHERE order_id = ? AND customer_id = ? AND status = 'delivered'
";

$stmt = sqlsrv_query($conn, $check, [$order_id, $customer_id]);

if ($stmt === false || !sqlsrv_has_rows($stmt)) {
    echo json_encode(["success" => false]);
    exit;
}

$row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
$salesman_id = $row["salesman_id"];

$existing = "
SELECT rating_id
FROM delivery_rating
WHERE order_id = ?
";

$existing_stmt = sqlsrv_query($conn, $existing, [$order_id]);

if ($existing_stmt && sqlsrv_has_rows($existing_stmt)) {
    echo json_encode([
        "success" => false,
        "message" => "Already rated"
    ]);
    exit;
}

$insert = "
INSERT INTO delivery_rating (order_id, salesman_id, customer_id, rating)
VALUES (?, ?, ?, ?)
";

sqlsrv_query($conn, $insert, [$order_id, $salesman_id, $customer_id, $rating]);

$update = "
UPDATE salesman
SET rating =
(
SELECT AVG(CAST(rating AS DECIMAL(3,1)))
FROM delivery_rating
WHERE salesman_id = ?
)
WHERE salesman_id = ?
";

sqlsrv_query($conn, $update, [$salesman_id, $salesman_id]);

echo json_encode([
    "success" => true,
    "message" => "Rating submitted"
]);
?>