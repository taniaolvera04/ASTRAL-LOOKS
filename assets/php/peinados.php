<?php
require 'bd.php';
header('Content-Type: application/json; charset=utf-8');

// Obtener la acción solicitada
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if (!$action) {
    echo json_encode(['success' => false, 'mensaje' => 'Acción no definida']);
    exit;
}

if ($action == 'guardar') {
    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'];
    $tiempo = $_POST['tiempo'];
    $precio = $_POST['precio'];
    $imagen = $_FILES['imagen']['name'];
    $ruta = "../imgPeinados/" . $imagen;

    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)) {
        $sql = "INSERT INTO peinados (nombre, descripcion, tiempo, precio, imagen) VALUES (?, ?, ?, ?, ?)";
        $stmt = $cx->prepare($sql);
        $stmt->bind_param("ssdds", $nombre, $descripcion, $tiempo, $precio, $imagen);
        $stmt->execute();
        echo json_encode(['success' => true, 'mensaje' => 'Peinado registrado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'mensaje' => 'Error al subir la imagen']);
    }
}

if ($action == 'mostrar') {
    $result = $cx->query("SELECT * FROM peinados");
    $data = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['data' => $data]);
}

if ($action == 'mostrarUno') {
    $id_peinado = $_POST['id_peinado'];
    if (!is_numeric($id_peinado)) {
        echo json_encode(['success' => false, 'mensaje' => 'ID de peinado inválido']);
        exit;
    }

    $stmt = $cx->prepare("SELECT * FROM peinados WHERE id_peinado = ?");
    $stmt->bind_param("i", $id_peinado);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

if ($action == 'actualizar') {
    $id_peinado = $_POST['id_peinado'];
    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'];
    $tiempo = $_POST['tiempo'];
    $precio = $_POST['precio'];
    $uploadDirectory = '../imgPeinados/';

    if (!is_numeric($id_peinado)) {
        echo json_encode(['success' => false, 'mensaje' => 'ID de peinado inválido']);
        exit;
    }

    // Depuración de los datos recibidos
    file_put_contents('debug_log.txt', print_r($_POST, true), FILE_APPEND);

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        // Mover la nueva imagen y actualizar en la base de datos
        $fileTmpName = $_FILES['imagen']['tmp_name'];
        $fileName = $_FILES['imagen']['name'];
        $filePath = $uploadDirectory . basename($fileName);

        if (move_uploaded_file($fileTmpName, $filePath)) {
            $sql = "UPDATE peinados SET nombre = ?, descripcion = ?, tiempo = ?, precio = ?, imagen = ? WHERE id_peinado = ?";
            $stmt = $cx->prepare($sql);
            $stmt->bind_param("ssddsi", $nombre, $descripcion, $tiempo, $precio, $fileName, $id_peinado);
        } else {
            echo json_encode(['success' => false, 'mensaje' => 'Error al subir la imagen']);
            exit;
        }
    } else {
        // Mantener la imagen actual
        $sql = "UPDATE peinados SET nombre = ?, descripcion = ?, tiempo = ?, precio = ? WHERE id_peinado = ?";
        $stmt = $cx->prepare($sql);
        $stmt->bind_param("ssdsi", $nombre, $descripcion, $tiempo, $precio, $id_peinado);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'mensaje' => 'Peinado actualizado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'mensaje' => 'Error al actualizar en la base de datos: ' . $cx->error]);
    }
}

if ($action == 'eliminar') {
    $id_peinado = $_POST['id_peinado'];
    if (!is_numeric($id_peinado)) {
        echo json_encode(['success' => false, 'mensaje' => 'ID de peinado inválido']);
        exit;
    }

    $stmt = $cx->prepare("DELETE FROM peinados WHERE id_peinado = ?");
    $stmt->bind_param("i", $id_peinado);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'mensaje' => 'Peinado eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'mensaje' => 'Error al eliminar: ' . $cx->error]);
    }
}
?>
