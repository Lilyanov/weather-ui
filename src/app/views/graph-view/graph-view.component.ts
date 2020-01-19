import { Component, OnInit, ViewChildren } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { TimeseriesService } from '../../services/timeseries.service'
import * as moment from 'moment';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { RealTimeService } from 'src/app/services/real-time.service';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.scss']
})
export class GraphViewComponent implements OnInit {

  private utcOffset = moment().utcOffset();

  private baseChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
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
              'hour': 'HH:mm'
            }
          }
        },
        {
          id: 'x-axis-1',
          gridLines: {
            lineWidth: 3
          },
          ticks: {
            min: moment().startOf('day').add('minute', this.utcOffset),
            max: moment().startOf('day').add('day', 1).add('minute', this.utcOffset)
          },
          bounds: 'ticks',
          type: 'time',
          time: {
            parser: "YYYY-MM-DD HH:mm",
            unit: 'day',
            minUnit: 'day',
            unitStepSize: 1,
            tooltipFormat: 'YYYY-MM-DD HH:mm',
            displayFormats: {
              'day': 'YYYY-MM-DD'
            }
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
        }
      ]
    }
  };


  @ViewChildren("baseChart") 
  public chart: BaseChartDirective;

  public lineChartPlugins = [pluginAnnotations]

  // Air Quality
  public airQualityChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public airQualityDataSets: ChartDataSets[] = [{ data: [], label: 'PM10' }, { data: [], label: 'PM2.5' }];
  public airQualityLabels: any[] = [];
  public lastPM10Value: any = { value: 0.0 };
  public lastPM25Value: any = { value: 0.0 };

  // Temperature
  public temperatureChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public temperatureDataSets: ChartDataSets[] = [{ data: [], label: 'Temperature' }];
  public temperatureLabels: any[] = [];
  public lastTemperatureValue: any = { value: 0.0 };


  // Humidity
  public humidityChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public humidityDataSets: ChartDataSets[] = [{ data: [], label: 'Humidity' }];
  public humidityLabels: any[] = [];
  public lastHumidityValue: any = { value: 0.0 };

  // Presure
  public pressureChartOptions: (ChartOptions & { annotation: any }) = this.deepCopy(this.baseChartOptions);
  public pressureDataSets: ChartDataSets[] = [{ data: [], label: 'Pressure' }];
  public pressureLabels: any[] = [];
  public lastPressureValue: any = { value: 0.0 };

  public dateFrom: Date;
  private prevousDateFrom: Date;
  public dateTo: Date;
  private prevousDateTo: Date;
  public dataLoaded: boolean;


  constructor(private timeseriesService: TimeseriesService, private realtimeService: RealTimeService) { }

  ngOnInit() {
    this.airQualityChartOptions.scales.yAxes[0].scaleLabel.labelString = 'µg/m3';
    this.airQualityChartOptions.legend.display = true;
    this.airQualityChartOptions.annotation.annotations[0].value = 50;
    this.airQualityChartOptions.annotation.annotations[0].label.content = 'High PM 10';
    this.airQualityChartOptions.annotation.annotations[1].value = 25;
    this.airQualityChartOptions.annotation.annotations[1].label.content = 'High PM 2.5';

    this.temperatureChartOptions.scales.yAxes[0].scaleLabel.labelString = '°C';
    this.temperatureChartOptions.annotation.annotations[0].value = 25;
    this.temperatureChartOptions.annotation.annotations[1].value = 18;

    this.humidityChartOptions.scales.yAxes[0].scaleLabel.labelString = '%';
    this.humidityChartOptions.annotation.annotations[0].value = 60;
    this.humidityChartOptions.annotation.annotations[1].value = 30;

    this.pressureChartOptions.scales.yAxes[0].scaleLabel.labelString = 'hPa';
    this.pressureChartOptions.annotation.annotations[0].value = 1020;
    this.pressureChartOptions.annotation.annotations[1].value = 930;

    this.dateTo = moment().startOf('day').add(1, 'day').toDate();
    this.prevousDateTo = this.dateTo;
    this.dateFrom = moment().startOf('day').toDate();
    this.prevousDateFrom = moment().subtract('day', 1).toDate();
    this.updateDateFrom(this.dateFrom);

    this.realtimeService.getTimeseries().subscribe(message => {
      console.log(message);
      const timeseries = JSON.parse(message.body).body
      this.showTimeseries(timeseries);
    });

  }

  public updateDateTo(newDateTo: Date) {
    if (!this.prevousDateTo || !this.dateTo || this.prevousDateTo.getTime() == newDateTo.getTime()) {
      return;
    }
    this.dateTo = newDateTo;
    this.prevousDateTo = newDateTo;
    const chartDateTo = moment(newDateTo).add('minute', this.utcOffset);
 
    this.airQualityChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.airQualityChartOptions.scales.xAxes[1].ticks.max = chartDateTo;
    this.airQualityChartOptions = this.deepCopy(this.airQualityChartOptions);

    this.temperatureChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.temperatureChartOptions.scales.xAxes[1].ticks.max = chartDateTo;
    this.temperatureChartOptions = this.deepCopy(this.temperatureChartOptions);

    this.humidityChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.humidityChartOptions.scales.xAxes[1].ticks.max = chartDateTo;
    this.humidityChartOptions = this.deepCopy(this.humidityChartOptions);

    this.pressureChartOptions.scales.xAxes[0].ticks.max = chartDateTo;
    this.pressureChartOptions.scales.xAxes[1].ticks.max = chartDateTo;
    this.pressureChartOptions = this.deepCopy(this.pressureChartOptions);

    this.loadTimeseries();
  }

  public updateDateFrom(newDateFrom: Date) {
    if (!this.prevousDateFrom || !this.dateFrom || this.prevousDateFrom.getTime() == newDateFrom.getTime()) {
      return;
    }
    this.dateFrom = newDateFrom;
    this.prevousDateFrom = newDateFrom;
    const chartDateFrom = moment(newDateFrom).add('minute', this.utcOffset);

    this.airQualityChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.airQualityChartOptions.scales.xAxes[1].ticks.min = chartDateFrom;
    this.airQualityChartOptions = this.deepCopy(this.airQualityChartOptions);

    this.temperatureChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.temperatureChartOptions.scales.xAxes[1].ticks.min = chartDateFrom;
    this.temperatureChartOptions = this.deepCopy(this.temperatureChartOptions);

    this.humidityChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.humidityChartOptions.scales.xAxes[1].ticks.min = chartDateFrom;
    this.humidityChartOptions = this.deepCopy(this.humidityChartOptions);

    this.pressureChartOptions.scales.xAxes[0].ticks.min = chartDateFrom;
    this.pressureChartOptions.scales.xAxes[1].ticks.min = chartDateFrom;
    this.pressureChartOptions = this.deepCopy(this.pressureChartOptions);

    this.loadTimeseries();
  }

  private loadTimeseries(): void {
    this.airQualityDataSets[0].data = [];
    this.airQualityDataSets[1].data = [];
    this.airQualityLabels = [];
    this.temperatureLabels = [];
    this.temperatureDataSets[0].data = [];
    this.humidityLabels = [];
    this.humidityDataSets[0].data = [];
    this.pressureLabels = [];
    this.pressureDataSets[0].data = [];
    this.dataLoaded = false;

    this.timeseriesService.getTimeseries(['temperature', 'humidity', 'pressure', 'pmten', 'pmtwofive'], this.dateFrom, this.dateTo)
      .subscribe(timeseriesGroups => {
        this.showTimeseries(timeseriesGroups);
        this.dataLoaded = true;
      }); 
  }

  private showTimeseries(timeseriesGroups: any[]) {
    timeseriesGroups.forEach(tsGroup => {
      if (tsGroup.type === 'temperature') {
        this.loadChartData(tsGroup.timeseries, 
          this.temperatureLabels, this.temperatureDataSets[0].data, this.temperatureChartOptions);

        if (tsGroup.timeseries.length > 0) {
          this.lastTemperatureValue = tsGroup.timeseries[tsGroup.timeseries.length - 1];
        }
      } else if (tsGroup.type === 'humidity') {
        this.loadChartData(tsGroup.timeseries,
          this.humidityLabels, this.humidityDataSets[0].data, this.humidityChartOptions);

        if (tsGroup.timeseries.length > 0) {
          this.lastHumidityValue = tsGroup.timeseries[tsGroup.timeseries.length - 1];
        }
      } else if (tsGroup.type === 'pressure') {
        this.loadChartData(tsGroup.timeseries,
          this.pressureLabels, this.pressureDataSets[0].data, this.pressureChartOptions);

          if (tsGroup.timeseries.length > 0) {
            this.lastPressureValue = tsGroup.timeseries[tsGroup.timeseries.length - 1];
          }
      } else if (tsGroup.type === 'pmten') {
        this.loadChartData(tsGroup.timeseries,
          this.airQualityLabels, this.airQualityDataSets[0].data, this.airQualityChartOptions, ts => ts.value < 1000);

        if (tsGroup.timeseries.length > 0) {
          this.lastPM10Value = tsGroup.timeseries[tsGroup.timeseries.length - 1];
        }
      } else if (tsGroup.type === 'pmtwofive') {
        this.loadChartData(tsGroup.timeseries,
          [], this.airQualityDataSets[1].data, this.airQualityChartOptions, ts=> ts.value < 1000);
        
        if (tsGroup.timeseries.length > 0) {
           this.lastPM25Value = tsGroup.timeseries[tsGroup.timeseries.length - 1];
        }
      }
    });
  }

  private loadChartData(timeseries: any[], labels: any[], dataSet: any[], options: any, tsFilter = (ts => true)) {
    options.annotation.annotations = options.annotation.annotations.slice(0, 2);
    timeseries.forEach(ts => {
      labels.push(moment(ts.valueTime));
      if (tsFilter(ts)) { 
        dataSet.push(ts.value);
      }
    });
  }

  private deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }
}
