// draws LineGraph
// takes: 1. data
//        2. hide or show coordinate system (bool)
//        3. color for the graph
//        4. min and max boundary
// define orientation
var margin = {top: 50, right: 50, bottom: 50, left: 50};
var width = 1600 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// define axis boundaries
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLog().range([height, 0]);

// define line creation
var line = d3.line()
.x(function(data) {return x(data.date);})
.y(function(data) {return y(data.killed + data.injured);});


function drawLineGraph(data, year_data, hide, color1, boundary) {

  // console.log(year_data);
  // create svg
  var svg = d3.select("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create infobox for further information
  var div = d3.select("body").append("div")
    .attr("class", "infobox")
    .style("opacity", 0);

  // store first and last date to define the max border
  var last_date = data[0].date.toString();
  var first_date = data[data.length-1].date.toString();
  data[0].date.setMonth(11,31);
  data[data.length-1].date.setMonth(0,1);

  // calculate x scale
  x.domain(d3.extent(data, function(d) {return d.date;}));

  // change back date
  data[0].date = new Date(last_date);
  data[data.length-1].date = new Date(first_date);

  // calculate y scale
  y.domain([boundary[0] - boundary[0] * 0.1, boundary[1]]);

  // storage for year data (careful, pointy pointer shit, use copy)
  // year_data = calcYearOverview(year_data);

  // create x axis
  var x_axis = d3.axisBottom(x)
    .tickFormat(function(d) {
      return d3.timeFormat("%B")(d)
    });

    // show or hide interface
    if(hide) {
      // x axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis)
        .attr("opacity", 0)
        .attr("class", "x");
        // .remove();

      // y axis
      svg.append("g")
        .call(d3.axisLeft(y)
          .tickFormat(d3.format("d")))
          .remove()
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .attr("y", "6")
        .attr("dy", "0.71em")
        .attr("transform", "rotate(-90)")
        .text("Killed / Injured")
        .remove();

    } else {
      // x axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis)
        .attr("class", "x");

      // x grid ------------------------------------------------------------ bug: last line
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat(""));

      // y axis
      svg.append("g")
        .call(d3.axisLeft(y)
          .tickFormat(d3.format("d")))
          .attr("class", "y")
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .attr("y", "6")
        .attr("dy", "0.71em")
        .attr("transform", "rotate(-90)")
        .text("Killed / Injured");

    }

    // console.log(year_data);

      svg.append("path")
        .attr("class", "line")
        .attr("d", line(data))
        .attr("day", line(data))
        .attr("year", line(year_data))
        .attr("id", 1)
        .attr("stroke", color1)
        .attr("stroke-linejoin", "round") //test it
        .attr("stroke-linecap", "round") //test it
        .attr("stroke-width", 1.5);

      svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("r", 4.5)
        .attr("fill", color1)
        .attr("cx", function(d) { return x(d.date);})
        .attr("cy", function(d) { return y(d.killed + d.injured);})
        .on("mouseover", function(d) {
          div.transition()
            .duration(200)
            .style("opacity", 0.9);
          div.html("<b>" + formatTimeMonthYear(d.date) + "</b><br/>"+  "Killed: " + d.killed +
            "<br/>" + "Injured: " + d.injured + "<br/>" + "Total: " + (d.injured + d.killed))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 25) + "px");})
        .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opactiy", 0);});
}

function updateGraph(input, data, boundary, index) {

  var svg = d3.select("svg");

  y.domain([boundary[0] - boundary[0] * 0.1, boundary[1]]);

  svg.selectAll(".y")
    .transition()
    .duration(2000)
    .call(d3.axisLeft(y)
      .tickFormat(d3.format("d")))

  // store first and last date to define the max border
  var last_date = data[0].date.toString();
  var first_date = data[data.length-1].date.toString();
  data[0].date.setMonth(11,31);
  data[data.length-1].date.setMonth(0,1);

  // calculate x scale
  x.domain(d3.extent(data, function(d) {return d.date;}));

  // change back date
  data[0].date = new Date(last_date);
  data[data.length-1].date = new Date(first_date);

  // console.log(last_date);
  // console.log(first_date);
  // console.log(x.domain());

  var x_axis = d3.axisBottom(x)
    .tickFormat(function(d) {
      return d3.timeFormat("%B")(d)
    });

  // console.log(svg);
  // console.log(svg.selectAll(".x"));

  var get_x_axis = svg.select(function(){
    return this.childNodes[index];
  }).selectAll(".x");
  console.log(get_x_axis);

  get_x_axis.transition()
  .duration(2000)
  .call(x_axis);

  var datapoints = svg.selectAll(".circle");
  datapoints.remove();

  line = d3.line()
    .x(function(data) {return x(data.date);})
    .y(function(data) {return y(data.killed + data.injured);});

  var get_line = svg.select(function(){
    return this.childNodes[index];
  }).selectAll(".line");
  get_line.transition()
    .duration(2000)
    .attrTween("d", function(d) {
      var current_line = this.getAttribute("d");
      // var new_line = this.getAttribute(input);
      var new_line = line(data);
      return d3.interpolatePath(current_line, new_line);
    });
}
