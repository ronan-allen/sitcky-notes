<?php
header('Content-Type: application/json');
$notes = file_get_contents('notes.json');
if ($notes === false) {
    echo json_encode([]);
} else {
    echo $notes;
}
?>
