import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dataset } from './data/dataset';

import * as Highcharts from 'highcharts';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {


    T: Array<Dataset> = [];
    private orignalChartT: Array<Array<any>> = [[]];
    private nonLinearModel: Array<Array<any>> = [[]];

    a: any;
    b: any;

    constructor(private http: HttpClient) {
        this.readCSV();
    }

    // step 1 : load the hm1_data.csv
    private readCSV() {
        this.http.get('https://zxa011023.github.io/regression/assets/hw1_data.csv', { responseType: 'text' })
            .subscribe(
                data => this.parseData(data),
                error => {
                    throw new Error(`can't load the file.`);
                },
                () => {
                    this.compute();
                    this.drawChart();
                }
            );
    }

    // step 2 : parse the csv data
    private parseData(data) {
        this.T = data.split('\n')
            .filter(e => e !== '')
            .filter(e => !e.includes('X'))
            .map(e => new Dataset(
                +e.split(',')[0], // x
                +e.split(',')[1], // y
                +e.split(',')[0], // transform x
                Math.log(+e.split(',')[1])) // transform y
            );

        // just for chart
        this.orignalChartT = this.T
            .map(e => new Array(e.x, e.y));
    }

    // step 3 : compute the a and b
    private compute() {
        const mean_Y = this.T
            .map(e => e.transformY)
            .reduce((pre, cur) => pre + cur, 0) / this.T.length;
        const mean_X = this.T
            .map(e => e.transformX)
            .reduce((pre, cur) => pre + cur, 0) / this.T.length;

        // b
        this.b =
            this.T
                .map(e => (e.transformY - mean_Y) * (e.transformX - mean_X))
                .reduce((pre, cur) => pre + cur, 0) /
            this.T.map(e => Math.pow((e.transformX - mean_X), 2))
                .reduce((pre, cur) => pre + cur, 0);

        // a -> ln a
        this.a = Math.pow(Math.E, mean_Y - this.b * mean_X);

        this.generateNonLinearModel();
    }

    // step 4 : generate the line of non linear model
    private generateNonLinearModel() {
        // y = ae^bx
        this.nonLinearModel = this.T
            .map(e => new Array(e.x, this.a * Math.pow(Math.E, this.b * e.x)));
    }

    // step 5 : draw the chart
    private drawChart() {
        Highcharts.chart('chart', {
            chart: { type: 'scatter', backgroundColor: '#fafafa' },
            title: { text: 'Chart' },
            yAxis: { title: { text: 'y' } },
            xAxis: { title: { text: 'x' } },
            series: [
                {
                    name: 'orignal dataset',
                    type: 'scatter',
                    data: this.orignalChartT
                },
                {
                    name: 'non-linear model',
                    type: 'line',
                    data: this.nonLinearModel
                },
            ],
            colors: ['#000000', '#f44336']
        });
    }

}
