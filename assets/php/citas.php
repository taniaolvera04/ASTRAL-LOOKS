<?php
require_once "bd.php";
session_start();
$userId = $_SESSION['id'];
$action = $_GET['action'] ?? $_POST['action'];

$response = ['success' => false];

if ($action === 'agendarCita') {
    $asunto = $_POST['asunto'];
    $costo = $_POST['costo'];
    $fecha = $_POST['fecha'];
    $stmt = $cx->prepare("INSERT INTO citas (user_id, asunto, costo, fecha) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $userId, $asunto, $costo, $fecha);
    $response['success'] = $stmt->execute();
}

if ($action === 'obtenerPendientes') {
    $stmt = $cx->prepare("SELECT c.*, u.name, u.foto FROM citas c INNER JOIN users u ON c.user_id = u.id WHERE c.finalizado = 0 AND u.id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}

if ($action === 'marcarAtendido') {
    $id = $_GET['id'];
    $stmt = $cx->prepare("UPDATE citas SET finalizado = 1 WHERE id = ?");
    $stmt->bind_param("i", $id);
    $response['success'] = $stmt->execute();
}

if ($action === 'eliminarCita') {
    $id = $_GET['id'];
    $stmt = $cx->prepare("DELETE FROM citas WHERE id = ?");
    $stmt->bind_param("i", $id);
    $response['success'] = $stmt->execute();
}

if ($action === 'obtenerHistorial') {
    $stmt = $cx->prepare("SELECT c.*, u.name AS administrador FROM citas c INNER JOIN users u ON c.user_id = u.id WHERE c.finalizado = 1 AND c.user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}




echo json_encode($response);
?>
