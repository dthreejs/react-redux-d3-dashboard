import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import $ from 'jquery';
import * as d3 from "d3";

import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Tabs from 'muicss/lib/react/tabs';
import Tab from 'muicss/lib/react/tab';

class TimeOfDayChart extends Component {

  constructor(props) {
    super(props);
    this.totalData = [];

    this.state = {
      currentTab: 0,
      data: []
    };
  }

  //get the Full Data from 'http://localhost:3004/TimeChartData'
  componentDidMount() {
    const scope = this;
    axios.get('http://localhost:3004/TimeChartData')
      .then(function (response) {
        // data initialization
        scope.totalData = response.data;
        scope.setState({
          data: scope.filterData(scope.props.filter)
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  // data filter by date and time
  filterData(filter) {
    const scope = this,
      startDate = new Date(filter.dates.start),
      endDate = new Date(filter.dates.end),
      sTime = filter.time.start,
      eTime = filter.time.end;
    let filteredData = [], date, startTime, endTime;

    scope.tempData = [];
    startDate.setHours(0, 0, 0);
    endDate.setHours(23, 59, 59);

    sTime.meridian === "AM" ?
      (startTime = sTime.h * 60 + sTime.m) : (startTime = sTime.h * 60 + sTime.m + 720);
    eTime.meridian === "AM" ?
      (endTime = eTime.h * 60 + eTime.m) : (endTime = eTime.h * 60 + eTime.m + 720);

    scope.totalData.forEach(v => {
      date = new Date(v.interval_start);

      if(date.getTime() >= startDate.getTime() &&  endDate.getTime() >= date.getTime()){
        let selTime = date.getHours() * 60 + date.getMinutes();
        if(selTime >= startTime && endTime > selTime){
          filteredData.push(v)
        }
      }
    });

    for(let key = sTime.h; key <= (eTime.meridian === "AM" ? eTime.h : eTime.h + 12); key++){
      if(!(key === (eTime.meridian === "AM" ? eTime.h : eTime.h + 12) && eTime.m === 0))
        scope.tempData.push({time: key, occupancy: []})
    }

    return scope.hourlyData(filteredData)
  }

  // convert from 30 min data to 1 hr data
  hourlyData(data) {
    const scope = this;
    let averageMean, hrData = [];

    data.forEach(v => {
      if(v.interval_start.includes(":30:00")){
        if(data.find(x => x.interval_start == v.interval_start.replace(":30:00", ":00:00"))){
          averageMean =(v.mean + (data.find(x => x.interval_start == v.interval_start.replace(":30:00", ":00:00"))).mean)/2;
        }else{
          averageMean = v.mean;
        }
        hrData.push({Time: v.interval_start.replace(":30:00", ":00:00"), mean: averageMean});
      }else{
        if(!(data.find(x => x.interval_start == v.interval_start.replace(":00:00", ":30:00")))){
          hrData.push({Time: v.interval_start, mean: v.mean});
        }
      }
    });

    return scope.finalData(hrData)
  }

  // Get the final Data for D3 Chart.
  finalData(hrData) {
    const scope = this;
    let totalOccupancy, counter;
    scope.tempData.occupancy = [];

    scope.tempData.forEach(v => {
      totalOccupancy = 0;
      counter = 0;
      hrData.forEach(d => {
        if((new Date(d.Time)).getHours() === v.time){
          v.occupancy.push(d.mean);
          totalOccupancy = totalOccupancy + d.mean;
          counter++;
        }
      });

      if(counter > 0)
        v.average = totalOccupancy / counter;
      else
        v.average = 0;
    });

    return scope.tempData;
  }

  //Change the activated tab id
  onChangeTab(i, value, tab, ev){
    this.setState({
      currentTab: i
    });
  }

  shouldComponentUpdate(nextProps, nextState){
    if (this.totalData.length > 0 || nextState.data.length > 0) {
      nextState.data = this.filterData(nextProps.filter);
      return true;
    }
    return false;
  }

  render() {
    const that = this;

    return (
      <div className="module-block timeChart">
        <Row className="title">
          <Tabs className="tabs" justified={true} onChange={this.onChangeTab.bind(this)} defaultSelectedIndex={0}>
            <Tab value="occupancy" label="occupancy" />
            <Tab value="utilization" label="utilization" />
            <Tab value="utilization-while-occupied" label="utilization while occupied" />
          </Tabs>
        </Row>
        <div className="content">
          <Row>
            <Col md="12" className="time-of-day-bar">
              <TimeDayChart data={that.state.data} chartType={that.state.currentTab} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

//D3 TimeChart Component
class TimeDayChart extends Component{

  constructor(props) {
    super(props);
  }

  onOccupancy() {
    const scope = this;
    scope.drawOccupancyBar();
    window.addEventListener("resize", function() {
      scope.drawOccupancyBar();
    });
  }

  onUtilization() {
    const scope = this;
    scope.drawUtilizationBar();
    window.addEventListener("resize", function() {
      scope.drawUtilizationBar();
    });
  }

  onUtilizationWhileOccupied() {
    const scope = this;
    scope.drawUtilizationWhileOccupiedBar();
    d3.select(window)
      .on("resize", function() {
        scope.drawUtilizationWhileOccupiedBar();
      });
  }

  // Draw the OccupancyBar of time
  drawOccupancyBar() {
    const scope = this;
    $("#time-of-day-bar").empty();

    const svg_height = 400,
      margin = {top: 40, right: 10, bottom: 60, left: 40},
      width = $("#time-of-day-bar").innerWidth() - margin.left - margin.right,
      height = svg_height - margin.top - margin.bottom,

      svg = d3.select("#time-of-day-bar").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),

      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the ranges
    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(scope.props.data.map(d =>  {
      let x_label;
      if (d.time === 12) x_label = `${d.time} PM`;
      else if (d.time < 12) x_label = `${d.time} AM`;
      else if(d.time > 12) x_label = `${d.time % 12} PM`;
      return x_label;
    }));

    y.domain([0, d3.max(scope.props.data, d => d.occupancy.length === 0 ? 0 : d3.max(d.occupancy, v => v))]);

    const group = g.selectAll(".group")
      .data(scope.props.data)
      .enter().append("g")
      .attr("class", "group");

    group.append("rect")
      .attr("class", "max")
      .attr("x", function(d) {
        let x_label;
        if (d.time === 12)
          x_label = `${d.time} PM`;
        else if (d.time < 12)
          x_label = `${d.time} AM`;
        else if(d.time > 12)
          x_label = `${d.time % 12} PM`;
        return x(x_label); })
      .attr("width", x.bandwidth())
      .attr("y", d => y(0))
      .attr("height", d => 0 )
      .transition()
      .duration(500)
      .attr("y", d => y(d.occupancy.length === 0 ? 0 : (d3.max(d.occupancy, v => v))))
      .attr("height", d => height - y(d.occupancy.length == 0 ? 0 : (d3.max(d.occupancy, v => v))));

    group.append("rect")
      .attr("class", "average")
      .attr("x", function(d) {
        let x_label;
        if (d.time === 12)
          x_label = `${d.time} PM`;
        else if (d.time < 12)
          x_label = `${d.time} AM`;
        else if(d.time > 12)
          x_label = `${d.time % 12} PM`;
        return x(x_label); })
      .attr("width", x.bandwidth())
      .attr("y", d => y(0))
      .attr("height", d => 0 )
      .transition()
      .duration(500)
      .attr("y", d => y(d.average))
      .attr("height", d => height - y(d.average));

    // add the x Axis
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x-axis")
      .call(d3.axisBottom(x));

    // add the y Axis
    g.append("g").call(d3.axisLeft(y).tickSize(-width))
      .attr("class", "y-axis");

    svg.append("g")
      .attr("class", "bottom-label")
      .append("text")
      .attr("x", width / 2 - margin.left)
      .attr("y", margin.top + height + 50)
      .text("Occupancy of all spaces");

    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('width', 400)
      .attr('height', 20)
      .attr('x', 0)
      .attr('y', 0)
      .attr('transform', 'translate(' + (width / 2 - 200) + ' , 0)');

    legend.append('rect')
      .attr('class', 'max')
      .attr('width', 40)
      .attr('height', 20)
      .attr('x', 0)
      .attr('y', 0);
    legend.append('text')
      .attr('x', 50)
      .attr('y', 14)
      .text("Peak Occupancy");
    legend.append('rect')
      .attr('width', 40)
      .attr('height', 20)
      .attr('x', 200)
      .attr('y', 0)
      .attr('class', 'average');
    legend.append('text')
      .attr('x', 250)
      .attr('y', 14)
      .text("Average Occupancy");
  }

  // Draw the UtilizationBar of time
  drawUtilizationBar() {
    const scope = this;
    $("#time-of-day-bar").empty();

    const svg_height = 400,
      margin = {top: 40, right: 10, bottom: 60, left: 40},
      width = $("#time-of-day-bar").innerWidth() - margin.left - margin.right,
      height = svg_height - margin.top - margin.bottom,

      svg = d3.select("#time-of-day-bar").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),

      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the ranges
    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(scope.props.data.map(d =>  {
      let x_label;
      if (d.time === 12) x_label = `${d.time} PM`;
      else if (d.time < 12) x_label = `${d.time} AM`;
      else if(d.time > 12) x_label = `${d.time % 12} PM`;
      return x_label;
    }));

    y.domain([0, (d3.max(scope.props.data, d => d.occupancy.length === 0 ? 0 : d3.max(d.occupancy, v => v)))/1393]);

    const group = g.selectAll(".group")
      .data(scope.props.data)
      .enter().append("g")
      .attr("class", "group");

    group.append("rect")
      .attr("class", "max")
      .attr("x", function(d) {
        let x_label;
        if (d.time === 12)
          x_label = `${d.time} PM`;
        else if (d.time < 12)
          x_label = `${d.time} AM`;
        else if(d.time > 12)
          x_label = `${d.time % 12} PM`;
        return x(x_label); })
      .attr("width", x.bandwidth())
      .attr("y", d => y(0))
      .attr("height", d => 0 )
      .transition()
      .duration(500)
      .attr("y", d => y(d.occupancy.length === 0 ? 0 : (d3.max(d.occupancy, v => v))/1393))
      .attr("height", d => height - y(d.occupancy.length == 0 ? 0 : (d3.max(d.occupancy, v => v))/1393));

    group.append("rect")
      .attr("class", "average")
      .attr("x", function(d) {
        let x_label;
        if (d.time === 12)
          x_label = `${d.time} PM`;
        else if (d.time < 12)
          x_label = `${d.time} AM`;
        else if(d.time > 12)
          x_label = `${d.time % 12} PM`;
        return x(x_label); })
      .attr("width", x.bandwidth())
      .attr("y", d => y(0))
      .attr("height", d => 0 )
      .transition()
      .duration(500)
      .attr("y", d => y(d.average/1393))
      .attr("height", d => height - y(d.average/1393));

    // add the x Axis
    g.append("g").attr("transform", "translate(0," + height + ")").attr("class", "x-axis").call(d3.axisBottom(x));
    // add the y Axis
    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y).tickSize(-width).tickFormat(d3.format(".1%")));

    svg.append("g")
      .attr("class", "bottom-label")
      .append("text")
      .attr("x", width / 2 - margin.left)
      .attr("y", margin.top + height + 50)
      .text("Utilization of all spaces");

    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('width', 400)
      .attr('height', 20)
      .attr('x', 0)
      .attr('y', 0)
      .attr('transform', 'translate(' + (width / 2 - 200) + ' , 0)');

    legend.append('rect')
      .attr('class', 'max')
      .attr('width', 40)
      .attr('height', 20)
      .attr('x', 0)
      .attr('y', 0);
    legend.append('text')
      .attr('x', 50)
      .attr('y', 14)
      .text("Peak Utilization");
    legend.append('rect')
      .attr('width', 40)
      .attr('height', 20)
      .attr('x', 200)
      .attr('y', 0)
      .attr('class', 'average');
    legend.append('text')
      .attr('x', 250)
      .attr('y', 14)
      .text("Average Utilization");
  }

  // Draw the UtilizationWhileOccupiedBar of time
  drawUtilizationWhileOccupiedBar() {
    const scope = this;
    $("#time-of-day-bar").empty();
  }

  render(){
    switch (this.props.chartType) {
      case 0:
        this.onOccupancy();
        break;
      case 1:
        this.onUtilization();
        break;
      case 2:
        this.onUtilizationWhileOccupied();
        break
    }
    return (
      <div id="time-of-day-bar">
      </div>
    )
  }
}

export default TimeOfDayChart;
