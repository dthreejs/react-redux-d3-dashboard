console.log('huh')
d3.csv('dist-2.csv', function (data) {

  var bin_size = 20;
  var binned = [];
  data.forEach(function (d) {
    var key = Math.floor(d.count / bin_size);
    if (binned[key]) {
      binned[key].hours += parseFloat(d.hours);
    } else {
      binned[key] = {
        count: key * bin_size,
        hours: parseFloat(d.hours)
      }
    }
  })
  /*var n_sensors = 1324;
   *var data = d3.range(720).map(d3.randomBates(5)).map(function (i) {return i / 1});
   *console.log(data);*/

  var svg = d3.select("svg"),
      margin = {top: 5, right: 15, bottom: 20, left: 30},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear()
  /*.domain([0, n_sensors])*/
      .domain([0, d3.max(binned, function (d) {
        return (d.count + bin_size);
      })])
      .range([0, width]);

  // var bins = d3.histogram()
  //     .domain(x.domain())
  //     .thresholds(x.ticks(20))
  // (data);

  var y = d3.scaleLinear()
      .domain([0, d3.max(binned, function(d) {
        return d.hours;
      })])
      .range([height, 0]);

  var bar = g.selectAll(".bar")
      .data(binned)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) {
        return "translate(" + x(d.count) + "," + y(d.hours) + ")";
      });

  bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bin_size) - x(0) - 1)
    .attr("height", function(d) { return height - y(d.hours); });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));
    // .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")));

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(3));
});

