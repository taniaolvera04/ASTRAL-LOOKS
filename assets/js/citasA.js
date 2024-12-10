
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
  console.log('CITAS:', citas);
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
      <button class="btn btn-success btn-sm" onclick="marcarAtendido(${cita.id})">TERMINADO</button>

      <button class="btn btn-info btn-sm" onclick="mostrarCupones(${cita.user_id})" data-bs-toggle="modal" data-bs-target="#cuponModal">CUPONES</button>

      <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">ELIMINAR CITA</button>
    </div>
  </div>
</div>
</div>
    `;
    contenedor.appendChild(card);
});


}

// Mostrar cupones
async function mostrarCupones(userId) {
  if (!userId) {
      console.error('User ID no definido');
      document.getElementById('modal-body').innerHTML = '<p>Error: Usuario no válido</p>';
      return;
  }

  console.log('User ID:', userId); // Para depuración

  const response = await fetch(`assets/php/citas.php?action=obtenerCupones&user_id=${userId}`);
  const result = await response.json();

  if (result.success) {
      const cupones = result.cupones;
      let cuponHTML = '';

      if (cupones.length === 0) {
          cuponHTML = '<p>Sin cupones</p>';
      } else {
          cupones.forEach(cupon => {
              cuponHTML += `
              <div class="cupón" id="cupon-${cupon.id}">
                  <p><strong>Beneficio:</strong> ${cupon.beneficio}</p>
                  ${cupon.canjeado === 0 ? 
                    `<button class="btn btn-warning btn-sm" onclick="canjearCupon(${cupon.id})">CANJEAR</button>` 
                    : 
                    `<p>(Canjeado)</p>`
                  }
              </div>`;
          });
      }

      document.getElementById('modal-body').innerHTML = cuponHTML;
  } else {
      document.getElementById('modal-body').innerHTML = '<p>Error al cargar los cupones</p>';
  }
}


// Canjear cupón
async function canjearCupon(cuponId) {
  console.log('ID del cupón:', cuponId); // Verifica que el ID esté llegando correctamente

  const response = await fetch('assets/php/citas.php?action=canjearCupon', {
      method: 'POST',
      body: JSON.stringify({cuponId }),
      headers: {
          'Content-Type': 'application/json'
      }
  });

  const result = await response.json();

  if (result.success) {
      Swal.fire('Éxito', 'El cupón ha sido canjeado.', 'success')
      .then(() => {
          // Actualizar la modal para eliminar el cupón canjeado
          const cuponDiv = document.querySelector(`#cupon-${cuponId}`);
          if (cuponDiv) {
              cuponDiv.remove(); // Elimina el cupón de la modal
          }

          // Cerrar la modal
      });
  } else {
      Swal.fire('Error', result.error, 'error');
  }
}

async function marcarAtendido(id) {
  try {
      const response = await fetch(`assets/php/citas.php?action=marcarAtendido&id=${id}`, { method: "GET" });
      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.success) {
          Swal.fire(
              "Éxito",
              `Cita marcada como atendida. Teléfono del usuario: ${result.numero || "No disponible"}`,
              "success"
          ).then(() => cargarCitasPendientes());
      } else {
          Swal.fire("Error", result.error || "No se pudo marcar como atendida", "error");
      }
  } catch (error) {
      console.error("Error al marcar la cita como atendida:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
  }
}

async function eliminarCita(id) {
  try {
      const response = await fetch(`assets/php/citas.php?action=eliminarCita&id=${id}`, { method: "GET" });
      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.success) {
          Swal.fire("Éxito", "Cita eliminada correctamente.", "success").then(() => cargarCitasPendientes());
      } else {
          Swal.fire("Error", result.error || "No se pudo eliminar la cita.", "error");
      }
  } catch (error) {
      console.error("Error al eliminar la cita:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
  }
}