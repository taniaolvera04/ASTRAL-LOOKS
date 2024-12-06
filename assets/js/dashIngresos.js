const ingresosTotales = async () => {
    const action = document.getElementById('action2');
    action.innerHTML = '';

    const datos = new FormData();
    datos.append("action", "IngresosTotales");

    let respuesta = await fetch("assets/php/dashboard.php", { method: 'POST', body: datos });
    let json = await respuesta.json();
    console.log(json);

    const obtenerNombreMes = (mes) => {
        const meses = {
            '01': 'Enero 2024', '02': 'Febrero 2024', '03': 'Marzo 2024', '04': 'Abril 2024',
            '05': 'Mayo 2024', '06': 'Junio 2024', '07': 'Julio 2024', '08': 'Agosto 2024',
            '09': 'Septiembre 2024', '10': 'Octubre 2024', '11': 'Noviembre 2024', '12': 'Diciembre 2024'
        };
        return meses[mes.slice(5, 7)] || mes;
    };

    if (!json.data || json.data.length === 0) {
        console.log("No se recibieron datos");
        return;
    }

    const ingresos = json.data;
    const dataGroupedByMonth = {};

    ingresos.forEach(item => {
        const { mes, total_ingresos } = item;
        dataGroupedByMonth[mes] = total_ingresos;
    });

    const mesesDelAno = [
        '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
        '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
    ];

    const meses = mesesDelAno.map(mes => obtenerNombreMes(mes));
    const valores = mesesDelAno.map(mes => dataGroupedByMonth[mes] || 0);

    let canvasIngresos = document.createElement('canvas');
    canvasIngresos.id = 'canvasIngresos';
    action.appendChild(canvasIngresos);

    let ctxIngresos = canvasIngresos.getContext('2d');
    new Chart(ctxIngresos, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Ingresos Totales (MX)',
                data: valores,
                backgroundColor: '#28a745',
                borderColor: '#1d7c33',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
};

ingresosTotales();
