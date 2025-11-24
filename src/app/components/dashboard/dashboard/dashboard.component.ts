import { Component, OnInit, ViewChild, AfterViewInit,HostListener } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { ApexRandomData } from 'src/app/shared/data/dashboard/dashboardData';
import { ChartOptions, ChartType, ChartData, ChartDataset } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { WashSetupService } from 'src/app/components/mascowash/services/washsetup.service';
Chart.register(...registerables, ChartDataLabels);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  DashboardArrayList: any = [];
  currentYear: any;
  _TotalMasterLC = 0;
  _TotalB2BLC = 0;
  _labelsListMasterLC: any = [];
  _labelsListB2BLC: any = [];
 
  constructor(
    private service: WashSetupService) { }
  
  ngOnInit() {
    this.LoadDashboardData();
  }
  public barChartDataMaster: ChartData<'bar'> = {
    labels: [],       // empty array of labels initially
    datasets: []      // empty datasets initially
  };
  public barChartDataB2B: ChartData<'bar'> = {
    labels: [],       // empty array of labels initially
    datasets: []      // empty datasets initially
  };

  LoadDashboardData() {
    this.DashboardArrayList = [];

    this.service.GetDashboardData().subscribe(
      (data: any) => {
        console.log('Dashboard List', data);
        if (data._LMasterLC && data._LMasterLC.length > 0) {
          this.currentYear = (data._LMasterLC[0].currentYear);
          this._TotalMasterLC = 0;
          this._TotalB2BLC = 0;
          this._labelsListMasterLC = [];
          this._labelsListB2BLC = [];
          for (var i = 0; i < data._LMasterLC.length; i++)
          {
            this._TotalMasterLC += parseInt(data._LMasterLC[i].totalFileNo);
            this._labelsListMasterLC.push(data._LMasterLC[i].monthName)
          }
          for (var i = 0; i < data._LB2BLC.length; i++)
            {
            this._TotalB2BLC += parseInt(data._LB2BLC[i].totalFileNo);
            this._labelsListB2BLC.push(data._LB2BLC[i].monthName);
          }

          //=========================Master LC Chart=============
         
          const labelsMasterLC: string[] = [];
          const dataSetMasterLC: number[] = [];
          
         
          data._LMasterLC.forEach((item: any) => {

            labelsMasterLC.push(item.monthName);
            dataSetMasterLC.push(item.totalFileNo);

          });
          const backgroundColors = dataSetMasterLC.map(() =>
            `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
          );
          this.barChartDataMaster= {
            labels: labelsMasterLC,
            datasets: [
              {
                data: dataSetMasterLC,
                backgroundColor: backgroundColors,
                borderRadius: 8,
              },
            ],
          };
           //=========================B2B LC Chart=============
         
           const labelsB2BLC: string[] = [];
           const dataSetB2BLC: number[] = [];
           
          
           data._LB2BLC.forEach((item: any) => {
 
            labelsB2BLC.push(item.monthName);
            dataSetB2BLC.push(item.totalFileNo);
 
           });
           const backgroundColorsB2B = dataSetB2BLC.map(() =>
             `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
           );
           this.barChartDataB2B= {
             labels: labelsB2BLC,
             datasets: [
               {
                 data: dataSetB2BLC,
                 backgroundColor: backgroundColorsB2B,
                 borderRadius: 8,
               },
             ],
           };
        
         // console.log("Label",this.labels);
        } else {
          alert('No data found in _LMasterLC');
        }
      },
      (error) => {}
    );
  }
  

  public barChartType: ChartType = 'bar';

  public ChartDataLabels = ChartDataLabels;

  
  
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#444',
        font: {
          weight: 'bold',
          size: 14,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {},
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity',
        }
      }
    }
  };
 
}


  


