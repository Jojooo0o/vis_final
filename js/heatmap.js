// heatmap.js
// Visualization Course 2018
// Bauhaus-University Weimar

var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv",
                 "../data/mass_shootings_2018.csv"];
var incidents = [];
var names = {};
var activeYear = 0;
var activeValue = 0;

function initializeMap(year, value) {
  // change the year of visualization
  var yearString = "";
  activeYear = year;

  if (activeYear == 0) {
    document.getElementById("firstYearBtn").checked = true;
  }

  // change the value of visualization
  activeValue = value;

  if (activeValue == 0) {
    document.getElementById("firstValueBtn").checked = true;
  }

  changeHeader();
  createUSMap();
}

function changeHeader() {
  // create string that informs user about the information that is displayed
  var valueString = "";
  var yearString  = "";

  switch(activeValue) {
  case 1:
    valueString = "Number of People killed in ";
    break;
  case 2:
    valueString = "Number of People injured in ";
    break;
  default:
    valueString = "Number of Mass Shootings in ";
  }

  if (activeYear <= 4) {
    yearString = dataPaths[activeYear].match(new RegExp('[2][0][1-9]{2}'));
  }

  document.getElementById("header").innerHTML = valueString + yearString;
}

function updateChart() {
  // avoid overdrawing by deleting the svg content
  var svg = d3.select("svg");
  svg.selectAll("*").remove();
}

function changeValue(value) {
  updateChart();
  initializeMap(activeYear, value);
}

function changeYear(year) {
  updateChart();
  initializeMap(year, activeValue);
}

// https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object?page=1&tab=votes#tab-top
function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}


function createUSMap() {
  var max_stats = -1;

  // display map in svg-format
  var svg = d3.select("svg");

  // needed to apply gradients to the visualization
  var defs = svg.append("defs");

  // color legend in svg-format
  var legend = svg.append("g")
    .attr("class", "legendWrapper")
    .attr("transform", "translate(" + 400 + "," + 650 + ")");

  // create infobox for further information
  var div = d3.select("body").append("div")
    .attr("class", "infobox")
    .style("opacity", 0);

  var path = d3.geoPath();

  // list of state names and ids to attach to map
  d3.tsv("../data/us-state-names.tsv", function(tsv) {
    // extract just the names and Ids
    tsv.forEach(function(d,i) {
      names[+d.id] = d.name;
    });
  });

  d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  // create d3 time format from string
  var parseTime = d3.timeParse("%B %d, %Y");

  // get the data 2014 - 2018
  d3.queue()
    .defer(d3.csv, dataPaths[0])
    .defer(d3.csv, dataPaths[1])
    .defer(d3.csv, dataPaths[2])
    .defer(d3.csv, dataPaths[3])
    .defer(d3.csv, dataPaths[4])
    .awaitAll(function (error, d) {
      for(var i = 0; i < d.length; ++i) {
        for(var j = 0; j < d[i].length; ++j) {
          d[i][j].date = parseTime(d[i][j]["Incident Date"]);
          d[i][j].killed = +d[i][j]["# Killed"];
          d[i][j].injured = +d[i][j]["# Injured"];
          d[i][j].state = d[i][j]["State"];
          d[i][j].city = d[i][j]["City Or County"];
        }
      }

      // console.log(d);

      // nest data by state (key)
      for (var i = 0; i < d.length; ++i) {
        var incidentsByState = d3.nest()
        .key(function(d) { return d.state; })
        .sortKeys(d3.ascending)
        .rollup(function(s) { return {
          total_incidents: s.length, // amount of incidents in a state
          total_killed: d3.sum(s, function(d) { return d.killed; }),
          total_injured: d3.sum(s, function(d) { return d.injured }),
        }; })
        .entries(d[i]);

        incidents.push(clone(incidentsByState)); // (hack) save copy for every year in incidents
      }

      // console.log(incidents);

      // calculate max amount of the chosen display value and choose the display color
      var max = 0;
      var color_max = "";
      var color_min = "";
      for(var i = 0; i < incidents.length; ++i){
        switch (activeValue) {
          case 1:
            max = d3.max(incidents[i], function(data) { return data.value.total_killed});
            color_min = "lightpink";
            color_max = "red";
            break;
          case 2:
            max = d3.max(incidents[i], function(data) { return data.value.total_injured});
            color_min = "Aquamarine";
            color_max = "LightSeaGreen";
            break;
          default:
            max = d3.max(incidents[i], function(data) { return data.value.total_incidents});
            color_min = "lightblue";
            color_max = "darkblue";
            break;
        }

        if(max_stats < max) {
          max_stats = max;
        }
      }

      // console.log(names);

      var colorsYGB = ["#fa3e6c", "#411f63"];
      var colorRangeYGB = d3.range(0, 1, 1.0 / (colorsYGB.length - 1));
      colorRangeYGB.push(1);

      // define the color gradient
      var colorScaleYGB = d3.scaleLinear()
        .domain(colorRangeYGB)
        .range(colorsYGB)
        .interpolate(d3.interpolateHcl);

      // map data values to the color scale
      var colorInterpolateYGB = d3.scaleLinear()
        .domain([1, max_stats])
        .range([0,1]);

      // create the gradient
      defs.append("linearGradient")
        .attr("id", "gradient-ygb-colors")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop")
        .data(colorsYGB)
        .enter().append("stop")
        .attr("offset", function(d,i) { return i/(colorsYGB.length-1); })
        .attr("stop-color", function(d) { return d; });

      var legendWidth = 500 * 0.6,
          legendHeight = 15;

      // create color scale legend
      legend.append("rect")
        .attr("class", "legendRect")
        .attr("x", -legendWidth/2)
        .attr("y", 10)
        //.attr("rx", legendHeight/2)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient-ygb-colors)");

      // append legend title
      legend.append("text")
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", -2)
        .text(document.getElementById("header").innerHTML);

      //Set scale for x-axis
      var xScale = d3.scaleLinear()
         .range([0, legendWidth])
         .domain([1,max_stats]);

      //Define x-axis
      var xAxis = d3.axisBottom(xScale)
          .ticks(4);  //Set rough # of ticks

      // set x axis
      legend.append("g")
        .attr("class", "axis")  //Assign "axis" class
        .attr("transform", "translate(" + (-legendWidth / 2) + "," + (10 + legendHeight) + ")")
        .call(xAxis);

      svg.append("g")
          .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
          .attr("d", path)
          .attr("fill", function(d) { return calculateGradientColor(d.id) })
          .on("mouseover", function(d) {
            div.transition()
              .duration(200)
              .style("opacity", 0.9);
            div.html(function(s) { return calculateStateInfo(d.id)} )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 25) + "px");
            })
          .on("mouseout", function(d) {
            div.transition()
              .duration(200)
              .style("opacity", "0.0");
            // div.remove();
            });

      svg.append("path")
          .attr("class", "state-borders")
          .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

      function calculateGradientColor(id) {
        // calculate the color value on the color scale
        var id_num = parseInt(id);
        var state = names[id_num];

        for (var i = 0; i < incidents[activeYear].length; ++i) {
          if (incidents[activeYear][i].key == state) {
            // calculate color of the current state by value
            switch (activeValue) {
              case 1:
                if (incidents[activeYear][i].value.total_killed > 0)
                  return colorScaleYGB(colorInterpolateYGB(incidents[activeYear][i].value.total_killed));
                break;
              case 2:
                if (incidents[activeYear][i].value.total_injured > 0)
                  return colorScaleYGB(colorInterpolateYGB(incidents[activeYear][i].value.total_injured));
                break;
              default:
                if (incidents[activeYear][i].value.total_incidents > 0)
                  return colorScaleYGB(colorInterpolateYGB(incidents[activeYear][i].value.total_incidents));
                break;
            }
          }
        }
        return "lightgray"; // no incidents happened in the state
      }

      function calculateStateInfo(id) {
        // connect state visualization to the saved information about the state
        var id_num = parseInt(id);
        var state = names[id_num];

        yearString = dataPaths[activeYear].match(new RegExp('[2][0][1-9]{2}'));

        var infoString = "<b>" + state + " " + yearString + "</b>"
                        + "<br/>Total Incidents: 0"
                        + "<br/>Total Killed: 0"
                        + "<br/>Total Injured: 0";

        for (var i = 0; i < incidents[activeYear].length; ++i) {
          if (incidents[activeYear][i].key == state) {
            var infoString = "<b>" + state + " " + yearString + "</b>"
                            + "<br/>Total Incidents: " + incidents[activeYear][i].value.total_incidents
                            + "<br/>Total Killed: " + incidents[activeYear][i].value.total_killed
                            + "<br/>Total Injured: " + incidents[activeYear][i].value.total_injured;

            return infoString
          }
        }
        return infoString; // no incidents happened in the state
      }

    });
  });
}
