<?php
$numero = "525521726432"; // Número en formato E.164
$mensaje = "Este es un mensaje de prueba.";
$apiKey = "cdcf2da632568dbbe125da0ac3e24552-de1dc3f6-78af-4a96-8e85-3891dfe30b75"; // Clave de Infobip

$url = "https://api.infobip.com/sms/2/text/single";
$headers = [
    "Authorization: App $apiKey",
    "Content-Type: application/json",
];

$data = [
    "from" => "TestSender", // Nombre configurado en Infobip
    "to" => $numero,
    "text" => $mensaje,
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode === 200) {
    echo "SMS enviado exitosamente: $response";
} else {
    echo "Error: $httpCode - $response";
}
curl_close($ch);
