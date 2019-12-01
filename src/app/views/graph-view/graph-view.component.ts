import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { TimeseriesService } from '../../services/timeseries.service'
import * as moment from 'moment';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.scss']
})
export class GraphViewComponent implements OnInit {

  private utcOffset = moment().utcOffset();

  private baseChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      xAxes: [
        {
          id: 'x-axis-0',
          ticks: {
            min: moment().startOf('day').add('minute', this.utcOffset),
            max: moment().startOf('day').add('day', 1).add('minute', this.utcOffset)
          },
          bounds: 'ticks',
          type: 'time',
          time: {
            parser: "YYYY-MM-DD HH:mm",
            unit: 'hour',
            minUnit: 'hour',
            unitStepSize: 1,
            tooltipFormat: 'YYYY-MM-DD HH:mm',
            displayFormats: {
              'minute': 'HH:mm',
              'hour': 'HH:mm',
            },
          }
        }
      ],
      yAxes: [
        {
          id: 'y-axis-0',
          scaleLabel: {
            display: true
          },
          gridLines: {
            color: 'rgba(255,0,0,0.3)'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 25,
          borderDash: [5, 5],
          borderColor: '#ff6384',
          borderWidth: 2,
          label: {
            yAdjust: 10,
            enabled: true,
            fontColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            content: 'High'
          }
        },
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 19,
          borderColor: '#36a2eb',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            yAdjust: -10,
            enabled: true,
            backgroundColor: 'rgb(54, 162, 235, 0.3)',
            fontColor: '#36a2eb',
            content: 'Low'
          }
        },
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: '00:00',
          borderColor: 'orange',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            yAdjust: -10,
            enabled: true,
            backgroundColor: 'rgb(54, 162, 235, 0.3)',
            fontColor: 'orange',
            content: 'Low'
          }
        }
      ]
    }
  };

  public lineChartPlugins = [pluginAnnotations]

  // Temperature
  public temperatureChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public temperatureDataSets: ChartDataSets[] = [{ data: [], label: 'Temperature' }];
  public temperatureLabels: any[] = [];

  // Humidity
  public humidityChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public humidityDataSets: ChartDataSets[] = [{ data: [], label: 'Humidity' }];
  public humidityLabels: any[] = [];

  // Presure
  public pressureChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public pressureDataSets: ChartDataSets[] = [{ data: [], label: 'Pressure' }];
  public pressureLabels: any[] = [];


  public dateFrom: Date;
  private prevousDateFrom: Date;
  public dateTo: Date;
  private prevousDateTo: Date;
  public dataLoaded: boolean;


  constructor(private timeseriesService: TimeseriesService) { }

  ngOnInit() {
    this.temperatureChartOptions.scales.yAxes[0].scaleLabel.labelString = '°C';
    this.temperatureChartOptions.annotation.annotations[0].value = 25;
    this.temperatureChartOptions.annotation.annotations[1].value = 18;

    this.humidityChartOptions.scales.yAxes[0].scaleLabel.labelString = 'RH';
    this.humidityChartOptions.annotation.annotations[0].value = 60;
    this.humidityChartOptions.annotation.annotations[1].value = 20;

    this.pressureChartOptions.scales.yAxes[0].scaleLabel.labelString = 'hPa';
    this.pressureChartOptions.annotation.annotations[0].value = 1100;
    //this.pressureChartOptions.annotation.annotations[0].label.yAdjust = -10;
    this.pressureChartOptions.annotation.annotations[0].value = 1100;

    this.pressureChartOptions.annotation.annotations[1].value = 900;

    this.dateTo = moment().startOf('day').add(1, 'day').toDate();
    this.prevousDateTo = this.dateTo;
    this.dateFrom = moment().startOf('day').toDate();
    this.prevousDateFrom = moment().subtract('day', 1).toDate();
    this.updateDateFrom(this.dateFrom);

  }

  public updateDateTo(newDateTo: Date) {
    if (!this.prevousDateTo || !this.dateTo || this.prevousDateTo.getTime() == newDateTo.getTime()) {
      return;
    }
    this.dateTo = newDateTo;
    this.prevousDateTo = newDateTo;
    const chartDateTo = moment(newDateTo).add('minute', this.utcOffset);

    this.temperatureChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.temperatureChartOptions = this.deepCopy(this.temperatureChartOptions);

    this.humidityChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.humidityChartOptions = this.deepCopy(this.humidityChartOptions);

    this.pressureChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.pressureChartOptions = this.deepCopy(this.pressureChartOptions);

    this.loadTempreture();
    this.loadHumidty();
    this.loadPressure();
  }

  public updateDateFrom(newDateFrom: Date) {
    if (!this.prevousDateFrom || !this.dateFrom || this.prevousDateFrom.getTime() == newDateFrom.getTime()) {
      return;
    }
    this.dateFrom = newDateFrom;
    this.prevousDateFrom = newDateFrom;
    const chartDateFrom = moment(newDateFrom).add('minute', this.utcOffset);

    this.temperatureChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.temperatureChartOptions = this.deepCopy(this.temperatureChartOptions);

    this.humidityChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.humidityChartOptions = this.deepCopy(this.humidityChartOptions);

    this.pressureChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.pressureChartOptions = this.deepCopy(this.pressureChartOptions);

    this.loadTempreture();
    this.loadHumidty();
    this.loadPressure();
  }

  private loadTempreture(): void {
    this.temperatureLabels = [];
    this.temperatureDataSets[0].data = [];
    this.dataLoaded = false;
    this.timeseriesService.getTimeseries('temperature', this.dateFrom, this.dateTo)
      .subscribe(timeseries => {
        timeseries.forEach(ts => {
          this.temperatureLabels.push(moment(ts.valueTime));
          this.temperatureDataSets[0].data.push(ts.value);
        });
        this.dataLoaded = true;
      });
  }

  private loadHumidty(): void {
    this.humidityLabels = [];
    this.humidityDataSets[0].data = [];
    this.dataLoaded = false;
    this.timeseriesService.getTimeseries('humidity', this.dateFrom, this.dateTo)
      .subscribe(timeseries => {
        timeseries.forEach(ts => {
          this.humidityLabels.push(moment(ts.valueTime));
          this.humidityDataSets[0].data.push(ts.value);
        });
        this.dataLoaded = true;
      });
  }

  private loadPressure(): void {
    this.pressureLabels = [];
    this.pressureDataSets[0].data = [];
    this.dataLoaded = false;
    this.timeseriesService.getTimeseries('pressure', this.dateFrom, this.dateTo)
      .subscribe(timeseries => {
        timeseries.forEach(ts => {
          this.pressureLabels.push(moment(ts.valueTime));
          this.pressureDataSets[0].data.push(ts.value);
        });
        this.dataLoaded = true;
      });
  }

  private deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }
}
