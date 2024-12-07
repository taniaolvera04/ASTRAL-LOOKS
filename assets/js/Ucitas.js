
document.addEventListener("DOMContentLoaded", () => {
  cargarCortes();
  cargarpeinados();
  cargarCitasPendientes();
  cargarHistorialCitas();
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

async function cargarpeinados() {
  try {
    const response = await fetch("assets/php/citas.php?action=obtenerpeinados", {
      method: "GET",
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (Array.isArray(data)) {
      const listapeinados = document.getElementById("listapeinados");
      listapeinados.innerHTML = "";
      data.forEach((peinado) => {
        const item = document.createElement("div");
        item.className = "d-flex align-items-center mb-3";
        item.innerHTML = `
        
          <img src="assets/imgPeinados/${peinado.imagen}" alt="${peinado.peinado}" class="img-thumbnail me-3" width="60">
          <div>
            <h5>${peinado.nombre}</h5>
            <p>Precio: $${peinado.precio}</p>
            <p>Descripcion: ${peinado.descripcion}</p>
            <p>Tiempo: ${peinado.tiempo} minutos</p>
            <button class="btn btn-primary btn-sm" onclick="seleccionarpeinado('${peinado.nombre}', ${peinado.id_peinado}, ${peinado.precio})">
              Seleccionar
            </button>
          </div>
          
        `;
        listapeinados.appendChild(item);
      });
    } else {
      console.error("Formato de datos incorrecto:", data);
    }
  } catch (error) {
    console.error("Error al cargar los peinados:", error);
  }
}

function seleccionarCorte(corte, id, precio) {
  document.getElementById("corteSeleccionado").innerHTML = `${corte} - $${precio}`;
  document.getElementById("asunto").value = id;
  document.getElementById("tipo").value = "corte"; // Tipo corte.
  bootstrap.Modal.getInstance(document.getElementById("modalCortes")).hide();
}

function seleccionarpeinado(peinado, id, precio) {
  document.getElementById("corteSeleccionado").innerHTML = `${peinado} - $${precio}`;
  document.getElementById("asunto").value = id;
  document.getElementById("tipo").value = "peinado"; // Tipo peinado.
  bootstrap.Modal.getInstance(document.getElementById("modalpeinados")).hide();
}



async function enviarSMS(numero, mensaje) {
  try {
    console.log(`Enviando SMS a ${numero}: ${mensaje}`);
    console.log("Datos para envío de SMS:", { numero, mensaje });

    const response = await fetch("assets/php/citas.php?action=enviarSMS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numero, mensaje }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("SMS enviado exitosamente:", result);
    } else {
      console.error("Error al enviar SMS:", result.error);
    }
  } catch (error) {
    console.error("Error en la solicitud de SMS:", error);
  }
}

document.getElementById("form-agendar-cita").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("asunto").value;
  const fecha = document.getElementById("fecha").value;
  const tipo = document.getElementById("tipo").value;

  if (!id || !fecha || !tipo) {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }

  const datos = new FormData();
  datos.append("action", "agendarCita");
  datos.append("id", id);
  datos.append("fecha", fecha);
  datos.append("tipo", tipo);

  const response = await fetch("assets/php/citas.php", { method: "POST", body: datos });
  const result = await response.json();

  if (result.success) {
    Swal.fire("Éxito", `Cita agendada con éxito Teléfono : ${result.numero}`, "success");
    cargarCitasPendientes();

   // Generar y enviar el mensaje SMS personalizado
   const numero = result.numero; // Número obtenido de la respuesta
   const mensaje = `HOLA!!! ${result.usuario}, Tu cita para ${result.nombre} ha sido agendada el ${fecha} a las ${new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}. Te esperamos en ASTRAL-LOOKS. ¡Gracias!`;
   enviarSMS(numero, mensaje);
 } else {
   Swal.fire("Error", "No se pudo agendar la cita", "error");
 }
});



async function cargarCitasPendientes() {
  const response = await fetch("assets/php/citas.php?action=obtenerPendientes");
  const citas = await response.json();
  const contenedor = document.getElementById("citas-pendientes");
  contenedor.innerHTML = "";

  citas.forEach(cita => {
    const card = document.createElement("div");
    card.className = "card p-3 shadow-sm"; 
    
    card.innerHTML = `
      <div class="d-flex flex-column">
    
        <div class="d-flex flex-column align-items-center mb-3">
          <img src="${cita.foto || "assets/imgUsers/icon.png"}" alt="Foto de Perfil" class="rounded-circle" width="60" height="60">
          <h5>${cita.name}</h5>
        </div>

        <div class="d-flex justify-content-between mb-2">
          <div>
            <p><strong>Tipo:</strong> ${cita.tipo}</p>
            <p><strong>Asunto:</strong> ${cita.asunto}</p>
          </div>
          <div>
            <p><strong>Costo:</strong> $${cita.costo}</p>
            <p><strong>Fecha:</strong> ${cita.fecha}</p>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-3">
          <button class="btn btn-success btn-sm" onclick="marcarAtendido(${cita.id})">ATENDIDO <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
  <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
  <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
</svg></button>
          <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">ELIMINAR <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg></button>
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
        `Cita marcada como atendida.`,
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
  
    citas.forEach((cita) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cita.tipo}</td>
        <td>${cita.asunto}</td>
        <td>${cita.fecha}</td>
        <td>✔</td>
        <td>$${cita.costo}</td>
      `;
      tablaHistorial.appendChild(fila);
    });
  }
  
  
  