import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import Icon from 'react-fontawesome';
import $ from 'jquery';
import * as d3 from "d3";

import Container from 'muicss/lib/react/container';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Input from 'muicss/lib/react/input';
import Textarea from 'muicss/lib/react/textarea';
import Button from 'muicss/lib/react/button';
import Tabs from 'muicss/lib/react/tabs';
import Tab from 'muicss/lib/react/tab';

class SpaceType extends Component {
  constructor(props) {
    super(props);

    var scope = this;

    scope.state = {
      data : [],
      dataLength : 0,
      calc : {
        occupancy : {
          average : 0,
          percentage : [0,0,0,0,0]
        },
        utilization : {
          average : 0,
          peak_average : 0,
          percentage : [0,0,0,0,0]
        },
        utilization_while_occupied : {
          average : 0,
          percentage : [0,0,0,0,0]
        }
      }
    };
  }

  componentWillMount() {
    var scope = this;
    axios.get('http://localhost:3004/spaces')
      .then(function (response) {

        scope.state.data = response["data"];

        // filter We/Shared room data
        scope.filterData();

        // data initialization
        scope.calcData();

        // default screen
        scope.onOccupancy();

      })
      .catch(function (error) {
        console.log(error);
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.dataLength !== nextState.dataLength) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
  }

  // data initialization

  filterData() {

    var scope = this;

    var filtered_data = scope.state.data.filter(function(d){

      // filter by group
      if (d["i_we"] == "we" && d["owned_shared"] == "shared") {
        return true;
      }

      return false;
    });

    scope.state.data = filtered_data;
  }

  calcData() {
    var scope = this;

    scope.state.dataLength = scope.state.data.length;
    scope.refs.roomCount.innerHTML = scope.state.dataLength;

    scope.state.data.forEach(function(d, i){

      // prevent error data
      if (d.metrics.utilization_max > 1) {
        d.metrics.utilization_max = 1
      }
      if (d.metrics.utilization > d.metrics.utilization_max) {
        d.metrics.utilization = d.metrics.utilization_max;
      }

      // occupancy total, utilization total, peak utilization total, utilization while occupied total
      scope.state.calc.occupancy.average += d.metrics.occupancy;
      scope.state.calc.utilization.average += d.metrics.utilization;
      scope.state.calc.utilization.peak_average += d.metrics.utilization_max;
      scope.state.calc.utilization_while_occupied.average += d.metrics.utilization_when_occupied;

      // percentage
      scope.state.calc.occupancy.percentage[Math.floor(d.metrics.occupancy / 0.2)] ++;
      scope.state.calc.utilization.percentage[Math.floor(d.metrics.utilization / d.metrics.utilization_max)] ++;
      scope.state.calc.utilization_while_occupied.percentage[Math.floor(d.metrics.utilization_when_occupied / 0.2)] ++;
    });

    scope.state.calc.occupancy.average = parseInt(100 * scope.state.calc.occupancy.average / scope.state.dataLength);
    scope.state.calc.utilization.average = parseInt(100 * scope.state.calc.utilization.average / scope.state.dataLength);
    scope.state.calc.utilization.peak_average = parseInt(100 * scope.state.calc.utilization.peak_average / scope.state.dataLength);
    scope.state.calc.utilization_while_occupied.average = parseInt(100 * scope.state.calc.utilization_while_occupied.average / scope.state.dataLength);

  }

  onOccupancy() {

    var scope = this;

    scope.drawOccupancyTable();
    scope.drawOccupancyCircle();
    scope.drawOccupancyBar();
    d3.select(window)
      .on("resize", function() {
        scope.drawOccupancyTable();
        scope.drawOccupancyCircle();
        scope.drawOccupancyBar();
      });
  }

  onUtilization() {
    var scope = this;
    scope.drawUtilizationTable();
    scope.drawUtilizationCircle();
    scope.drawUtilizationBar();
    d3.select(window)
      .on("resize", function() {
        scope.drawUtilizationTable();
        scope.drawUtilizationCircle();
        scope.drawUtilizationBar();
      });
  }

  onUtilizationWhileOccupied() {
    var scope = this;
    scope.drawUtilizationWhileOccupiedTable();
    scope.drawUtilizationWhileOccupiedCircle();
    scope.drawUtilizationWhileOccupiedBar();
    d3.select(window)
      .on("resize", function() {
        scope.drawUtilizationWhileOccupiedTable();
        scope.drawUtilizationWhileOccupiedCircle();
        scope.drawUtilizationWhileOccupiedBar();
      });
  }

  // Space Table
  drawOccupancyTable() {

    var scope = this;

    // legend
    $(".peak-percent-legend-color").hide();
    $(".peak-percent-legend-name").hide();

    // data extract - top 10 value
    var occupancy_data = scope.state.data
      .sort(function(a, b){
        return b.metrics.occupancy - a.metrics.occupancy
      })
      .filter(function(d, i){
        if (i > 10) {
          return false;
        }
        return true;
      });

    // graph building
    $("#space-table-graph").empty();
    var width = $("#space-table-graph").width();
    var svg = d3.select("#space-table-graph").append("svg");

    // background
    svg.append("g")
      .attr("class", "background")
      .selectAll("rect")
      .data([0,1,2,3,4,5,6,7,8,9])
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", function(d){ return d * 30 })
      .attr("width", width)
      .attr("height", 30);

    // Space Name Column
    svg.append("g")
      .attr("class", "col-name")
      .selectAll("text")
      .data(occupancy_data)
      .enter().append("text")
      .attr("x", 5)
      .attr("y", function(d, i){ return i * 30 + 20 })
      .text(function(d){ return d.space_id })
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1)

    // Space Progress Column
    var col_progress = svg.append("g").attr("class", "col-progress");
    col_progress.append("g")
      .attr("class", "progress-bar")
      .selectAll("rect")
      .data(occupancy_data)
      .enter().append("rect")
      .attr("x", width/2)
      .attr("y", function(d, i){ return i * 30 })
      .attr("height", 29)
      .attr("width", 0)
      .transition()
      .duration(500)
      .attr("width", function(d){
        if (d.metrics.occupancy < 1) {
          return width * d.metrics.occupancy / 2
        } else {
          return width / 2
        }
      });
    col_progress.append("g")
      .attr("class", "progress-value")
      .selectAll("text")
      .data(occupancy_data)
      .enter().append("text")
      .attr("y", function(d, i){ return i * 30 + 20 })
      .text(function(d){
        if (d.metrics.occupancy < 1) {
          return (100 * d.metrics.occupancy).toFixed() + "%"
        } else {
          return "100%"
        }
      })
      .style("opacity", 0.3)
      .attr("x", width/2)
      .transition()
      .duration(500)
      .style("opacity", 1)
      .attr("x", function(d){
        if (d.metrics.occupancy < 1) {
          return width * (1 + d.metrics.occupancy) / 2 - 10
        } else {
          return width - 10
        }
      })
  }

  drawUtilizationTable() {

    var scope = this;

    // legend
    $(".peak-percent-legend-color").show();
    $(".peak-percent-legend-name").show();

    // data extract - top 10 value
    var utilization_data = scope.state.data
      .sort(function(a, b){
        return b.metrics.utilization - a.metrics.utilization;
      })
      .filter(function(d, i){
        if (i > 10) {
          return false;
        }
        return true;
      });

    // graph building
    $("#space-table-graph").empty();
    var width = $("#space-table-graph").width();
    var svg = d3.select("#space-table-graph").append("svg");

    // background
    svg.append("g")
      .attr("class", "background")
      .selectAll("rect")
      .data([0,1,2,3,4,5,6,7,8,9])
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", function(d){ return d * 30 })
      .attr("width", width)
      .attr("height", 30);

    // Space Name Column
    svg.append("g")
      .attr("class", "col-name")
      .selectAll("text")
      .data(utilization_data)
      .enter().append("text")
      .attr("x", 5)
      .attr("y", function(d, i){ return i * 30 + 20 })
      .text(function(d){ return d.space_id })
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Space Progress Column
    var col_progress = svg.append("g").attr("class", "col-progress");
    col_progress.append("g")
      .attr("class", "progress-max-bar")
      .selectAll("rect")
      .data(utilization_data)
      .enter().append("rect")
      .attr("x", width/2)
      .attr("y", function(d, i){ return i * 30 })
      .attr("height", 29)
      .attr("width", 0)
      .transition()
      .duration(500)
      .attr("width", function(d){ return width * d.metrics.utilization_max / 2 })
    col_progress.append("g")
      .attr("class", "progress-bar")
      .selectAll("rect")
      .data(utilization_data)
      .enter().append("rect")
      .attr("x", width/2)
      .attr("y", function(d, i){ return i * 30 })
      .attr("height", 29)
      .attr("width", 0)
      .transition()
      .duration(500)
      .attr("width", function(d){ return width * d.metrics.utilization / 2 });
    col_progress.append("g")
      .attr("class", "progress-value")
      .selectAll("text")
      .data(utilization_data)
      .enter().append("text")
      .attr("y", function(d, i){ return i * 30 + 20 })
      .text(function(d){
        if (d.metrics.utilization < 1) {
          return (100 * d.metrics.utilization).toFixed() + "%"
        } else {
          return "100%"
        }
      })
      .attr("x", width/2)
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .attr("x", function(d){ return width * (1 + d.metrics.utilization) / 2 - 10 })
      .style("opacity", 1)
  }

  drawUtilizationWhileOccupiedTable() {

    var scope = this;

    // legend

    $(".peak-percent-legend-color").hide();
    $(".peak-percent-legend-name").hide();

    // data extract - top 10 value
    var utilization_when_occupied_data = scope.state.data
      .sort(function(a, b){
        return b.metrics.utilization_when_occupied - a.metrics.utilization_when_occupied
      })
      .filter(function(d, i){
        if (i > 10) {
          return false;
        }
        return true;
      });

    // graph building
    $("#space-table-graph").empty();
    var width = $("#space-table-graph").width();
    var svg = d3.select("#space-table-graph").append("svg");

    // background
    svg.append("g")
      .attr("class", "background")
      .selectAll("rect")
      .data([0,1,2,3,4,5,6,7,8,9])
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", function(d){ return d * 30 })
      .attr("width", width)
      .attr("height", 30);

    // Space Name Column
    svg.append("g")
      .attr("class", "col-name")
      .selectAll("text")
      .data(utilization_when_occupied_data)
      .enter().append("text")
      .attr("x", 5)
      .attr("y", function(d, i){ return i * 30 + 20 })
      .text(function(d){ return d.space_id })
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1)

    // Space Progress Column
    var col_progress = svg.append("g").attr("class", "col-progress");
    col_progress.append("g")
      .attr("class", "progress-bar")
      .selectAll("rect")
      .data(utilization_when_occupied_data)
      .enter().append("rect")
      .attr("x", width/2)
      .attr("y", function(d, i){ return i * 30 })
      .attr("height", 29)
      .attr("width", 0)
      .transition()
      .duration(500)
      .attr("width", function(d){
        if (d.metrics.utilization_when_occupied < 1) {
          return width * d.metrics.utilization_when_occupied / 2
        } else {
          return width / 2
        }
      })
    col_progress.append("g")
      .attr("class", "progress-value")
      .selectAll("text")
      .data(utilization_when_occupied_data)
      .enter().append("text")
      .attr("y", function(d, i){ return i * 30 + 20 })
      .text(function(d){
        if (d.metrics.utilization_when_occupied < 1) {
          return (100 * d.metrics.utilization_when_occupied).toFixed() + "%"
        } else {
          return "100%"
        }
      })
      .attr("x", width/2)
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .attr("x", function(d){
        if (d.metrics.utilization_when_occupied < 1) {
          return width * (1 + d.metrics.utilization_when_occupied) / 2 - 10
        } else {
          return width - 10
        }
      })
      .style("opacity", 1)
  }

  // Percent Circle
  drawOccupancyCircle() {

    var scope = this;

    var radius  = 80;
    var border  = 3;
    var padding = 20;
    var boxSize = (radius + padding) * 2;

    // Circle definition
    var arc = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_avg1 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_avg2 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);

    function arc_avg_tween1(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_avg1(d);
        };
      };
    }
    function arc_avg_tween2(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_avg2(d);
        };
      };
    }

    // Clear old data
    $("#space-percent-circle svg").remove();

    // Average Circle
    var avg_circle = d3.select("#space-percent-circle").append("svg")
      .attr("width", 200)
      .attr("height", 200);
    avg_circle.append('defs')
      .append('filter')
      .attr('id', 'blur')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '5');
    var avg_circle_g = avg_circle.append('g')
      .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')')
      .append('g')
      .attr("class", "avg-circle");
    avg_circle_g.append('path')
      .attr('class', 'background')
      .attr('d', arc.endAngle(Math.PI * 2));
    avg_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground-blur')
      .attr('d', arc_avg1)
      .transition()
      .duration(500)
      .attrTween("d", arc_avg_tween1(Math.PI * 2 * scope.state.calc.occupancy.average / 100))
    avg_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground')
      .attr('d', arc_avg2)
      .transition()
      .duration(500)
      .attrTween("d", arc_avg_tween2(Math.PI * 2 * scope.state.calc.occupancy.average / 100))
    avg_circle_g.append('text')
      .attr("class", "big-number")
      .text(scope.state.calc.occupancy.average + "%")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    avg_circle_g.append('text')
      .attr("class", "description1")
      .attr('y', '20px')
      .text("Occupancy")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    avg_circle_g.append('text')
      .attr("class", "description2")
      .attr('y', '34px')
      .text("Average")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }

  drawUtilizationCircle() {

    var scope = this;

    var radius  = 80;
    var border  = 3;
    var padding = 20;
    var boxSize = (radius + padding) * 2;

    // Circle definition
    var arc = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_avg1 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_avg2 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_peak1 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_peak2 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);

    function arc_avg_tween1(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_avg1(d);
        };
      };
    }
    function arc_avg_tween2(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_avg2(d);
        };
      };
    }
    function arc_peak_tween1(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_peak1(d);
        };
      };
    }
    function arc_peak_tween2(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_peak2(d);
        };
      };
    }

    // Clear old data
    $("#space-percent-circle svg").remove();

    // Average Circle
    var avg_circle = d3.select("#space-percent-circle").append("svg")
      .attr("width", 200)
      .attr("height", 200);
    avg_circle.append('defs')
      .append('filter')
      .attr('id', 'blur')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '5');
    var avg_circle_g = avg_circle.append('g')
      .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')')
      .append('g')
      .attr("class", "avg-circle");
    avg_circle_g.append('path')
      .attr('class', 'background')
      .attr('d', arc.endAngle(Math.PI * 2));
    avg_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground-blur')
      .attr('d', arc_avg1)
      .transition()
      .duration(500)
      .attrTween("d", arc_avg_tween1(Math.PI * 2 * scope.state.calc.utilization.average / 100))
    avg_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground')
      .attr('d', arc_avg2)
      .transition()
      .duration(500)
      .attrTween("d", arc_avg_tween2(Math.PI * 2 * scope.state.calc.utilization.average / 100))
    avg_circle_g.append('text')
      .attr("class", "big-number")
      .text(scope.state.calc.utilization.average + "%")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    avg_circle_g.append('text')
      .attr("class", "description1")
      .attr('y', '20px')
      .text("Utilization")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    avg_circle_g.append('text')
      .attr("class", "description2")
      .attr('y', '34px')
      .text("Average")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Peak Circle
    var peak_circle = d3.select("#space-percent-circle").append("svg")
      .attr("width", 200)
      .attr("height", 200);
    peak_circle.append('defs')
      .append('filter')
      .attr('id', 'blur')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '2');
    var peak_circle_g = peak_circle.append('g')
      .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')')
      .append('g')
      .attr('class', 'peak-circle')
    peak_circle_g.append('path')
      .attr('class', 'background')
      .attr('d', arc.endAngle(Math.PI * 2));
    peak_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground-blur')
      .attr('d', arc_peak1)
      .transition()
      .duration(500)
      .attrTween("d", arc_peak_tween1(Math.PI * 2 * scope.state.calc.utilization.peak_average / 100));
    peak_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground')
      .attr('d', arc_peak2)
      .transition()
      .duration(500)
      .attrTween("d", arc_peak_tween2(Math.PI * 2 * scope.state.calc.utilization.peak_average / 100))
    peak_circle_g.append('text')
      .attr("class", "big-number")
      .text(scope.state.calc.utilization.peak_average + "%")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    peak_circle_g.append('text')
      .attr("class", "description1")
      .attr('y', '20px')
      .text("Peak Utilization")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    peak_circle_g.append('text')
      .attr("class", "description2")
      .attr('y', '34px')
      .text("Average")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }

  drawUtilizationWhileOccupiedCircle() {

    var scope = this;

    var radius  = 80;
    var border  = 3;
    var padding = 20;
    var boxSize = (radius + padding) * 2;

    // Circle definition
    var arc = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_avg1 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);
    var arc_avg2 = d3.arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);

    function arc_avg_tween1(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_avg1(d);
        };
      };
    }
    function arc_avg_tween2(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc_avg2(d);
        };
      };
    }

    // Clear old data
    $("#space-percent-circle svg").remove();

    // Average Circle
    var avg_circle = d3.select("#space-percent-circle").append("svg")
      .attr("width", 200)
      .attr("height", 200);
    avg_circle.append('defs')
      .append('filter')
      .attr('id', 'blur')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '5');
    var avg_circle_g = avg_circle.append('g')
      .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')')
      .append('g')
      .attr("class", "avg-circle");
    avg_circle_g.append('path')
      .attr('class', 'background')
      .attr('d', arc.endAngle(Math.PI * 2));
    avg_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground-blur')
      .attr('d', arc_avg1)
      .transition()
      .duration(500)
      .attrTween("d", arc_avg_tween1(Math.PI * 2 * scope.state.calc.utilization_while_occupied.average / 100))
    avg_circle_g.append('path')
      .datum({endAngle: 0})
      .attr('class', 'foreground')
      .attr('d', arc_avg2)
      .transition()
      .duration(500)
      .attrTween("d", arc_avg_tween2(Math.PI * 2 * scope.state.calc.utilization_while_occupied.average / 100))
    avg_circle_g.append('text')
      .attr("class", "big-number")
      .text(scope.state.calc.utilization_while_occupied.average + "%")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    avg_circle_g.append('text')
      .attr("class", "description1")
      .attr('y', '20px')
      .text("Utilization Occupied")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
    avg_circle_g.append('text')
      .attr("class", "description2")
      .attr('y', '34px')
      .text("Average")
      .style("opacity", 0.3)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }

  // Percentage Bar

  drawOccupancyBar() {
    var scope = this;

    $("#space-percent-bar").empty();

    var margin = {top: 10, right: 10, bottom: 40, left: 10},
      width = $("#space-percent-bar").innerWidth() - margin.left - margin.right,
      height = 160 - margin.top - margin.bottom;
    var svg = d3.select("#space-percent-bar").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Axis
    var x = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([0, 5]);
    var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, scope.state.dataLength]);
    var x_axis = d3.axisBottom(x)
      .tickValues([0, 1, 2, 3, 4, 5])
      .tickFormat(function(d, i){
        return i * 20 + "%"
      });
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(x_axis)

    // Bars
    g.append("g")
      .attr("class", "percentage-bars")
      .selectAll("rect")
      .data(scope.state.calc.occupancy.percentage)
      .enter().append("rect")
      .attr("x", function(d, i){ return x(i) + 2 })
      .attr("width", width/5 - 2)
      .attr("y", height)
      .attr("height", 0)
      .transition()
      .duration(500)
      .attr("y", function(d){ return y(d) })
      .attr("height", function(d){ return height - y(d) });

    svg.append("g")
      .attr("class", "bottom-label")
      .append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", margin.top + height + 35)
      .text("Occupancy of all spaces");
  }

  drawUtilizationBar() {

    var scope = this;

    $("#space-percent-bar").empty();

    var margin = {top: 10, right: 10, bottom: 40, left: 10},
      width = $("#space-percent-bar").innerWidth() - margin.left - margin.right,
      height = 160 - margin.top - margin.bottom;
    var svg = d3.select("#space-percent-bar").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Axis
    var x = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([0, 5]);
    var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, scope.state.dataLength]);
    var x_axis = d3.axisBottom(x)
      .tickValues([0, 1, 2, 3, 4, 5])
      .tickFormat(function(d, i){
        return i * 20 + "%"
      });
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(x_axis)

    // Bars
    g.append("g")
      .attr("class", "percentage-bars")
      .selectAll("rect")
      .data(scope.state.calc.utilization.percentage)
      .enter().append("rect")
      .attr("x", function(d, i){ return x(i) + 2 })
      .attr("width", width/5 - 2)
      .attr("y", height)
      .attr("height", 0)
      .transition()
      .duration(500)
      .attr("y", function(d){ return y(d) })
      .attr("height", function(d){ return height - y(d) });

    svg.append("g")
      .attr("class", "bottom-label")
      .append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", margin.top + height + 35)
      .text("Utilization of all spaces");
  }

  drawUtilizationWhileOccupiedBar() {
    var scope = this;

    $("#space-percent-bar").empty();

    var margin = {top: 10, right: 10, bottom: 40, left: 10},
      width = $("#space-percent-bar").innerWidth() - margin.left - margin.right,
      height = 160 - margin.top - margin.bottom;
    var svg = d3.select("#space-percent-bar").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Axis
    var x = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([0, 5]);
    var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, scope.state.dataLength]);
    var x_axis = d3.axisBottom(x)
      .tickValues([0, 1, 2, 3, 4, 5])
      .tickFormat(function(d, i){
        return i * 20 + "%"
      });
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(x_axis)

    // Bars
    g.append("g")
      .attr("class", "percentage-bars")
      .selectAll("rect")
      .data(scope.state.calc.utilization_while_occupied.percentage)
      .enter().append("rect")
      .attr("x", function(d, i){ return x(i) + 2 })
      .attr("width", width/5 - 2)
      .attr("y", height)
      .attr("height", 0)
      .transition()
      .duration(500)
      .attr("y", function(d){ return y(d) })
      .attr("height", function(d){ return height - y(d) });

    svg.append("g")
      .attr("class", "bottom-label")
      .append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", margin.top + height + 35)
      .text("Utilization While Occupied of all spaces");
  }

  render() {
    var scope = this;
    return (
      <div className="module-block space-type">
        <Row className="title">
          <span ref="roomCount"></span>
          <span ref="roomRoom">We / Shared Spaces</span>
          <Tabs className="tabs mui--pull-right"  onChange={this.onChange} defaultSelectedIndex={0}>
            <Tab value="occupancy" label="occupancy" onActive={this.onOccupancy.bind(this)}></Tab>
            <Tab value="utilization" label="utilization" onActive={this.onUtilization.bind(this)}></Tab>
            <Tab value="utilization-while-occupied" label="utilization while occupied" onActive={this.onUtilizationWhileOccupied.bind(this)}></Tab>
          </Tabs>
        </Row>
        <div className="content">
          <Row>
            <Col md="6" className="space-table">
              <div className="table-header">
                <Row>
                  <Col xs="6">Space</Col>
                  <Col xs="6">
                    Utilization
                    <Icon name="long-arrow-down" />
                    <Icon name="long-arrow-up" />
                  </Col>
                </Row>
              </div>
              <div className="table-body" id="space-table-graph">
                <svg >
                </svg>
              </div>
              <Row className="table-footer">
                <div className="table-legend">
                  <div className="avg-percent-legend-color"></div>
                  <div className="avg-percent-legend-name">Average %</div>
                  <div className="peak-percent-legend-color"></div>
                  <div className="peak-percent-legend-name">Peak %</div>
                </div>
                <div className="table-pagination">
                  <Icon name="chevron-left" className="page-before"/>
                  <div className="page-start">1</div>
                  -
                  <div className="page-end">10</div>
                  of
                  <div className="page-total">14</div>
                  <Icon name="chevron-right" className="page-after" />
                </div>
              </Row>
            </Col>
            <Col md="6" className="space-summary">
              <div id="space-percent-circle">
              </div>
              <div id="space-percent-bar">
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default SpaceType;