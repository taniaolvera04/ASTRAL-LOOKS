<?php
require_once "bd.php";
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Mexico_City');

$valido['success'] = array('success' => false, 'mensaje' => "");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    switch ($action) {
        case "guardarC":
            $a = $_POST['corte'] ?? '';
            $b = intval($_POST['precio'] ?? 0);

            $fileName = $_FILES['img']['name'] ?? '';
            $fileTmpName = $_FILES['img']['tmp_name'] ?? '';
            $uploadDirectory = '../imgCortes/';

            if (empty($a) || $b <= 0 || empty($fileName)) {
                $valido['mensaje'] = "Todos los campos son obligatorios.";
                echo json_encode($valido);
                break;
            }

            if (!is_dir($uploadDirectory)) {
                mkdir($uploadDirectory, 0755, true);
            }

            $filePath = basename($fileName); // Solo guardar el nombre del archivo
            $fullPath = $uploadDirectory . $filePath;

            if (move_uploaded_file($fileTmpName, $fullPath)) {
                $sqlInsertCorte = "INSERT INTO cortes (corte, precio, imagen) VALUES (?, ?, ?)";
                $stmtProducto = $cx->prepare($sqlInsertCorte);
                $stmtProducto->bind_param("sis", $a, $b, $filePath);

                if ($stmtProducto->execute()) {
                    $id_c = $cx->insert_id;
                    if ($id_c > 0) {
                        $valido['success'] = true;
                        $valido['mensaje'] = "Corte agregado correctamente";
                        $valido['id_c'] = $id_c;
                    } else {
                        $valido['mensaje'] = "No se pudo obtener el ID del corte.";
                    }
                } else {
                    $valido['mensaje'] = "Error al guardar el corte en la base de datos: " . $cx->error;
                }
            } else {
                $valido['mensaje'] = "Error al subir la imagen del corte.";
            }
            echo json_encode($valido);
            break;

        case "selectAllC":
            $sql = "SELECT * FROM cortes";
            $registros = array('data' => array());
            $res = $cx->query($sql);
            if ($res->num_rows > 0) {
                while ($row = $res->fetch_array()) {
                    $registros['data'][] = array($row[0], $row[1], $row[2], $row[3]);
                }
            }
            echo json_encode($registros);
            break;

        case "selectC":
            $idc = $_POST['idc'] ?? 0;
            $sql = "SELECT * FROM cortes WHERE id_c = ?";
            $stmt = $cx->prepare($sql);
            $stmt->bind_param("i", $idc);
            $stmt->execute();
            $res = $stmt->get_result();
            $row = $res->fetch_assoc();
            $valido = array(
                'success' => true,
                'mensaje' => "SE ENCONTRÓ CORTE",
                'id_c' => $row['id_c'],
                'corte' => $row['corte'],
                'precio' => $row['precio'],
                'imagen' => $row['imagen']
            );
            echo json_encode($valido);
            break;



            case "updateC":
                $id_c = $_POST['idc'];
                $a = $_POST['corte'];
                $e = $_POST['precio'];
                $uploadDirectory = '../imgCortes/';
    
                if (isset($_FILES['imgc']) && $_FILES['imgc']['error'] === UPLOAD_ERR_OK) {
                    $fileTmpName = $_FILES['imgc']['tmp_name'];
                    $fileName = $_FILES['imgc']['name'];
                    $filePath = $uploadDirectory . basename($fileName);
                    $fileNameOnly = basename($fileName);
    
                    if (!is_dir($uploadDirectory)) {
                        mkdir($uploadDirectory, 0755, true);
                    }
    
                    if (move_uploaded_file($fileTmpName, $filePath)) {
                        $sql = "UPDATE cortes SET corte='$a', precio='$e', imagen='$fileNameOnly' WHERE id_c=$id_c";
                    } else {
                        $valido['success'] = false;
                        $valido['mensaje'] = "ERROR AL ACTUALIZAR IMAGEN EN CORTES";
                        echo json_encode($valido);
                        break;
                    }
                } else {
                    $sql = "UPDATE cortes SET corte='$a', precio='$e' WHERE id_c=$id_c";
                }
    
                if ($cx->query($sql)) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "SE ACTUALIZÓ CORRECTAMENTE EL CORTE";
                } else {
                    $valido['success'] = false;
                    $valido['mensaje'] = "ERROR AL ACTUALIZAR EN BD: " . $cx->error;
                }
    
                echo json_encode($valido);
                break;
    
            

        case "deleteC":
            $idc = intval($_POST['idc'] ?? 0);
            $sql = "DELETE FROM cortes WHERE id_c = ?";
            $stmt = $cx->prepare($sql);
            $stmt->bind_param("i", $idc);

            if ($stmt->execute()) {
                $valido['success'] = true;
                $valido['mensaje'] = "SE ELIMINÓ CORRECTAMENTE";
            } else {
                $valido['success'] = false;
                $valido['mensaje'] = "ERROR AL ELIMINAR EN BD";
            }
            echo json_encode($valido);
            break;


            case "masPedidos":
                $query = "SELECT 
                              DATE_FORMAT(c.fecha, '%Y-%m') AS mes, 
                              co.corte, 
                              COUNT(*) AS cantidad, 
                              CASE MONTH(c.fecha)
                                  WHEN 1 THEN 'Enero'
                                  WHEN 2 THEN 'Febrero'
                                  WHEN 3 THEN 'Marzo'
                                  WHEN 4 THEN 'Abril'
                                  WHEN 5 THEN 'Mayo'
                                  WHEN 6 THEN 'Junio'
                                  WHEN 7 THEN 'Julio'
                                  WHEN 8 THEN 'Agosto'
                                  WHEN 9 THEN 'Septiembre'
                                  WHEN 10 THEN 'Octubre'
                                  WHEN 11 THEN 'Noviembre'
                                  WHEN 12 THEN 'Diciembre'
                              END AS nombre_mes 
                          FROM citas c 
                          JOIN cortes co ON c.asunto = co.corte 
                          WHERE c.finalizado = 1 
                          GROUP BY mes, co.corte
                          ORDER BY mes, cantidad DESC";
                
                $result = $cx->query($query);
                
                $data = [];
                $prevMonth = null;
                $maxCount = 0;
            
                while ($row = $result->fetch_assoc()) {
                    $currentMonth = $row['mes'];
            
                    // Verificar si estamos cambiando de mes o si es el primer mes
                    if ($currentMonth != $prevMonth) {
                        // Guardar el corte más pedido del mes anterior (si existe)
                        if ($prevMonth !== null) {
                            $data[] = $maxData;  // Añadir el corte más pedido de mes anterior
                        }
                        
                        // Actualizar para el nuevo mes
                        $prevMonth = $currentMonth;
                        $maxCount = $row['cantidad'];
                        $maxData = [
                            'mes' => $row['mes'],
                            'corte' => $row['corte'],
                            'cantidad' => $row['cantidad']
                        ];
                    } else {
                        // Si el corte actual tiene más cantidad que el anterior, lo actualizamos
                        if ($row['cantidad'] > $maxCount) {
                            $maxCount = $row['cantidad'];
                            $maxData = [
                                'mes' => $row['mes'],
                                'corte' => $row['corte'],
                                'cantidad' => $row['cantidad']
                            ];
                        }
                    }
                }
            
                // Añadir el último mes procesado
                if ($prevMonth !== null) {
                    $data[] = $maxData;
                }
            
                echo json_encode(['data' => $data]);
                break;
            
            

        default:
            echo json_encode(["error" => "Acción no válida"]);
            break;
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>
