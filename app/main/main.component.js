"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var forms_1 = require('@angular/forms');
//service
var csv_service_1 = require("../service/csv.service");
var D3 = require("d3");
var MainComponent = (function () {
    function MainComponent(csvService) {
        this.csvService = csvService;
        this.countriesArr = [];
    }
    MainComponent.prototype.ngOnInit = function () {
        this.setupForm();
    };
    MainComponent.prototype.ngAfterViewInit = function () {
        this.htmlElement = this.element.nativeElement;
        this.host = D3.select(this.htmlElement);
        this.setupGraph();
        this.loadCountryData(1);
        this.updateGraph();
    };
    MainComponent.prototype.updateGraph = function () {
        if (!this.dataSet || this.dataSet.length === 0 || !this.host)
            return;
        this.buildSVG();
        this.populate();
        this.drawXAxis();
        this.drawYAxis();
        this.addLegend();
    };
    // initial graph setup
    MainComponent.prototype.setupGraph = function () {
        this.margin = { top: 20, right: 20, bottom: 40, left: 40 };
        this.width = this.htmlElement.clientWidth - this.margin.left - this.margin.right;
        this.height = this.width * 0.5 - this.margin.top - this.margin.bottom;
        this.xScale = D3.scaleTime().range([0, this.width]);
        this.yScale = D3.scaleLinear().range([this.height, 0]);
    };
    // SVG creator
    MainComponent.prototype.buildSVG = function () {
        this.host.html("");
        this.svg = this.host.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    };
    // draw X axis from
    MainComponent.prototype.drawXAxis = function () {
        this.xAxis = D3.axisBottom(this.xScale)
            .tickFormat(D3.format(""))
            .tickPadding(15);
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);
    };
    // draw Y axis from
    MainComponent.prototype.drawYAxis = function () {
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
    };
    //populate chart
    MainComponent.prototype.populate = function () {
        var _this = this;
        this.dataSet.forEach(function (area) {
            _this.xScale.domain(D3.extent(area.dataset, function (d) { return d.x; }));
            _this.yScale.domain([0, 1]);
            _this.svg.append("path")
                .datum(area.dataset)
                .attr("fill", "none")
                .attr("stroke", area.settings.fill)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", D3.line()
                .x(function (d) { return _this.xScale(d.x); })
                .y(function (d) { return _this.yScale(d.y); }));
        });
        this.addScatterplot();
    };
    // Add the scatterplot
    MainComponent.prototype.addScatterplot = function () {
        var _this = this;
        var div = D3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        this.dataSet.forEach(function (area) {
            _this.svg.selectAll("dot")
                .data(area.dataset)
                .enter().append("circle")
                .attr("r", 5)
                .attr("cx", function (d) { return _this.xScale(d.x); })
                .attr("cy", function (d) { return _this.yScale(d.y); })
                .attr("stroke", area.settings.fill)
                .attr("fill", area.settings.fill)
                .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>Year:</b> " + d.x
                    + "<br/><b>Sex:</b> " + d.sex
                    + "<br/><b>Measure:</b> " + d.measure
                    + "<br/><b>Mean:</b> " + d.y
                    + "<br/><b>Upper:</b> " + d.upper
                    + "<br/><b>Lower:</b> " + d.lower
                    + "<br/><div style='clear:both;'></div>")
                    .style("left", (D3.event.pageX) + "px")
                    .style("top", (D3.event.pageY - 28) + "px");
            })
                .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        });
    };
    // add legend from dataSet   
    MainComponent.prototype.addLegend = function () {
        var legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("height", 100)
            .attr("width", 100)
            .attr('transform', 'translate(-20,50)');
        legend.selectAll('rect')
            .data(this.dataSet)
            .enter()
            .append("rect")
            .attr("x", this.width - 65)
            .attr("y", function (d, i) { return i * 20; })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d) {
            var color = d.settings.fill;
            return color;
        });
        legend.selectAll('text')
            .data(this.dataSet)
            .enter()
            .append("text")
            .attr("x", this.width - 52)
            .attr("y", function (d, i) { return i * 20 + 9; })
            .text(function (d) {
            var text = d.settings.title;
            return text;
        });
    };
    MainComponent.prototype.fillupData = function (data) {
        var maleData = {
            settings: {
                fill: "rgba(1,67,163,1)",
                title: "Male"
            }, dataset: []
        };
        var femaleData = {
            settings: {
                fill: "rgba(255,0,255,1)",
                title: "Female"
            }, dataset: []
        };
        var filteredData = data.filter(function (item) { return item[5] == "20+ yrs - age-standardized"; }).filter(function (item) { return item[11] == "obese"; });
        var keysArray = Object.keys(filteredData);
        keysArray.forEach(function (key) {
            var current = filteredData[key];
            var datainsert = {
                x: current[3],
                y: Number(current[13]),
                measure: current[12],
                lower: Number(current[14]),
                upper: Number(current[15]),
                sex: current[9]
            };
            if (current[9] == "male") {
                maleData.dataset.push(datainsert);
            }
            else if (current[9] == "female") {
                femaleData.dataset.push(datainsert);
            }
        });
        this.dataSet = new Array();
        this.dataSet.push(maleData);
        this.dataSet.push(femaleData);
        this.updateGraph();
    };
    MainComponent.prototype.loadCountryData = function (countryId) {
        var _this = this;
        this.csvService.readCsvData("countries/" + countryId + ".csv")
            .subscribe(function (data) {
            _this.fillupData(data);
        });
    };
    MainComponent.prototype.setupForm = function () {
        var _this = this;
        this.filterForm = new forms_1.FormGroup({
            countries: new forms_1.FormControl(1, forms_1.Validators.required)
        });
        this.csvService.readCsvData("countries.csv")
            .subscribe(function (data) {
            _this.countriesArr = data;
        });
    };
    MainComponent.prototype.changeCountry = function (countryId) {
        //let countryId = this.filterForm.value["countries"];
        this.loadCountryData(countryId);
        this.updateGraph();
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], MainComponent.prototype, "config", void 0);
    __decorate([
        core_1.ViewChild("graph"), 
        __metadata('design:type', core_1.ElementRef)
    ], MainComponent.prototype, "element", void 0);
    MainComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "main-component",
            templateUrl: "main.component.html",
            styleUrls: ["main.component.css"],
            providers: [csv_service_1.CSVService]
        }), 
        __metadata('design:paramtypes', [csv_service_1.CSVService])
    ], MainComponent);
    return MainComponent;
}());
exports.MainComponent = MainComponent;
//# sourceMappingURL=main.component.js.map