var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv"];     // saves paths of data sets

var lineColors = ["red", "blue", "green", "yellow"];


function test() {

  var parseTime = d3.timeParse("%B %d, %Y");
  var formatTime = d3.timeFormat("%B %d");
  var parseAgain = d3.timeParse("%B %d");

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1600 - margin.left - margin.right,
    // width = +svg.attr("width") - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    // height = +svg.attr("height") - margin.top - margin.bottom,

  var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLog().range([height, 0]);

  var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.killed + d.injured); });

  d3.queue()
    .defer(d3.csv, dataPaths[0])
    .defer(d3.csv, dataPaths[1])
    .defer(d3.csv, dataPaths[2])
    .defer(d3.csv, dataPaths[3])
    .awaitAll(function (error, d) {
      for(var i = 0; i < d.length; ++i) {
        for(var j = 0; j < d[i].length; ++j) {
          d[i][j].date = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          d[i][j].killed = +d[i][j]["# Killed"];
          d[i][j].injured = +d[i][j]["# Injured"];
        }
      }


      //console.log(d[0][0].date);
      var max_injured_killed = 0;
      var min_injured_killed = 10000;
      var max = 0;
      var min = 0;

      for(var i = 0; i < d.length; ++i){
        max = d3.max(d[i], function(data) { return data.injured + data.killed});
        min = d3.min(d[i], function(data) { return data.injured + data.killed});
        if(max_injured_killed < max) {
          max_injured_killed = max;
        }
        if(min_injured_killed > min) {
          min_injured_killed = min;
        }
      }

      x.domain(d3.extent(d[0], function(data) { return data.date; }));
      y.domain([min_injured_killed, max_injured_killed]);

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .tickFormat(function(d) {
            return d3.timeFormat("%B")(d)
          }));

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


      for(var i = 0; i < d.length; ++i) {
        svg.append("path")
          .data([d[i]])
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", lineColors[i])
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5);
      }
    });
}

function calcYearOverview(data) {
  for(var i = 0; i < data.length; ++i) {
    
  }
}
