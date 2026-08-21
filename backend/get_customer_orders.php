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
$customer_id = intval($data["customer_id"] ?? 0);

if ($customer_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid customer"
    ]);
    exit;
}

$sql = "
SELECT 
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    o.delivery_address,
    o.city,
    o.postal_code,
    o.payment_method,
    oi.quantity,
    oi.price,
    p.name AS product_name,
    dr.rating AS delivery_rating
FROM orders o
JOIN order_item oi ON o.order_id = oi.order_id
JOIN product p ON oi.product_id = p.product_id
LEFT JOIN delivery_rating dr ON o.order_id = dr.order_id
WHERE o.customer_id = ?
ORDER BY o.order_date DESC
";

$stmt = sqlsrv_query($conn, $sql, [$customer_id]);

if ($stmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

$orders = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    if ($row["delivery_rating"] !== null) {
        $row["delivery_rating"] = intval($row["delivery_rating"]);
    }
    $orders[] = $row;
}

echo json_encode([
    "success" => true,
    "orders" => $orders
]);
?>