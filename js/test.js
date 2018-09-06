var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv",
                 "../data/mass_shootings_2018.csv"];     // saves paths of data sets

var lineColors = ["red", "blue", "green", "yellow", "orange"];


function test() {

  var parseTime = d3.timeParse("%B %d, %Y");
  var formatTime = d3.timeFormat("%B %d");
  var formatTimeMonthYear = d3.timeFormat("%B %Y");
  var parseAgain = d3.timeParse("%B %d");

  var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 1700 - margin.left - margin.right,
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

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  d3.queue()
    .defer(d3.csv, dataPaths[0])
    .defer(d3.csv, dataPaths[1])
    .defer(d3.csv, dataPaths[2])
    .defer(d3.csv, dataPaths[3])
    .defer(d3.csv, dataPaths[4])
    .awaitAll(function (error, d) {
      for(var i = 0; i < d.length; ++i) {
        for(var j = 0; j < d[i].length; ++j) {
          // d[i][j].date = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          d[i][j].date = parseTime(d[i][j]["Incident Date"]);
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
        d[i] = calcYearOverview(d[i]);
        max = d3.max(d[i], function(data) { return data.injured + data.killed});
        min = d3.min(d[i], function(data) { return data.injured + data.killed});
        if(max_injured_killed < max) {
          max_injured_killed = max;
        }
        if(min_injured_killed > min) {
          min_injured_killed = min;
        }
      }

      for(var i = 0; i < d.length; ++i) {

        var last_date = d[i][0].date.toString();
        var first_date = d[i][d[i].length-1].date.toString();
        // console.log(date);
        d[i][0].date.setMonth(11,31);
        d[i][d[i].length-1].date.setMonth(0,1);
        // d[i].unshift(d[i][0].date.setMonth(11,31));
        // for(var j = 0; j < d[0].length; ++j) {
        //   console.log("Day: " + d[0][j].date);
        // }
        // console.log("---------------------------");
        // d[i].push(d[i][d[i].length-1].date.setMonth(0,1));
        x.domain(d3.extent(d[i], function(data) { return data.date; }));
        d[i][0].date = new Date(last_date);
        d[i][d[i].length-1].date = new Date(first_date);

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


        svg.append("path")
          .data([d[i]])
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", lineColors[i])
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5);


        svg.selectAll("dot")
          .data(d[i])
          .enter().append("circle")
          .attr("r", 4.5)
          .attr("fill", lineColors[i])
          .attr("cx", function(d) { return x(d.date); })
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
          // .on("mouseover", function(d) { console.log(d.killed); console.log(d.date.getMonth()); showData(this, d.date);})
          // .on("mouseout", function(){ hideData();});
          // .append("title")
          // .text("hello");
          // .text(function(d) {return "Time: " + d.date +
          // "\nKilled: " + d.killed
          // "\nInjured: " + d.injured;});
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

function showData(obj, d) {
 var coord = d3.mouse(obj);
 var infobox = d3.select(".infobox");
 // now we just position the infobox roughly where our mouse is
 infobox.style("left", (coord[0] + 100) + "px" );
 infobox.style("top", (coord[1] - 175) + "px");
 $(".infobox").html(d);
 $(".infobox").show();
 }

function hideData() {
 $(".infobox").hide();
 }
