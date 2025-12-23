<?php
require_once 'classes/ApiClient.php';

$api = new ApiClient();

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $action = $_POST['action'] ?? '';

    if ($action === 'start') {
        echo json_encode($api->startSimulation());
        exit;
    }
    if ($action === 'stop') {
        echo json_encode($api->stopSimulation());
        exit;
    }
    if ($action === 'fetch_data') {
        $status = $api->getStatus();
        $ledger = $api->getLedger();
        echo json_encode(['status' => $status, 'ledger' => $ledger]);
        exit;
    }
}

// Initial Load
$pageTitle = "Secure FL Dashboard";
include 'views/header.php';
include 'views/dashboard.php';
include 'views/footer.php';
