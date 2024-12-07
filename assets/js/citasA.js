
document.addEventListener("DOMContentLoaded", () => {
  cargarCitasPendientes();
  cargarHistorialCitas();
});

async function cargarHistorialCitas() {
  const response = await fetch("assets/php/citas.php?action=obtenerHistorialAdmin");
  const citas = await response.json();
  const tablaHistorial = document.getElementById("tabla-historial");
  tablaHistorial.innerHTML = "";

  citas.forEach((cita) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${cita.name}</td>
      <td>${cita.tipo}</td>
      <td>${cita.asunto}</td>
      <td>${cita.fecha}</td>
      <td>✔</td>
      <td>$${cita.costo}</td>
    `;
    tablaHistorial.appendChild(fila);
  });
}

async function cargarCitasPendientes() {
    const response = await fetch("assets/php/citas.php?action=obtenerPendientesAdmin");
    const citas = await response.json();
    const contenedor = document.getElementById("citasP");
    contenedor.innerHTML = "";
  
    citas.forEach(cita => {
      const card = document.createElement("div");

      card.innerHTML = `
<div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
  <div class="card" style="border: 3px solid #fee3ec;">
    <img src="${cita.foto || 'assets/imgUsers/icon.png'}" class="card-img-top mx-auto" alt="Usuario">
    <div class="card-body">
      <h5 class="card-title text-primary">${cita.name}</h5>
      <p class="card-text"><strong>Cita:</strong> ${cita.fecha}</p>
      <p class="card-text"><strong>Asunto:</strong> ${cita.asunto}</p>
      <p class="card-text"><strong>Costo:</strong> $${cita.costo}</p>
      <p class="card-text"><strong>Tipo:</strong> ${cita.tipo}</p>
      <div class="d-flex justify-content-between">
        <button class="btn btn-success btn-sm" onclick="marcarAtendido(${cita.id})">TERMINADO <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
  <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
  <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/></button>

        <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">ELIMINAR CITA <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg></button>
      </div>
    </div>
    </div>
  </div>
</div>
      `;
      contenedor.appendChild(card);
    });
  }

  async function marcarAtendido(id) {
    const response = await fetch(`assets/php/citas.php?action=marcarAtendido&id=${id}`, { method: "GET" });
    const result = await response.json();
    console.log("Respuesta del servidor:", result); // Verifica la respuesta del servidor
  
    if (result.success) {
      Swal.fire(
        "Éxito",
        `Cita marcada como atendida. Teléfono del usuario: ${result.numero}`,
        "success"
      ).then(() => {
        cargarCitasPendientes();
      });
    } else {
      Swal.fire("Error", "No se pudo marcar como atendida", "error");
    }
  }

  async function eliminarCita(id) {
    await fetch(`assets/php/citas.php?action=eliminarCita&id=${id}`, { method: "GET" });
    Swal.fire("Éxito", "Cita eliminada correctamente.", "success").then(() => cargarCitasPendientes());
  }

  