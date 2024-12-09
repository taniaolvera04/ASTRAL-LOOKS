<?php
require_once "bd.php";
header("Content-Type: application/json; charset=UTF-8");
session_start();

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}
$userId = $_SESSION['id'];

$action = $_GET['action'] ?? $_POST['action'] ?? '';

$response = ['success' => false];

// Verificar que la acción sea válida
if (!$action) {
    echo json_encode(['error' => 'Acción no definida']);
    exit;
}

// Acción para agendar cita
// Modificar la consulta según los nombres correctos de columnas
if ($action === 'agendarCita') {
    $id = $_POST['id'];
    $fecha = $_POST['fecha'];
    $tipo = $_POST['tipo'];
    
    // Ajustar el nombre de la columna id según la tabla
    $tabla = $tipo === "corte" ? "cortes" : "peinados";
    $idColumna = $tipo === "corte" ? "id_c" : "id_peinado"; // Cambiar según corresponda
    $columna = $tipo === "corte" ? "corte" : "nombre";
    
    $stmt = $cx->prepare("SELECT $columna AS nombre, precio FROM $tabla WHERE $idColumna = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result()->fetch_assoc();
    
    $nombre = $resultado['nombre'];
    $precio = $resultado['precio'];
    
    $stmt = $cx->prepare("
        INSERT INTO citas (user_id, asunto, fecha, finalizado, costo, tipo, id_tipo)
        VALUES (?, ?, ?, 0, ?, ?, ?)
    ");
    $stmt->bind_param("issdsi", $userId, $nombre, $fecha, $precio, $tipo, $id);
    $stmt->execute();
    
   // Obtener número de teléfono del usuario
    $stmtUser = $cx->prepare("SELECT name, numerotel FROM users WHERE id = ?");
    $stmtUser->bind_param("i", $userId);
    $stmtUser->execute();
    $usuario = $stmtUser->get_result()->fetch_assoc();

    echo json_encode([
        'success' => true,
        'nombre' => $nombre,
        'numero' => $usuario['numerotel'],
        'usuario' => $usuario['name'], // Enviamos el nombre del usuario
    ]);
    exit;
}

// Acción para enviar SMS usando Infobip
if ($action === 'enviarSMS') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $numero = $datos['numero'] ?? null;
    $mensaje = $datos['mensaje'] ?? null;

    if (!$numero || !$mensaje) {
        echo json_encode(['success' => false, 'error' => 'Número o mensaje no proporcionado']);
        exit;
    }

    $url = "https://api.infobip.com/sms/2/text/single";
    $headers = [
        "Authorization: App cdcf2da632568dbbe125da0ac3e24552-de1dc3f6-78af-4a96-8e85-3891dfe30b75", // API Key
        "Content-Type: application/json",
    ];
    $body = json_encode([
        "from" => "444000", // Remitente configurado
        "to" => $numero,
        "text" => $mensaje,
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch); // Captura errores de cURL

    if ($httpCode === 200) {
        echo json_encode(['success' => true, 'message' => 'SMS enviado']);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al enviar SMS',
            'httpCode' => $httpCode,
            'response' => $response,
            'curlError' => $curlError
        ]);
    }

    curl_close($ch);
    exit;
}




// Acción para obtener el historial de citas
if ($action === 'obtenerHistorialAdmin') {
    $stmt = $cx->prepare("
        SELECT c.fecha, c.asunto, c.costo, c.tipo, c.tipo, u.name
        FROM citas c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.finalizado = 1
        ORDER BY c.fecha DESC
    ");
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}

// Acción para obtener citas pendientes
if ($action === 'obtenerPendientesAdmin') {
    $stmt = $cx->prepare("
        SELECT c.id, c.asunto, c.fecha, c.costo, c.tipo,u.name, u.foto
        FROM citas c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.finalizado = 0
        ORDER BY c.fecha ASC
    ");
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}


// Acción para obtener citas pendientes
if ($action === 'obtenerPendientes') {
    $stmt = $cx->prepare("
        SELECT c.id, c.asunto, c.fecha, c.costo, c.tipo,u.name, u.foto
        FROM citas c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.finalizado = 0 AND u.id = ?
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}


// Acción para marcar como atendido con telefono
if ($action === 'marcarAtendido') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
        exit;
    }

    // Consulta para obtener el teléfono del usuario asociado a la cita
    $stmtInfo = $cx->prepare("
        SELECT u.numerotel 
        FROM citas c 
        INNER JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
    ");
    $stmtInfo->bind_param("i", $id);
    $stmtInfo->execute();
    $resultInfo = $stmtInfo->get_result()->fetch_assoc();

    if (!$resultInfo) {
        echo json_encode(['success' => false, 'error' => 'No se encontró el usuario asociado']);
        exit;
    }

    $numerotel = $resultInfo['numerotel'];

    // Marcar la cita como atendida
    $stmt = $cx->prepare("UPDATE citas SET finalizado = 1 WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Cita marcada como atendida';
        $response['numero'] = $numerotel; // Incluir el teléfono en la respuesta
    } else {
        $response['success'] = false;
        $response['error'] = 'Error al actualizar la cita';
    }

    echo json_encode($response);
    exit;
}



// Acción para eliminar cita
if ($action === 'eliminarCita') {
    $id = $_GET['id'];
    $stmt = $cx->prepare("DELETE FROM citas WHERE id = ?");
    $stmt->bind_param("i", $id);
    $response['success'] = $stmt->execute();
}

// Acción para obtener el historial de citas
if ($action === 'obtenerHistorial') {
    $stmt = $cx->prepare("
        SELECT c.fecha, c.asunto, c.costo, c.tipo 
        FROM citas c
        WHERE c.finalizado = 1 AND c.user_id = ?
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}

// Acción para obtener cortes
if ($action === 'obtenerCortes') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405); // Código de estado: Método no permitido
        echo json_encode(['error' => 'Método no permitido, solo GET']);
        exit;
    }
    // Continuar con la consulta de cortes
    $result = $cx->query("SELECT * FROM cortes");
    if ($result) {
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } else {
        echo json_encode(['error' => 'Error al obtener los cortes']);
    }
    exit;
}

// Acción para obtener peinados
if ($action === 'obtenerpeinados') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405); // Código de estado: Método no permitido
        echo json_encode(['error' => 'Método no permitido, solo GET']);
        exit;
    }
    // Continuar con la consulta de peinados
    $result = $cx->query("SELECT * FROM peinados");
    if ($result) {
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } else {
        echo json_encode(['error' => 'Error al obtener los peinados']);
    }
    exit;
}

// Si no se reconoce la acción, responder con error
echo json_encode(['error' => 'Acción no válida']);
exit;
?>
