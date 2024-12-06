<?php
require 'bd.php';
header('Content-Type: application/json; charset=utf-8');

// Obtener la acción solicitada
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if (!$action) {
    echo json_encode(['success' => false, 'mensaje' => 'Acción no definida']);
    exit;
}

switch ($action) {
    case 'PeinadosMasPedidos':
        $query = "SELECT 
                    DATE_FORMAT(c.fecha, '%Y-%m') AS mes, 
                    pe.nombre AS peinado, 
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
                JOIN peinados pe ON c.asunto = pe.nombre 
                WHERE c.finalizado = 1 
                GROUP BY mes, peinado 
                ORDER BY mes, cantidad DESC";

        $result = $cx->query($query);
        $data = [];
        $prevMonth = null;
        $maxData = null;

        while ($row = $result->fetch_assoc()) {
            $currentMonth = $row['mes'];

            if ($currentMonth != $prevMonth) {
                if ($maxData !== null) {
                    $data[] = $maxData;
                }
                $prevMonth = $currentMonth;
                $maxData = $row;
            } elseif ($row['cantidad'] > $maxData['cantidad']) {
                $maxData = $row;
            }
        }
        if ($maxData !== null) {
            $data[] = $maxData;
        }
        echo json_encode(['data' => $data]);
        break;

    case 'CortesMasPedidos':
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
        $maxData = null;

        while ($row = $result->fetch_assoc()) {
            $currentMonth = $row['mes'];

            if ($currentMonth != $prevMonth) {
                if ($prevMonth !== null) {
                    $data[] = $maxData;
                }
                $prevMonth = $currentMonth;
                $maxCount = $row['cantidad'];
                $maxData = [
                    'mes' => $row['mes'],
                    'corte' => $row['corte'],
                    'cantidad' => $row['cantidad']
                ];
            } elseif ($row['cantidad'] > $maxCount) {
                $maxCount = $row['cantidad'];
                $maxData = [
                    'mes' => $row['mes'],
                    'corte' => $row['corte'],
                    'cantidad' => $row['cantidad']
                ];
            }
        }

        if ($prevMonth !== null) {
            $data[] = $maxData;
        }
        echo json_encode(['data' => $data]);
        break;

        case 'IngresosTotales':
            $query = "SELECT 
                        DATE_FORMAT(fecha, '%Y-%m') AS mes,
                        SUM(costo) AS total_ingresos
                      FROM citas
                      WHERE finalizado = 1
                      GROUP BY mes
                      ORDER BY mes ASC";
    
            $result = $cx->query($query);
            $data = [];
    
            while ($row = $result->fetch_assoc()) {
                $data[] = [
                    'mes' => $row['mes'],
                    'total_ingresos' => (float) $row['total_ingresos']
                ];
            }
            echo json_encode(['data' => $data]);
            break;
    
            

    default:
        echo json_encode(['success' => false, 'mensaje' => 'Acción no reconocida']);
        break;
}
?>
