import { Component, OnInit, AfterViewInit, Input, ElementRef, ViewChild} from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Http, Response } from "@angular/http";
import {DataSet} from "../model/dataSet";

//service
import { CSVService } from "../service/csv.service";

import * as D3 from "d3";

@Component({
    moduleId: module.id,
    selector: "main-component",
    templateUrl: "main.component.html",
    styleUrls: ["main.component.css"],
    providers: [CSVService]
})

export class MainComponent implements  AfterViewInit, OnInit {

  @Input() config: Array<DataSet>;
  @ViewChild("graph") element: ElementRef;


  private dataSet: Array<DataSet>;

  private host;
  private svg;
  private margin;
  private width;
  private height;
  private xScale;
  private yScale;
  private xAxis;
  private yAxis;
  private htmlElement: HTMLElement;

  private filterForm: FormGroup;
  private countriesArr: string[] = [];

  constructor (private csvService: CSVService) {}

    ngOnInit() {
        this.setupForm();
    }
  
  ngAfterViewInit() {
        this.htmlElement = this.element.nativeElement;
        this.host        = D3.select(this.htmlElement);
        this.setupGraph();
        this.loadCountryData(1);
        this.updateGraph();
  }

  private updateGraph() {
    if (!this.dataSet || this.dataSet.length === 0 || !this.host) return;
    this.buildSVG();
    this.populate();
    this.drawXAxis();
    this.drawYAxis();
    this.addLegend();
  }

  private setupGraph(): void {
    this.margin = { top: 20, right: 20, bottom: 40, left: 40 };
    this.width = this.htmlElement.clientWidth - this.margin.left - this.margin.right;
    this.height = this.width * 0.5 - this.margin.top - this.margin.bottom;
    this.xScale = D3.scaleTime().range([0, this.width]);
    this.yScale = D3.scaleLinear().range([this.height, 0]);
  }


  private buildSVG(): void {
    this.host.html("");
    this.svg = this.host.append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }


  private drawXAxis(): void {
    this.xAxis = D3.axisBottom(this.xScale)
      .tickFormat(D3.format(""))
      .tickPadding(15);
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);
  }


  private drawYAxis(): void {
    this.yAxis = D3.axisLeft(this.yScale)
      .tickFormat(D3.format(".0%"))
      .tickPadding(10);
    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Mean Obesity Prevalence");
  }


  private populate(): void {
    this.dataSet.forEach((area: any) => {
      this.xScale.domain(D3.extent(area.dataset, (d: any) => d.x));
      this.yScale.domain([0, 1]);
      this.svg.append("path")
        .datum(area.dataset)
        .attr("fill", "none")
        .attr("stroke", area.settings.fill)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", 
          D3.line()
          .x((d: any) => this.xScale(d.x))
          .y((d: any) => this.yScale(d.y))
        );
    });
  }

  private addLegend(): void{
    // add legend   
    var legend = this.svg.append("g")
      .attr("class", "legend")
          //.attr("x", w - 65)
          //.attr("y", 50)
      .attr("height", 100)
      .attr("width", 100)
      .attr('transform', 'translate(-20,50)');
      
      legend.selectAll('rect')
        .data(this.dataSet)
        .enter()
        .append("rect")
      .attr("x", this.width - 65)
        .attr("y", function(d, i){ return i *  20;})
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d) { 
          var color = d.settings.fill;
          return color;
        });

      
    legend.selectAll('text')
      .data(this.dataSet)
      .enter()
      .append("text")
	  .attr("x", this.width - 52)
      .attr("y", function(d, i){ return i *  20 + 9;})
	  .text(function(d) {
        var text = d.settings.title;
        return text;
      });
  }

  private fillupData(data: any[]){

        let maleData: DataSet = {
          settings: {
            fill: "rgba(1,67,163,1)",
            title: "Male"
          }, dataset: []
        };
        let femaleData: DataSet = {
          settings: {
            fill: "rgba(255,0,255,1)",
            title: "Female"
          }, dataset: [

          ]
        };

        let filteredData = data.filter(item => item[5] == "20+ yrs - age-standardized").filter(item => item[11] == "obese");

        let keysArray = Object.keys(filteredData);

        keysArray.forEach((key: any) => {
            var current = filteredData[key];
            if (current[9] == "male") {
                maleData.dataset.push({x: current[3], y: Number(current[13])})

            } else if (current[9] == "female") {
                femaleData.dataset.push({x: current[3], y: Number(current[13])})

            }
        });
        
        this.dataSet = new Array<DataSet>();
        this.dataSet.push(maleData);
        this.dataSet.push(femaleData);

        this.updateGraph();
  }

  private loadCountryData(countryId: number): void {

        this.csvService.readCsvData("countries/"+countryId+".csv")
            .subscribe(data => {
                this.fillupData(data);
            });
  }

  private setupForm(): void {

    this.filterForm = new FormGroup({
            countries: new FormControl(1, Validators.required)
        });

      this.csvService.readCsvData("countries.csv")
        .subscribe(data => {
            this.countriesArr = data
        });
  }

  changeCountry(countryId: number) {

    //let countryId = this.filterForm.value["countries"];
    this.loadCountryData(countryId);
    this.updateGraph();
  }
}