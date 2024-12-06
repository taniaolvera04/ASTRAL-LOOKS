
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
      card.className = "card p-3 shadow";
  
      card.innerHTML = `
<div class="container d-flex justify-content-center flex-wrap gap-3 mt-4">
  <div class="card">
    <img src="${cita.foto || 'assets/imgUsers/icon.png'}" class="card-img-top mx-auto" alt="Usuario">
    <div class="card-body">
      <h5 class="card-title text-primary">${cita.name}</h5>
      <p class="card-text"><strong>Cita:</strong> ${cita.fecha}</p>
      <p class="card-text"><strong>Asunto:</strong> ${cita.asunto}</p>
      <p class="card-text"><strong>Costo:</strong> $${cita.costo}</p>
      <p class="card-text"><strong>Tipo:</strong> ${cita.tipo}</p>
      <div class="d-flex justify-content-between">
        <button class="btn btn-success btn-sm" onclick="marcarAtendido(${cita.id})">Terminado</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">Eliminar cita</button>
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

  