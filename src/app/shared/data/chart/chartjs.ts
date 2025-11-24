import { ChartConfiguration, ChartType } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
let root:any = document.querySelector(':root')
const primaryColor = getComputedStyle(root)?.getPropertyValue("--primary-bg-color")

//Line Charts
export let lineChartOptions: ChartConfiguration['options'] = {
  elements: {
    line: {
      tension: 0.5,
    },
  },
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      ticks: {
        color: '#77778e',
      },
      display: true,
      grid: {
        color: 'rgba(119, 119, 142, 0.2)',
      },
    },
    y: {
      ticks: {
        color: '#77778e',
      },
      display: true,
      grid: {
        color: 'rgba(119, 119, 142, 0.2)',
      },
    },
  },
};

export let lineChartType: ChartType = 'line';
export let lineChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      data: [20, 420, 210, 354, 580, 320, 480],
      label: 'Profits',
      backgroundColor: 'transparent',
      borderColor: primaryColor,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: primaryColor,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: primaryColor,
      fill: 'origin',
    },
  ],
  labels: ['Sun', 'Mon', 'Tus', 'Wed', 'Thu', 'Fri', 'Sat'],
};

//BarChart1
export let barChartOptions: ChartConfiguration['options'] = {
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    y: {
      ticks: {
        // beginAtZero: true,
        stepSize: 150,
        color: '#77778e',
      },
      grid: {
        color: 'rgba(119, 119, 142, 0.2)',
      },
    },
    x: {
      ticks: {
        display: true,
        color: '#77778e',
      },
      grid: {
        display: false,
        color: 'rgba(119, 119, 142, 0.2)',
      },
    },
  },
};
export let barChartType: ChartType = 'bar';
export let barChartLegend = true;
export let barChartPlugins = [DataLabelsPlugin];
export let barChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      data: [200, 450, 290, 367, 256, 543, 345],
      label: 'Sales',
      borderWidth: 2,
      backgroundColor: primaryColor,
      borderColor: primaryColor,
      pointBackgroundColor: '#ffffff',
      hoverBackgroundColor: primaryColor,
      hoverBorderColor: primaryColor,
    },
    {
      data: [144, 380, 200, 360, 180, 500, 310],
      label: 'Profit',
      borderWidth: 2,
      backgroundColor: '#53caed',
      borderColor: '#53caed',
      pointBackgroundColor: '#ffffff',
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
};

//BarChart2
export let barChart2Options: ChartConfiguration['options'] = {
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    y: {
      stacked: true,
      ticks: {
        // beginAtZero: true,
        stepSize: 150,
        color: '#77778e',
      },
      grid: {
        color: 'rgba(119, 119, 142, 0.2)',
      },
    },
    x: {
      stacked: true,
      ticks: {
        display: true,
        color: '#77778e',
      },
      grid: {
        display: false,
        color: 'rgba(119, 119, 142, 0.2)',
      },
    },
  },
};
export let barChart2Type: ChartType = 'bar';
export let barChart2Legend = true;
export let barChart2Plugins = [];
export let barChart2Data: ChartConfiguration['data'] = {
  datasets: [
    {
      data: [200, 450, 290, 367, 256, 543, 345],
      label: 'Sales',
      borderWidth: 2,
      backgroundColor: primaryColor,
      borderColor: primaryColor,
      pointBackgroundColor: '#ffffff',
      hoverBackgroundColor: primaryColor,
      hoverBorderColor: primaryColor,
    },
    {
      data: [144, 380, 200, 360, 180, 500, 310],
      label: 'Profit',
      borderWidth: 2,
      backgroundColor: '#53caed',
      borderColor: '#53caed',
      pointBackgroundColor: '#ffffff',
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
};

//Area Chart
export let AreaChartOptions: ChartConfiguration['options'] = {
  elements: {
    line: {
      tension: 0.4,
    },
  },
  maintainAspectRatio: false,
  responsive: true,
  hover: {
    mode: 'nearest',
    intersect: true,
  },

  scales: {
    x: {
      stacked: true,
      ticks: {
        color: '#77778e',
      },
      grid: {
        color: 'rgba(119,119,142, 0.2)',
      },
    },
    y: {
      ticks: {
        color: '#77778e',
      },
      grid: {
        color: 'rgba(119,119,142, 0.2)',
      },
    },
  },
};

export let AreaChartType: ChartType = 'line';
export let AreaChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      label: 'Data1',
      data: [22, 44, 67, 43, 76, 45, 12],
      borderColor: 'rgba(113, 76, 190, 0.9)',
      borderWidth: 1,
      backgroundColor: 'rgba(113, 76, 190, 0.5)',
      pointBackgroundColor:'rgba(113, 76, 190, 0.9)',
      pointHoverBackgroundColor:'rgba(113, 76, 190, 0.5)',
      fill:'origin'
      
    },
    {
      label: 'Data2',
      data: [16, 32, 18, 26, 42, 33, 44],
      borderColor: 'rgba(235, 111, 51 ,0.9)',
      borderWidth: 1,
      backgroundColor: 'rgba(	235, 111, 51, 0.7)',
      pointBackgroundColor:'rgba(235, 111, 51 , 0.9)',
      pointHoverBackgroundColor:'rgba(235, 111, 51 , 0.5)',
      fill:'origin'
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July'],
};

//DoughNut Chart and Pie chart data

export let PieChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      data: [20, 20, 30, 5, 25],
      backgroundColor: [primaryColor, '#53caed', '#01b8ff', '#f16d75', '#29ccbb'],
      hoverBackgroundColor: [
        '#6259c0',
        '#53cae0',
        '#01b8f0',
        '#f16d70',
        '#29ccb0',
      ],
      borderColor: 'transparent',
      hoverBorderColor: 'transparent',
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
};
export let PieChartOptions: ChartConfiguration['options'] = {
  maintainAspectRatio: false,
  responsive: true,
};
export let DoughnutChartType: ChartType = 'doughnut';
export let PieChartType: ChartType = 'pie';

//Radar Chart
export let radarChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
};

export let radarChartType: ChartType = 'radar';
export let radarChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      label: 'Data1',
      data: [65, 59, 66, 45, 56, 55, 40],
      borderColor: 'rgba(113, 76, 190, 0.9)',
      borderWidth: 1,
      backgroundColor: 'rgba(113, 76, 190, 0.5)',
    },
    {
      label: 'Data2',
      data: [28, 12, 40, 19, 63, 27, 87],
      borderColor: 'rgba(235, 111, 51,0.8)',
      borderWidth: 1,
      backgroundColor: 'rgba(235, 111, 51,0.4)',
    },
  ],
  labels: [
    ['Eating', 'Dinner'],
    ['Drinking', 'Water'],
    'Sleeping',
    ['Designing', 'Graphics'],
    'Coding',
    'Cycling',
    'Running',
  ],
};

//Polar Chart
export let polarChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
};

export let polarChartType: ChartType = 'polarArea';
export let polarChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      data: [18, 15, 9, 6, 19],
      backgroundColor: [primaryColor, '#53caed', '#01b8ff', '#f16d75', '#29ccbb'],
      hoverBackgroundColor: [
        primaryColor,
        '#53caed',
        '#01b8ff',
        '#f16d75',
        '#29ccbb',
      ],
      borderColor: 'transparent',
    },
  ],
  labels: ['Data1', 'Data2', 'Data3', 'Data4'],
};
