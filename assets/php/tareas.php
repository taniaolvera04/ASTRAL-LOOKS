<?php
require_once "bd.php";
header("Content-Type: application/json; charset=UTF-8");
session_start();

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}
$userId = (int) $_SESSION['id'];

$action = $_GET['action'] ?? $_POST['action'] ?? null;

if (!$action) {
    echo json_encode(['success' => false, 'error' => 'Acción no definida']);
    exit;
}

$response = ['success' => false];

// Función para manejar excepciones
function handleError($message, $code = 500) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// Validación y procesamiento de acciones
try {
    switch ($action) {
        case 'obtenerTareas':
            $stmt = $cx->prepare("SELECT * FROM tareas WHERE usuario_id = ? AND mes = MONTH(CURDATE())");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $tareas = $result->fetch_all(MYSQLI_ASSOC);

            // Si no hay tareas, enviamos un array vacío
            echo json_encode($tareas);
            break;

        case 'guardarTareas':
            $tareas = json_decode(file_get_contents('php://input'), true);

            if (!is_array($tareas)) {
                handleError('El formato de las tareas no es válido', 400);
            }

            $stmt = $cx->prepare("INSERT INTO tareas (usuario_id, descripcion, completada, mes) VALUES (?, ?, 0, MONTH(CURDATE()))");
            foreach ($tareas as $tarea) {
                $descripcion = $tarea['descripcion'] ?? null;
                if (!$descripcion) {
                    handleError('Faltan descripciones en las tareas', 400);
                }
                $stmt->bind_param("is", $userId, $descripcion);
                $stmt->execute();
            }
            echo json_encode(['success' => true]);
            break;

            case 'marcarTarea':
                $data = json_decode(file_get_contents('php://input'), true);
                $tareaId = $data['id'] ?? null;
            
                if (!$tareaId) {
                    handleError('ID de tarea no proporcionado', 400);
                }
            
                // Actualizar la tarea como completada
                $stmt = $cx->prepare("UPDATE tareas SET completada = 1 WHERE id = ? AND usuario_id = ?");
                $stmt->bind_param("ii", $tareaId, $userId);
                $stmt->execute();
            
                // Revisar si todas las tareas están completadas
                $stmt = $cx->prepare("SELECT COUNT(*) as completadas FROM tareas WHERE usuario_id = ? AND mes = MONTH(CURDATE()) AND completada = 1");
                $stmt->bind_param("i", $userId);
                $stmt->execute();
                $result = $stmt->get_result()->fetch_assoc();
            
                if ($result['completadas'] === 3) {
                    // Verificar si ya se otorgó un cupón este mes
                    $stmtCheckCupon = $cx->prepare("SELECT COUNT(*) FROM cupones WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE())");
                    $stmtCheckCupon->bind_param("i", $userId);
                    $stmtCheckCupon->execute();
                    $cuponesCount = $stmtCheckCupon->get_result()->fetch_row()[0];
            
                    if ($cuponesCount === 0) {
                        $beneficios = ["2x1 EN PEINADOS", "1 CORTE GRATIS", "UN CORTE A MITAD DE PRECIO"];
                        $beneficio = $beneficios[array_rand($beneficios)];
            
                        // Guardar cupón
                        $stmtCupon = $cx->prepare("INSERT INTO cupones (usuario_id, beneficio, fecha) VALUES (?, ?, CURDATE())");
                        $stmtCupon->bind_param("is", $userId, $beneficio);
                        $stmtCupon->execute();
            
                        echo json_encode(['success' => true, 'mensaje' => 'Cupón generado', 'beneficio' => $beneficio]);
                    } else {
                        echo json_encode(['success' => true, 'mensaje' => 'Cupón ya otorgado']);
                    }
                } else {
                    echo json_encode(['success' => true, 'completadas' => $result['completadas']]);
                }
                break;
            

        case 'guardarCupon':
            $data = json_decode(file_get_contents('php://input'), true);
            $beneficio = $data['beneficio'] ?? null;

            if (!$beneficio) {
                handleError('Beneficio no proporcionado', 400);
            }

            $stmt = $cx->prepare("INSERT INTO cupones (usuario_id, beneficio, fecha) VALUES (?, ?, CURDATE())");
            $stmt->bind_param("is", $userId, $beneficio);
            $stmt->execute();

            echo json_encode(['success' => true]);
            break;

        case 'obtenerCupones':
                $stmt = $cx->prepare("SELECT beneficio, fecha, canjeado FROM cupones WHERE usuario_id = ?");
                $stmt->bind_param("i", $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                $cupones = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($cupones);
                break;
            
        case 'validarCupon':
                    $data = json_decode(file_get_contents('php://input'), true);
                    $cuponId = $data['id'] ?? null;
                
                    if (!$cuponId) {
                        handleError('ID del cupón no proporcionado', 400);
                    }
                
                    // Verificar si el cupón existe y si ya fue canjeado
                    $stmt = $cx->prepare("SELECT beneficio, canjeado FROM cupones WHERE id = ? AND usuario_id = ?");
                    $stmt->bind_param("ii", $cuponId, $userId);
                    $stmt->execute();
                    $result = $stmt->get_result()->fetch_assoc();
                
                    if ($result) {
                        if ($result['canjeado'] == 1) {
                            echo json_encode(['success' => false, 'mensaje' => 'El cupón ya ha sido canjeado']);
                        } else {
                            echo json_encode(['success' => true, 'mensaje' => 'El cupón es válido y puede ser canjeado', 'beneficio' => $result['beneficio']]);
                        }
                    } else {
                        echo json_encode(['success' => false, 'mensaje' => 'Cupón no encontrado']);
                    }
                    break;
                        

                    case 'validarTareas':
                        $stmt = $cx->prepare("SELECT * FROM tareas WHERE usuario_id = ? AND mes = MONTH(CURDATE())");
                        $stmt->bind_param("i", $userId);
                        $stmt->execute();
                        $tareas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                    
                        $todasCompletadas = true;
                    
                        foreach ($tareas as $tarea) {
                            $completada = 0;
                    
                            // Generar consulta personalizada según la descripción de la tarea
                            switch ($tarea['descripcion']) {
                                case 'Realiza 2 citas para cualquier peinado':
                                    $stmtCheck = $cx->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ? AND tipo = 'peinado' AND MONTH(fecha) = MONTH(CURDATE())");
                                    break;
                                case 'Realiza 2 citas para cualquier corte':
                                    $stmtCheck = $cx->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ? AND tipo = 'corte' AND MONTH(fecha) = MONTH(CURDATE())");
                                    break;
                                case 'Gasta aproximadamente $200 en cortes':
                                    $stmtCheck = $cx->prepare("SELECT SUM(costo) FROM citas WHERE user_id = ? AND tipo = 'corte' AND MONTH(fecha) = MONTH(CURDATE())");
                                    break;
                                case 'Compra un paquete de 3 cortes':
                                    $stmtCheck = $cx->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ? AND tipo = 'corte' AND MONTH(fecha) = MONTH(CURDATE()) AND finalizado = 1");
                                    break;
                                case 'Reserva 3 peinados durante el mes':
                                    $stmtCheck = $cx->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ? AND tipo = 'peinado' AND MONTH(fecha) = MONTH(CURDATE())");
                                    break;
                                case 'Asiste a una cita antes del día 15 del mes':
                                    $stmtCheck = $cx->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ? AND DATE(fecha) < DATE_FORMAT(CURDATE(), '%Y-%m-15') AND finalizado = 1");
                                    break;
                                case 'Realiza un gasto total superior a $300':
                                    $stmtCheck = $cx->prepare("SELECT SUM(costo) FROM citas WHERE user_id = ? AND MONTH(fecha) = MONTH(CURDATE())");
                                    break;
                                case 'Reserva al menos 4 citas en el mes':
                                    $stmtCheck = $cx->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ? AND MONTH(fecha) = MONTH(CURDATE())");
                                    break;
                                default:
                                    continue 2; // Ignorar tareas no reconocidas
                            }
                    
                            $stmtCheck->bind_param("i", $userId);
                            $stmtCheck->execute();
                            $resultado = $stmtCheck->get_result()->fetch_row()[0];
                    
                            // Validar si la tarea está completada
                            switch ($tarea['descripcion']) {
                                case 'Gasta aproximadamente $200 en cortes':
                                    $completada = ($resultado >= 200) ? 1 : 0;
                                    break;
                                case 'Compra un paquete de 3 cortes':
                                    $completada = ($resultado >= 3) ? 1 : 0;
                                    break;
                                case 'Reserva 3 peinados durante el mes':
                                    $completada = ($resultado >= 3) ? 1 : 0;
                                    break;
                                case 'Asiste a una cita antes del día 15 del mes':
                                    $completada = ($resultado > 0) ? 1 : 0;
                                    break;
                                case 'Realiza un gasto total superior a $300':
                                    $completada = ($resultado > 300) ? 1 : 0;
                                    break;
                                case 'Reserva al menos 4 citas en el mes':
                                    $completada = ($resultado >= 4) ? 1 : 0;
                                    break;
                                default:
                                    $completada = ($resultado >= 2) ? 1 : 0;
                                    break;
                            }
                    
                            if (!$completada) {
                                $todasCompletadas = false;
                            }
                    
                            // Actualizar estado de la tarea
                            $stmtUpdate = $cx->prepare("UPDATE tareas SET completada = ? WHERE id = ?");
                            $stmtUpdate->bind_param("ii", $completada, $tarea['id']);
                            $stmtUpdate->execute();
                        }
                    
                        // Verificar si todas las tareas están completadas y generar cupón si es necesario
                        $cuponGenerado = false;
                        $cupon = null;
                    
                        if ($todasCompletadas) {
                            $stmtCheckCupon = $cx->prepare("SELECT COUNT(*) FROM cupones WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE())");
                            $stmtCheckCupon->bind_param("i", $userId);
                            $stmtCheckCupon->execute();
                            $cuponesCount = $stmtCheckCupon->get_result()->fetch_row()[0];
                    
                            if ($cuponesCount === 0) {
                                $beneficios = ["2x1 EN PEINADOS", "1 CORTE GRATIS", "UN CORTE A MITAD DE PRECIO"];
                                $beneficio = $beneficios[array_rand($beneficios)];
                    
                                $stmtCupon = $cx->prepare("INSERT INTO cupones (usuario_id, beneficio, fecha) VALUES (?, ?, CURDATE())");
                                $stmtCupon->bind_param("is", $userId, $beneficio);
                                $stmtCupon->execute();
                    
                                $stmtCupon = $cx->prepare("SELECT * FROM cupones WHERE usuario_id = ? AND MONTH(fecha) = MONTH(CURDATE())");
                                $stmtCupon->bind_param("i", $userId);
                                $stmtCupon->execute();
                                $cupon = $stmtCupon->get_result()->fetch_assoc();
                                $cuponGenerado = true;
                            }
                        }
                    
                        echo json_encode([
                            'tareas' => $tareas,
                            'cuponGenerado' => $cuponGenerado,
                            'cupon' => $cupon
                        ]);
                        break;
                    
                    
                    
                    
                    

        default:
            handleError('Acción no válida', 400);
    }
} catch (Exception $e) {
    error_log("Error en el caso {$action}: " . $e->getMessage());
    handleError($e->getMessage());}
?>
