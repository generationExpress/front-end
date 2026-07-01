document.addEventListener("DOMContentLoaded", function() {
        // Line Chart - Rendimiento Mensual
        var optionsLine = {
          series: [{
            name: 'Envíos',
            data: [180, 220, 240, 230, 270, 290]
          }, {
            name: 'Entregas',
            data: [175, 210, 235, 220, 260, 285]
          }],
          chart: {
            height: 250,
            type: 'area',
            toolbar: { show: false },
            fontFamily: 'Ubuntu, sans-serif'
          },
          colors: ['#0d6efd', '#20c997'],
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth', width: 2 },
          xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          },
          legend: { position: 'top', horizontalAlign: 'left' }
        };
        var chartLine = new ApexCharts(document.querySelector("#chart-rendimiento"), optionsLine);
        chartLine.render();

        // Donut Chart - Estado de Envíos
        var optionsDonut = {
          series: [25, 60, 11, 4],
          labels: ['En Tránsito', 'Entregados', 'Pendientes', 'Retrasados'],
          chart: {
            type: 'donut',
            height: 250,
            fontFamily: 'Ubuntu, sans-serif'
          },
          colors: ['#0d6efd', '#198754', '#ffc107', '#dc3545'],
          dataLabels: { enabled: false },
          legend: {
            position: 'bottom'
          },
          plotOptions: {
            pie: {
              donut: {
                size: '75%'
              }
            }
          }
        };
        var chartDonut = new ApexCharts(document.querySelector("#chart-estado"), optionsDonut);
        chartDonut.render();

        // Bar Chart - Esta Semana
        var optionsBar = {
          series: [{
            name: 'Nuevos',
            data: [42, 58, 51, 67, 73, 38, 14]
          }, {
            name: 'Entregados',
            data: [40, 56, 49, 65, 70, 36, 14]
          }],
          chart: {
            type: 'bar',
            height: 250,
            stacked: false,
            toolbar: { show: false },
            fontFamily: 'Ubuntu, sans-serif'
          },
          colors: ['#0d6efd', '#20c997'],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '60%',
              borderRadius: 4
            },
          },
          dataLabels: { enabled: false },
          xaxis: {
            categories: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
          },
          legend: { show: false }
        };
        var chartBar = new ApexCharts(document.querySelector("#chart-semana"), optionsBar);
        chartBar.render();
      });