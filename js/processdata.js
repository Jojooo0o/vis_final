var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv",
                 "../data/mass_shootings_2018.csv"];     // saves paths of data sets

var lineColors = ["red", "blue", "green", "yellow", "orange", "black", "black", "black", "black", "black"];


var parseTime = d3.timeParse("%B %d, %Y");
var formatTime = d3.timeFormat("%B %d");
var formatTimeMonthYear = d3.timeFormat("%B %Y");
var parseAgain = d3.timeParse("%B %d");
var dayly = [];
var yearly = [];

var year_data = [];
var day_data = [];

function processData() {

  d3.queue()
    .defer(d3.csv, dataPaths[0])
    .defer(d3.csv, dataPaths[1])
    .defer(d3.csv, dataPaths[2])
    .defer(d3.csv, dataPaths[3])
    .defer(d3.csv, dataPaths[4])
    .awaitAll(function (error, d) {
      day_data = JSON.parse(JSON.stringify(d));
      year_data = JSON.parse(JSON.stringify(d));
      for(var i = 0; i < d.length; ++i) {
        for(var j = 0; j < d[i].length; ++j) {
          // d[i][j].date = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          d[i][j].date = parseTime(d[i][j]["Incident Date"]);
          // d[i][j].dateFake = parseAgain(formatTime(parseTime(d[i][j]["Incident Date"])));
          d[i][j].killed = +d[i][j]["# Killed"];
          d[i][j].injured = +d[i][j]["# Injured"];
          year_data[i][j].date = parseTime(d[i][j]["Incident Date"]);
          year_data[i][j].killed = +d[i][j]["# Killed"];
          year_data[i][j].injured = +d[i][j]["# Injured"];
          day_data[i][j].date = parseTime(d[i][j]["Incident Date"]);
          day_data[i][j].killed = +d[i][j]["# Killed"];
          day_data[i][j].injured = +d[i][j]["# Injured"];
        }
      }

      for(var i = 0; i < year_data.length; ++i) {
        year_data[i] = calcYearOverview(year_data[i]);
      }
      dayly = calcBorders(d);
      yearly = calcBorders(year_data);
      // first drawing outside the loop to give different bool
      drawLineGraph(d[0], year_data[0], false, lineColors[0], dayly, 0);
      for(var i = 1; i < d.length; ++i) {
        drawLineGraph(d[i], year_data[i], true, lineColors[i], dayly, i);
      }

      // updateGraph("year", yearly);
      // updateGraph("day");
      // call functions in here to use data ... cuz storing in global variables aint gonna work brah
    });
}

// recalculate the data for the year
function calcYearOverview(data) {
  var new_data = [];
  var current_day = data[0];  // console.log(lines);
  current_day.date.setDate(1);
  var current_month = data[0].date.getMonth();
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

// takes whole data array to calculate the min and max values for y scale
function calcBorders(data) {
  var max_injured_killed = 0;
  var min_injured_killed = 10000;
  var maxY = 0;
  var minY = 0;

  for(var i = 0; i < data.length; ++i){
    maxY = d3.max(data[i], function(d) { return d.injured + d.killed});
    minY = d3.min(data[i], function(d) { return d.injured + d.killed});
    if(max_injured_killed < maxY) {
      max_injured_killed = maxY;
    }
    if(min_injured_killed > minY) {
      min_injured_killed = minY;
    }
  }
  return [min_injured_killed, max_injured_killed];
}

async function callYearly() {
  console.log(year_data[0][0].date);
  updateGraph("year", year_data[0], yearly, 0);
  // updateGraph("year", year_data[1], yearly, 1);
  for(var i = 0; i < year_data.length; ++i) {
    updateGraph("year", year_data[i], yearly, i);
    await sleep(10);
  }
}

async function callDayly() {
  console.log(day_data[0][0].date);
  updateGraph("day", day_data[0], dayly, 0);
  for(var i = 0; i < year_data.length; ++i) {
    updateGraph("day", day_data[i], dayly, i);
    await sleep(10);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
