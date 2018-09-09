// define orientation
var margin = {top: 50, right: 50, bottom: 50, left: 50};
var width = 1200 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// define axis boundaries
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLog().range([height, 0]);
// var y = d3.scaleLinear().range([height, 0]);

// define line creation
var line = d3.line()
.x(function(d) {return x(d.date);})
.y(function(d) {return y(d.killed + d.injured);});


// draws LineGraph the first time, defines all values that will not be changed anymore
function drawLineGraph(data, year_data, hide, color1, boundary) {

  // selects svg and gives attributes
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
  // calculate x scale with first and last date
  x.domain(d3.extent(data, function(d) {return d.date;}));
  // change back date to original data
  data[0].date = new Date(last_date);
  data[data.length-1].date = new Date(first_date);

  // calculate y scale with given boundary of values
  y.domain([boundary[0] - boundary[0] * 0.1, boundary[1]]);

  // create x axis
  var x_axis = d3.axisBottom(x)
    .tickFormat(function(d) {
      return d3.timeFormat("%B")(d)
    });

  // show or hide interface parts
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

      // x grid (light grey lines)
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
      // adds first lines for every dataset (year)
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

      // creates dots on lines to get data info via infoboxes
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
          div.html("<b>" + formatTimeNormal(d.date) + "</b><br/>"+  "Killed: " + d.killed +
            "<br/>" + "Injured: " + d.injured + "<br/>" + "Total: " + (d.injured + d.killed))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 25) + "px");})
        .on("mouseout", function(d) {
          div.transition()
            // .duration(500)
            .style("opacity", 0);});

      // makes the x axis labels clickable
      svg.selectAll(".x").selectAll(".tick").on("click", function(d) {callMonthly(d.getMonth());});
}

// does the real magic, all transformation of axes and data happens here
function updateGraph(data, boundary, index, month, year) {

  // same again
  var svg = d3.select("svg");
  // delete all old points so we can add some new. only do this once!
  if(delete_points) {
    svg.selectAll(".circle").remove();
    delete_points = false;
  }

  // create infobox for further information
  var div = d3.select("body").append("div")
    .attr("class", "infobox")
    .style("opacity", 0);

  // define new boundaries
  y.domain([boundary[0] - boundary[0] * 0.1, boundary[1]]);
  // and give them to your axis so defining new ones makes sense
  svg.selectAll(".y")
    .transition()
    .duration(2000)
    .call(d3.axisLeft(y)
      .tickFormat(d3.format("d")))

  // store first and last date to define the max border again
  var last_date = data[0].date.toString();
  var first_date = data[data.length-1].date.toString();
  data[0].date.setMonth(11,31);
  data[data.length-1].date.setMonth(0,1);
  // but be careful, should not set it the way its done above if you only want
  // to show a single month of data
  if(month != null) {
    data[0].date.setMonth(month, 31);
    data[data.length-1].date.setMonth(month,1);
  }

  // calculate x scale
  x.domain(d3.extent(data, function(d) {return d.date;}));

  // change back date
  data[0].date = new Date(last_date);
  data[data.length-1].date = new Date(first_date);
  // aaaaand feed the axis with borders
  var x_axis = d3.axisBottom(x)
    .tickFormat(function(d) {
      if(month == null) {
        return d3.timeFormat("%B")(d)
      } else {
        return d3.timeFormat("%a, %d %b")(d)
      }
    });

  // select the axis labels
  var get_x_axis = svg.select(function(){
    return this.childNodes[index];
  }).selectAll(".x");
  // actually the labels will be selected here
  var ticks = get_x_axis.selectAll(".tick");
  // again, make them clickable
  if (month == null) {
    ticks.on("click", function(d) {callMonthly(d.getMonth());});
  }
  // and transform the stuff!
  get_x_axis.transition()
  .duration(2000)
  .call(x_axis);
  // go for the lines now
  line = d3.line()
    .x(function(d) {return x(d.date);})
    .y(function(d) {return y(resultSelector(d));});
  // take them and transform the hell outa them!
  var get_line = svg.select(function(){
    return this.childNodes[index];
  }).selectAll(".line");
  get_line.transition()
    .style("opacity", 1)
    .duration(1000)
    .attrTween("d", function(d) {
      var current_line = this.getAttribute("d");
      // var new_line = this.getAttribute(input);
      var new_line = line(data);
      return d3.interpolatePath(current_line, new_line);
    });

    // same for the datapoints
    var get_data_points = svg.select(function() {
      return this.childNodes[index];
    }).selectAll(".circle");

    var data_points = get_data_points
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r", 4.5)
      .attr("fill", lineColors[index])
      .attr("cx", function(d) { return x(d.date);})
      .attr("cy", function(d) {return y(resultSelector(d));})
      .style("opacity", 0);

    data_points.transition()
      // .duration(1000)
      .delay(1500)
      .style("opacity", 1);
    // dont forget your fancy little infobox
    data_points
      .on("mouseover", function(d) {
        div.transition()
        .duration(200)
        .style("opacity", 0.9);
        if(year) {
          div.html("<b>" + formatTimeMonthYear(d.date) + "</b><br/>"+  "Killed: " + d.killed +
            "<br/>" + "Injured: " + d.injured + "<br/>" + "Total: " + (d.injured + d.killed))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 25) + "px");
        } else {
          div.html("<b>" + formatTimeNormal(d.date) + "</b><br/>"+  "Killed: " + d.killed +
          "<br/>" + "Injured: " + d.injured + "<br/>" + "Total: " + (d.injured + d.killed))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 25) + "px");}})
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);});
}

// gets rid of the lines and datapoints.
// if you dont want them around you anymore just make a call...
function clearGraph(data, boundary, index, month) {
  var svg = d3.select("svg");

  var get_line = svg.select(function(){
    return this.childNodes[index];
  }).selectAll(".line")
  .transition()
  .duration(200)
  .style("opacity", 0);

  var get_data_points = svg.select(function() {
    return this.childNodes[index];
  }).selectAll(".circle").remove();
}
