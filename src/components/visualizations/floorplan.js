import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import $ from 'jquery';
import * as d3 from "d3";

import Row from 'muicss/lib/react/row';
import Button from 'muicss/lib/react/button';
import Tabs from 'muicss/lib/react/tabs';
import Tab from 'muicss/lib/react/tab';

class FloorPlan extends Component {
  constructor(props) {
    super(props);

    var scope = this;

    scope.state = {
      map : null
    };
  }

  componentWillMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props !== nextProps) {
      this.props = nextProps;

      if (this.isDataReady() == true) {
        this.init();
      }

      return true;
    }
    return false;
  }

  init() {
    this.initColorLegend();
    this.initData();
    this.onOccupancy();
  }

  isDataReady() {
    if (this.props.map == null) {
      return false;
    }
    if (this.props.spaces.length == 0) {
      return false;
    }
    return true;
  }

  initColorLegend() {

    var scope = this;

    $("#color-legend").empty();

    // Color legend on top right

    var margin = {top: 0, right: 20, bottom: 15, left: 20},
      width = $("#color-legend").innerWidth() - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom;
    var svg = d3.select("#color-legend").append("svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([0, 5]);
    var x_axis = d3.axisBottom(x)
      .tickValues([0, 1, 2, 3, 4, 5])
      .tickFormat(function(d, i){
        return i * 20 + "%"
      });
    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(x_axis)
    svg.append("g")
      .attr("class", "color-rect")
      .selectAll("rect")
      .data([1, 2, 3, 4, 5])
      .enter().append("rect")
      .attr("class", function(d){ return "color-lv"+d })
      .attr("x", function(d, i){ return x(i) })
      .attr("y", 0)
      .attr("width", width/5)
      .attr("height", height);
  }

  initData() {
    var spaces_percentage = {};
    this.props.spaces.forEach(function(d){
      var occupancy = d.metrics.occupancy;
      var utilization = (d.metrics.utilization > d.metrics.utilization_max)? 1 : d.metrics.utilization / d.metrics.utilization_max;
      var utilization_when_occupied = d.metrics.utilization_when_occupied;
      spaces_percentage[d.space_id] = {
        occupancy : Math.floor(occupancy / 0.2)+1,
        utilization : Math.floor(utilization / 0.2)+1,
        utilization_when_occupied : Math.floor(utilization_when_occupied / 0.2)+1
      }
    });

    this.state.map = this.props.map;

    var c = 0;

    this.state.map.features.forEach(function(d){
      if (spaces_percentage[d.id] != undefined) {
        d["level"] = spaces_percentage[d.id];
      } else {
        d["level"] = {
          occupancy : 0,
          utilization : 0,
          utilization_when_occupied : 0
        }
      }
    });
  }

  onOccupancy() {

    var scope = this;

    $("#floorplan-heatmap").empty();

    var width = $("#floorplan-heatmap").innerWidth(),
      height = width * 0.5;

    var projection = d3.geoMercator()
      .translate([0, 0])
      .scale(1);
    var path = d3.geoPath()
      .projection(projection);
    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    var svg = d3.select("#floorplan-heatmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    var g = svg.append("g").attr("transform", "translate(0,0)scale(1)");

    var b = path.bounds(scope.state.map),
      s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    //Bind data and create one path per GeoJSON feature
    var room_paths = g.selectAll("path")
      .data(scope.state.map.features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d){
        var classes = ["map-object"];
        Object.keys(d.properties).forEach(function (key) {
          let value = d.properties[key];
          classes.push(key);
          classes.push(value);
          classes.push("color-lv" + d.level.occupancy);
        });
        return classes.join(" ");
      });

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }
  }

  onUtilization() {
    var scope = this;

    $("#floorplan-heatmap").empty();

    var width = $("#floorplan-heatmap").innerWidth(),
      height = width * 0.5;

    var projection = d3.geoMercator()
      .translate([0, 0])
      .scale(1);
    var path = d3.geoPath()
      .projection(projection);
    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    var svg = d3.select("#floorplan-heatmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    var g = svg.append("g").attr("transform", "translate(0,0)scale(1)");

    var b = path.bounds(scope.state.map),
      s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    //Bind data and create one path per GeoJSON feature
    var room_paths = g.selectAll("path")
      .data(scope.state.map.features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d){
        var classes = ["map-object"];
        Object.keys(d.properties).forEach(function (key) {
          let value = d.properties[key];
          classes.push(key);
          classes.push(value);
          classes.push("color-lv" + d.level.utilization);
        });
        return classes.join(" ");
      });

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }
  }

  onUtilizationWhileOccupied() {
    var scope = this;

    $("#floorplan-heatmap").empty();

    var width = $("#floorplan-heatmap").innerWidth(),
      height = width * 0.5;

    var projection = d3.geoMercator()
      .translate([0, 0])
      .scale(1);
    var path = d3.geoPath()
      .projection(projection);
    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    var svg = d3.select("#floorplan-heatmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    var g = svg.append("g").attr("transform", "translate(0,0)scale(1)");

    var b = path.bounds(scope.state.map),
      s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    //Bind data and create one path per GeoJSON feature
    var room_paths = g.selectAll("path")
      .data(scope.state.map.features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d){
        var classes = ["map-object"];
        Object.keys(d.properties).forEach(function (key) {
          let value = d.properties[key];
          classes.push(key);
          classes.push(value);
          classes.push("color-lv" + d.level.utilization_when_occupied);
        });
        return classes.join(" ");
      });

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }
  }

  render() { 
    var scope = this;
    return (
      <div className="module-block floorplan">
        <Row className="header">
          <div id="color-legend" className="mui--pull--right">
          </div>
          <Tabs className="tabs" defaultSelectedIndex={0}>
            <Tab value="occupancy" label="occupancy" onActive={this.onOccupancy.bind(this)}></Tab>
            <Tab value="utilization" label="utilization" onActive={this.onUtilization.bind(this)}></Tab>
            <Tab value="utilization-while-occupied" label="utilization while occupied" onActive={this.onUtilizationWhileOccupied.bind(this)}></Tab>
          </Tabs>
        </Row>
        <div className="content">
          <div id="floorplan-heatmap"></div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    map: state.overview.map,
    spaces: state.overview.spaces
  };
}

export default connect(
  mapStateToProps
)(FloorPlan);

// export default FloorPlan;