import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {Chart} from 'chart.js'
import {Subscription} from "rxjs";

import {AnalyticsPage} from "../shared/interfaces";

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef: ElementRef
  @ViewChild('order') orderRef: ElementRef
  aSub: Subscription
  average: number
  pending = true

  constructor(private service: AnalyticsService) {
  }

  ngAfterViewInit() {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)'
    }

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)'
    }

    this.aSub = this.service.getAnalytics().subscribe((data: AnalyticsPage) => {
      this.average = data.average
      //data.chart.map(item => item.label) - получить список всех дней с бакенда
      //gainConfig.labels, gainConfig.data - зарезервированные поля chart.js
      gainConfig.labels = data.chart.map(item => item.label)
      gainConfig.data = data.chart.map(item => item.gain)

      orderConfig.labels = data.chart.map(item => item.label)
      orderConfig.data = data.chart.map(item => item.order)

      // ******** Gain **********
      // gainConfig.labels.push('07.10.2018')
      // gainConfig.labels.push('09.10.2018')
      // gainConfig.data.push(3520)
      // gainConfig.data.push(12000)
      // ******** Gain **********

      // ******** Order **********
      // orderConfig.labels.push('07.10.2018')
      // orderConfig.labels.push('09.10.2018')
      // orderConfig.data.push(7)
      // orderConfig.data.push(25
      // ******** Order **********

      const gainCtx = this.gainRef.nativeElement.getContext('2d')
      gainCtx.canvas.height = '300px'

      const orderCtx = this.orderRef.nativeElement.getContext('2d')
      orderCtx.canvas.height = '300px'

      new Chart(gainCtx, createChartConfig(gainConfig))
      new Chart(orderCtx, createChartConfig(orderConfig))

      this.pending = false
    })
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }

}

function createChartConfig({labels, data, label, color}) {
  return {
    type: 'line',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [{
        label, data, borderColor: color, steppedLine: false, fill: false
      }]
    }
  }
}
