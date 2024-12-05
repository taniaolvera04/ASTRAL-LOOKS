const masPedidos = async () => {
    const action = document.getElementById('action');
    action.innerHTML = '';

    const datos = new FormData();
    datos.append("action", "masPedidos");

    let respuesta = await fetch("assets/php/cortes.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    const obtenerNombreMes = (mes) => {
        const meses = {
            '01': 'Enero 2024', '02': 'Febrero 2024', '03': 'Marzo 2024', '04': 'Abril 2024',
            '05': 'Mayo 2024', '06': 'Junio 2024', '07': 'Julio 2024', '08': 'Agosto 2024',
            '09': 'Septiembre 2024', '10': 'Octubre 2024', '11': 'Noviembre 2024', '12': 'Diciembre 2024'
        };
        return meses[mes.slice(5, 7)] || mes;
    };

    if (json.data) {
        const cortes = json.data;

        const dataGroupedByMonth = {};

        cortes.forEach(item => {
            const { mes, corte, cantidad } = item;
            if (!dataGroupedByMonth[mes]) {
                dataGroupedByMonth[mes] = {};
            }
            dataGroupedByMonth[mes][corte] = cantidad;
        });

        const mesesDelAno = [
            '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
            '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
        ];

        const meses = mesesDelAno.map(mes => obtenerNombreMes(mes));

        const corteLabels = [...new Set(cortes.map(item => item.corte))];
        const datasets = corteLabels.map(corte => {
            return {
                label: corte,
                data: mesesDelAno.map(mes => dataGroupedByMonth[mes] && dataGroupedByMonth[mes][corte] || 0),
                backgroundColor: '#f6d0df', 
                borderColor: '#e28fb9',  
                borderWidth: 1
            };
        });

        let canvasCortes = document.createElement('canvas');
        canvasCortes.id = 'canvasCortes';
        action.appendChild(canvasCortes);

        let ctxCortes = canvasCortes.getContext('2d');
        let chartCortes = new Chart(ctxCortes, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: datasets
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
    } else {
        console.log("No se recibieron datos");
    }
};
