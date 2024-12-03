document.getElementById("form-agendar-cita").addEventListener("submit", async (e) => {
    e.preventDefault();
    const [asunto, costo] = document.getElementById("asunto").value.split(",");
    const fecha = document.getElementById("fecha").value;
  
    if (!asunto || !fecha) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }
  
    const datos = new FormData();
    datos.append("action", "agendarCita");
    datos.append("asunto", asunto);
    datos.append("costo", costo);
    datos.append("fecha", fecha);
  
    const response = await fetch("assets/php/citas.php", { method: "POST", body: datos });
    const result = await response.json();
    if (result.success) {
      Swal.fire("Éxito", "Cita agendada con éxito", "success").then(() => window.location.reload());
    } else {
      Swal.fire("Error", "No se pudo agendar la cita", "error");
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    const userName = usuario.name || "Usuario";
    const userPhoto = usuario.foto || "assets/imgUsers/icon.png";
  
    cargarCitasPendientes();
    cargarHistorialCitas();
  });
  
  async function cargarCitasPendientes() {
    const response = await fetch("assets/php/citas.php?action=obtenerPendientes");
    const citas = await response.json();
    const contenedor = document.getElementById("citas-pendientes");
    contenedor.innerHTML = "";
  
    citas.forEach(cita => {
      const card = document.createElement("div");
      card.className = "card p-3 shadow";
  
      card.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${cita.foto || "assets/imgUsers/icon.png"}" alt="Foto de Perfil" class="rounded-circle" width="60">
          <div class="ms-3">
            <h5>${cita.name}</h5>
            <p><strong>Asunto:</strong> ${cita.asunto}</p>
            <p><strong>Costo:</strong> $${cita.costo}</p>
            <p><strong>Fecha:</strong> ${cita.fecha}</p>
          </div>
        </div>
        <div class="d-flex justify-content-between mt-3">
          <button class="btn btn-success btn-sm" onclick="marcarAtendido(${cita.id})">Atendido</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">Eliminar</button>
        </div>
      `;
      contenedor.appendChild(card);
    });
  }
  
  async function marcarAtendido(id) {
    const response = await fetch(`assets/php/citas.php?action=marcarAtendido&id=${id}`);
    const result = await response.json();
  
    if (result.success) {
      Swal.fire("Éxito", "Cita marcada como atendida.", "success").then(() => {
        cargarCitasPendientes();
        cargarHistorialCitas();  // Asegura que esta función siempre se llame aquí
      });
    } else {
      Swal.fire("Error", "No se pudo marcar como atendida", "error");
    }
  }
  
  
  async function eliminarCita(id) {
    await fetch(`assets/php/citas.php?action=eliminarCita&id=${id}`);
    Swal.fire("Éxito", "Cita eliminada correctamente.", "success").then(() => cargarCitasPendientes());
  }
  
  async function cargarHistorialCitas() {
    const response = await fetch("assets/php/citas.php?action=obtenerHistorial");
    const citas = await response.json();
    const tablaHistorial = document.getElementById("tabla-historial");
    tablaHistorial.innerHTML = "";  // Asegura que el historial se limpie antes
  
    citas.forEach(cita => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cita.asunto}</td>
        <td>${cita.fecha}</td>
        <td>✔</td>
        <td>$${cita.costo}</td>
        
      `;
      tablaHistorial.appendChild(fila);
    });
  }
  
  