<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $notes = json_decode($input, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        file_put_contents('notes.json', json_encode($notes, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    }
    exit;
}
?>
