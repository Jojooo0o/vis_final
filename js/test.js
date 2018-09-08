var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv",
                 "../data/mass_shootings_2018.csv"];     // saves paths of data sets

var lineColors = ["red", "blue", "green", "yellow", "orange", "black", "black", "black", "black", "black"];


function test() {

  var parseTime = d3.timeParse("%B %d, %Y");
  var formatTime = d3.timeFormat("%B %d");
  var formatTimeMonthYear = d3.timeFormat("%B %Y");
  var parseAgain = d3.timeParse("%B %d");

  var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    // width = +svg.attr("width") - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
    // height = +svg.attr("height") - margin.top - margin.bottom,

  var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLog().range([height, 0]);

  var line = d3.line()
    .x(function(d) { return x(d.dateFake); })
    .y(function(d) { return y(d.killed + d.injured); });

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var year_data;

  d3.queue()
    .defer(d3.csv, dataPaths[0])
    .defer(d3.csv, dataPaths[1])
    .defer(d3.csv, dataPaths[2])
    .defer(d3.csv, dataPaths[3])
    .defer(d3.csv, dataPaths[4])
    .awaitAll(function (error, d) {
      year_data = JSON.parse(JSON.stringify(d));
      for(var i = 0; i < d.length; ++i) {
        for(var j = 0; j < d[i].length; ++j) {
          // d[i][j].date = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          d[i][j].date = parseTime(d[i][j]["Incident Date"]);
          d[i][j].dateFake = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          d[i][j].killed = +d[i][j]["# Killed"];
          d[i][j].injured = +d[i][j]["# Injured"];
          year_data[i][j].date = parseTime(d[i][j]["Incident Date"]);
          year_data[i][j].dateFake = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          year_data[i][j].killed = +d[i][j]["# Killed"];
          year_data[i][j].injured = +d[i][j]["# Injured"];

        }
      }
      //console.log(d[0][0].date);
      var max_injured_killed = 0;
      var min_injured_killed = 10000;
      var max = 0;
      var min = 0;

      console.log(year_data);

      for(var i = 0; i < year_data.length; ++i) {
        year_data[i] = calcYearOverview(year_data[i]);
        d.push(year_data[i]);
      }

      for(var i = 0; i < d.length; ++i){
        // d[i] = calcYearOverview(d[i]);
        max = d3.max(d[i], function(data) { return data.injured + data.killed});
        min = d3.min(d[i], function(data) { return data.injured + data.killed});
        if(max_injured_killed < max) {
          max_injured_killed = max;
        }
        if(min_injured_killed > min) {
          min_injured_killed = min;
        }
      }

      for(var i = 0; i < d.length/2; ++i) {
      // for(var i = 0; i < 1; ++i) {

        var last_date = d[i][0].dateFake.toString();
        var first_date = d[i][d[i].length-1].dateFake.toString();
        // console.log(date);
        d[i][0].dateFake.setMonth(11,31);
        d[i][d[i].length-1].dateFake.setMonth(0,1);
        // d[i].unshift(d[i][0].date.setMonth(11,31));
        // for(var j = 0; j < d[0].length; ++j) {
        //   console.log("Day: " + d[0][j].date);
        // }
        // console.log("---------------------------");
        // d[i].push(d[i][d[i].length-1].date.setMonth(0,1));
        x.domain(d3.extent(d[i], function(data) { return data.dateFake; }));
        d[i][0].dateFake = new Date(last_date);
        d[i][d[i].length-1].dateFake = new Date(first_date);

        // d[i].shift();
        // d[i].pop();
        y.domain([min_injured_killed - min_injured_killed*0.1, max_injured_killed]);

        var x_axis = d3.axisBottom(x)
          .tickFormat(function(d) {
            return d3.timeFormat("%B")(d)
          });

        if(i != 0) {
          svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis)
            .remove();
        } else {
          svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);
          svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0,"+ height +")")
            .call(d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat(""));

          svg.append("g")
            .call(d3.axisLeft(y)
              .tickFormat(d3.format("d")))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Killed / Injured");
        }

        console.log(line);

        svg.append("path")
          // .data([d[i]])
          .attr("class", "line")
          .attr("d", line(d[i]))
          .attr("remember", i)
          .attr("stroke", lineColors[i])
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .transition()
          .delay(2000)
          .duration(2000)
          // .attrTween("d", transformGraph(this));
          .attrTween("d", function (de) {
            console.log("remember me: " + this.getAttribute("remember"));
            var prev = this.getAttribute("d");
            console.log("prev: " + prev);
            // var prev = d3.select(this).attr("d");
            console.log(i);
            var updated = line(d[parseInt(this.getAttribute("remember")) + 5]);
            return d3.interpolatePath(prev, updated);
          });
          // // .call(transformGraph, line(d[i]), line(d[i+5]));

        // transformGraph(line(d[i]), line(d[i+5]));

        // d3.select('path')
        //   .transition()
        //   .duration(5000)
        //   .attrTween('d', function (d) {
        //     var previous = d3.select(this).attr('d');
        //     var current = line(d[i+year_data.length]);
        //     return d3.interpolatePath(previous, current);
        //   });
          // .transition()
          //   .duration(500)
          //   .on("start", transformGraph(line, raw_data[i]));
            // .on("start", transformGraph(createLine(raw_data[i])));

        svg.selectAll("dot")
          .data(d[i])
          .enter().append("circle")
          .attr("r", 4.5)
          .attr("fill", lineColors[i])
          .attr("cx", function(d) { return x(d.dateFake); })
          .attr("cy", function(d) { return y(d.killed + d.injured); })
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
    });
}

function calcYearOverview(data) {
  var current_month = data[0].date.getMonth();
  var new_data = []
  var current_day = data[0];
  current_day.date.setDate(1);
  for(var i = 1; i < data.length; ++i) {
    if(data[i].date.getMonth() == current_month) {
      current_day.killed += data[i].killed;
      current_day.injured += data[i].injured;
    } else {
      new_data.push(current_day);
      current_day = data[i];
      current_day.date.setDate(1);
      current_month = data[i].date.getMonth();
    }
  }
  new_data.push(current_day);
  return new_data;
}
