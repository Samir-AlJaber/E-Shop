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
$product_id = intval($data["product_id"] ?? 0);
$quantity = intval($data["quantity"] ?? 0);
$delivery_address = trim($data["delivery_address"] ?? "");
$city = trim($data["city"] ?? "");
$postal_code = trim($data["postal_code"] ?? "");
$payment_method = trim($data["payment_method"] ?? "");

if ($customer_id <= 0 || $product_id <= 0 || $quantity <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid order data"]);
    exit;
}

$productSql = "SELECT owner_id, price, stock_quantity FROM product WHERE product_id = ?";
$productStmt = sqlsrv_query($conn, $productSql, [$product_id]);

$product = sqlsrv_fetch_array($productStmt, SQLSRV_FETCH_ASSOC);

if (!$product) {
    echo json_encode(["success" => false, "message" => "Product not found"]);
    exit;
}

if ($product["stock_quantity"] < $quantity) {
    echo json_encode(["success" => false, "message" => "Not enough stock"]);
    exit;
}

$owner_id = $product["owner_id"];
$price = $product["price"];
$total_amount = $price * $quantity;

$orderSql = "INSERT INTO orders (owner_id, customer_id, total_amount, status, delivery_address, city, postal_code, payment_method)
             OUTPUT INSERTED.order_id
             VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)";

$orderStmt = sqlsrv_query($conn, $orderSql, [
    $owner_id,
    $customer_id,
    $total_amount,
    $delivery_address,
    $city,
    $postal_code,
    $payment_method
]);

$orderRow = sqlsrv_fetch_array($orderStmt, SQLSRV_FETCH_ASSOC);
$order_id = $orderRow["order_id"];

$orderItemSql = "INSERT INTO order_item (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)";

sqlsrv_query($conn, $orderItemSql, [
    $order_id,
    $product_id,
    $quantity,
    $price
]);

$updateStockSql = "UPDATE product SET stock_quantity = stock_quantity - ? WHERE product_id = ?";
sqlsrv_query($conn, $updateStockSql, [$quantity, $product_id]);

echo json_encode([
    "success" => true,
    "message" => "Order placed successfully"
]);
?>