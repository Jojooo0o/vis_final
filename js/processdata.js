var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv",
                 "../data/mass_shootings_2018.csv"];     // saves paths of data sets

var lineColors = ["red", "blue", "green", "yellow", "orange", "black", "black", "black", "black", "black"];


var parseTime = d3.timeParse("%B %d, %Y");
var formatTime = d3.timeFormat("%B %d");
var formatTimeMonthYear = d3.timeFormat("%B %Y");
var formatTimeNormal = d3.timeFormat("%B %d, %Y");
var parseAgain = d3.timeParse("%B %d");
var dayly = [];
var yearly = [];

var year_data = [];
var month_data = [];
var day_data = [];
var show_data = [];
var show_types = [true, true];

var delete_points = false;

var current_graphic;

function processData() {

  d3.queue()
    .defer(d3.csv, dataPaths[0])
    .defer(d3.csv, dataPaths[1])
    .defer(d3.csv, dataPaths[2])
    .defer(d3.csv, dataPaths[3])
    .defer(d3.csv, dataPaths[4])
    .awaitAll(function (error, d) {
      day_data = JSON.parse(JSON.stringify(d));
      month_data = JSON.parse(JSON.stringify(d));
      year_data = JSON.parse(JSON.stringify(d));
      for(var i = 0; i < d.length; ++i) {
        for(var j = 0; j < d[i].length; ++j) {
          d[i][j].date = parseTime(d[i][j]["Incident Date"]);
          d[i][j].killed = +d[i][j]["# Killed"];
          d[i][j].injured = +d[i][j]["# Injured"];
          day_data[i][j].date = parseTime(d[i][j]["Incident Date"]);
          day_data[i][j].killed = +d[i][j]["# Killed"];
          day_data[i][j].injured = +d[i][j]["# Injured"];
          month_data[i][j].date = parseTime(d[i][j]["Incident Date"]);
          month_data[i][j].killed = +d[i][j]["# Killed"];
          month_data[i][j].injured = +d[i][j]["# Injured"];
          year_data[i][j].date = parseTime(d[i][j]["Incident Date"]);
          year_data[i][j].killed = +d[i][j]["# Killed"];
          year_data[i][j].injured = +d[i][j]["# Injured"];
        }
      }

      for(var i = 0; i < year_data.length; ++i) {
        year_data[i] = calcYearOverview(year_data[i]);
        month_data[i] = calcMonthView(month_data[i]);
        show_data.push(true);
      }

      dayly = calcBorders(d);
      yearly = calcBorders(year_data);
      monthly = calcBordersMonth(d, 0);
      // first drawing outside the loop to give different bool
      drawLineGraph(d[0], year_data[0], false, lineColors[0], dayly, 0);
      for(var i = 1; i < d.length; ++i) {
        drawLineGraph(d[i], year_data[i], true, lineColors[i], dayly, i);
      }
      current_graphic = ["dayly"];

      // call functions in here to use data ... cuz storing in global variables aint gonna work brah
    });
}

// recalculate the data for the year
function calcYearOverview(data) {
  var new_data = [];
  var current_day = data[0];
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

function calcMonthView(data) {
  var new_data = [];
  var new_month = [];
  var current_day = data[0];
  var current_month = data[0].date.getMonth();
  for(var i = 1; i < data.length; ++i) {
    if(data[i].date.getMonth() == current_month) {
      new_month.push(data[i]);
    } else {
      new_data.push(new_month);
      new_month = [];
      current_month = data[i].date.getMonth();
    }
  }
  new_data.push(new_month);
  return new_data;
}

// takes whole data array to calculate the min and max values for y scale
function calcBorders(data) {
  var max_injured_killed = 0;
  var min_injured_killed = 10000;
  var maxY = 0;
  var minY = 0;

  for(var i = 0; i < data.length; ++i){
    if(show_data[i]){
      // maxY = d3.max(data[i], function(d) { return d.injured + d.killed});
      maxY = d3.max(data[i], function(d) { return resultSelector(d)});
      // minY = d3.min(data[i], function(d) { return d.injured + d.killed});
      minY = d3.min(data[i], function(d) { return resultSelector(d)});
      if(max_injured_killed < maxY) {
        max_injured_killed = maxY;
      }
      if(min_injured_killed > minY) {
        min_injured_killed = minY;
      }
    }
  }
  return [min_injured_killed, max_injured_killed];
}

function calcBordersMonth(data, month) {
  var max_injured_killed = 0;
  var min_injured_killed = 10000;
  var maxY = 0;
  var minY = 0;
  // maxY = d3.max(data[data.length-1-month], function(d) {console.log(resultSelector(1, d)); return d.injured + d.killed});
  maxY = d3.max(data[data.length-1-month], function(d) { return resultSelector(d)});
  // minY = d3.min(data[data.length-1-month], function(d) { return d.injured + d.killed});
  minY = d3.min(data[data.length-1-month], function(d) { return resultSelector(d)});
  if(max_injured_killed < maxY) {
    max_injured_killed = maxY;
  }
  if(min_injured_killed > minY) {
    min_injured_killed = minY;
  }
  return [min_injured_killed, max_injured_killed];
}

async function callYearly() {
  delete_points = true;
  yearly = calcBorders(year_data);
  for(var i = 0; i < year_data.length; ++i) {
    if(show_data[i] != false) {
      updateGraph(year_data[i], yearly, i, null, true);
      updateGraph(year_data[i], yearly, i, null, true);
    } else {
      clearGraph(year_data[i], yearly, i, null, true);
    }
    await sleep(250);
  }
  current_graphic = ["yearly"];
}

async function callDayly() {
  delete_points = true;
  dayly = calcBorders(day_data);
  for(var i = 0; i < year_data.length; ++i) {
    if(show_data[i] != false) {
      updateGraph(day_data[i], dayly, i, null, false);
      updateGraph(day_data[i], dayly, i, null, false);
    } else {
      clearGraph(day_data[i], dayly, i, null, false);
    }
    await sleep(250);
  }
  current_graphic = ["dayly"];
}

async function callMonthly(month) {
  delete_points = true;
  for(var i = 0; i < year_data.length; ++i) {
    if(month <= month_data[i].length-1) {
      var borders = calcBordersMonth(month_data[i], month);
      // console.log(show_data[i]);
      if(borders[1] > monthly[1]){
        monthly[1] = borders[1];
      } //else if(borders[0] < monthly[0]) {
      //   monthly[0] = borders[0];
      // }
    }
  }
  for(var i = 0; i < year_data.length; ++i) {
    if(show_data[i] != false) {
      if(month <= month_data[i].length-1) {
        updateGraph(month_data[i][month_data[i].length-1-month], monthly, i, month, false);
      } else {
        clearGraph(month_data[i][month_data[i].length-1-month], monthly, i, month, false);
      }
      await sleep(250);
    } else {
      clearGraph(month_data[i][month_data[i].length-1-month], monthly, i, month, false);
    }
  }
  current_graphic = ["monthly", month];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function toggleYears(id, arrayPos) {
  show_data[arrayPos] = document.getElementById(id).checked;
  currentGraphShown();
}

function toggleTypes(id, arrayPos) {
  show_types[arrayPos] = document.getElementById(id).checked;
  currentGraphShown();
}

function currentGraphShown() {
  if(current_graphic[0] === "monthly" ) {
    callMonthly(current_graphic[1]);
  } else if(current_graphic[0] === "dayly") {
    callDayly();
  } else {
    callYearly();
  }
}

function resultSelector(d) {
  var value;
  if(show_types[0] == true && show_types[1] == false) {
    value = d.injured;
  } else if(show_types[0] == false && show_types[1] == true){
    value = d.killed;
  } else {
    value = d.injured + d.killed;
  }
  return value;
}
