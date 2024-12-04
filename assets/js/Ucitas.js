
document.addEventListener("DOMContentLoaded", () => {
  cargarCortes();
});

async function cargarCortes() {
  try {
    const response = await fetch("assets/php/citas.php?action=obtenerCortes", {
      method: "GET",
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (Array.isArray(data)) {
      const listaCortes = document.getElementById("listaCortes");
      listaCortes.innerHTML = "";
      data.forEach((corte) => {
        const item = document.createElement("div");
        item.className = "d-flex align-items-center mb-3";
        item.innerHTML = `
          <img src="assets/imgCortes/${corte.imagen}" alt="${corte.corte}" class="img-thumbnail me-3" width="60">
          <div>
            <h5>${corte.corte}</h5>
            <p>Precio: $${corte.precio}</p>
            <button class="btn btn-primary btn-sm" onclick="seleccionarCorte('${corte.corte}', ${corte.id_c}, ${corte.precio})">
              Seleccionar
            </button>
          </div>
        `;
        listaCortes.appendChild(item);
      });
    } else {
      console.error("Formato de datos incorrecto:", data);
    }
  } catch (error) {
    console.error("Error al cargar los cortes:", error);
  }
}



function seleccionarCorte(corte, id, precio) {
  document.getElementById("corteSeleccionado").innerHTML = `${corte} - $${precio}`;
  document.getElementById("asunto").value = id;  // Campo oculto para enviar ID
  bootstrap.Modal.getInstance(document.getElementById("modalCortes")).hide();
}


document.getElementById("form-agendar-cita").addEventListener("submit", async (e) => {
  e.preventDefault();
  const corte_id = document.getElementById("asunto").value;
  const fecha = document.getElementById("fecha").value;

  if (!corte_id || !fecha) {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }
  console.log("Datos enviados:", { corte_id, fecha }); // Agrega esta línea para depurar

  const datos = new FormData();
  datos.append("action", "agendarCita");
  datos.append("corte_id", corte_id);
  datos.append("fecha", fecha);

  const response = await fetch("assets/php/citas.php", { method: "POST", body: datos });
  const result = await response.json();
  console.log("Respuesta del servidor:", result); // Agrega esta línea para verificar la respuesta

  if (result.success) {
    Swal.fire("Éxito", "Cita agendada con éxito", "success");
    cargarCitasPendientes();
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
        cargarHistorialCitas();  // Asegura que esta función se llame aquí
      });
    } else {
      Swal.fire("Error", "No se pudo marcar como atendida", "error");
    }
  }
  
  
  
  async function eliminarCita(id) {
    await fetch(`assets/php/citas.php?action=eliminarCita&id=${id}`, { method: "GET" });
    Swal.fire("Éxito", "Cita eliminada correctamente.", "success").then(() => cargarCitasPendientes());
  }
  
  async function cargarHistorialCitas() {
    const response = await fetch("assets/php/citas.php?action=obtenerHistorial");
    const citas = await response.json();
    const tablaHistorial = document.getElementById("tabla-historial");
    tablaHistorial.innerHTML = ""; 

    citas.forEach(cita => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cita.corte}</td>
        <td>${cita.fecha}</td>
        <td>✔</td>
        <td>$${cita.precio}</td>
      `;
      tablaHistorial.appendChild(fila);
    });
}
  
  