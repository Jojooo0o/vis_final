var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv"];     // saves paths of data sets


function test() {

  var parseTime = d3.timeParse("%B %d, %Y");
  var formatTime = d3.timeFormat("%B");

  var margin = {top: 20, right: 20, bottom: 30, left: 20},
    width = 1000 - margin.left - margin.right,
    // width = +svg.attr("width") - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    // height = +svg.attr("height") - margin.top - margin.bottom,

  var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.killed + d.injured); });

/*
  d3.queue()
  .defer(d3.csv, dataPaths[0])
  .defer(d3.csv, dataPaths[1])
  .defer(d3.csv, dataPaths[2])
  .defer(d3.csv, dataPaths[3])
  .await(processData);
}

function processData(data1, data2, data3, data4) {
  console.log(data1);
}*/

  d3.csv(dataPaths[0], function(d) {
    return {
      date : parseTime(d["Incident Date"]),
      killed : +d["# Killed"],
      injured : +d["# Injured"]
    };
  }, function(data) {

    //data = calcMonthlyAvg(data);

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.killed + d.injured; })]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      // .select(".domain")
      // .remove();

    svg.append("g")
      .call(d3.axisLeft(y));
      // .append("text")
      // .attr("fill", "#000")
      // .attr("transform", "rotate(-90)")
      // .attr("y", 6)
      // .attr("dy", "0.71em")
      // .attr("text-anchor", "end")
      // .text("Killed / Injured");

    svg.append("path")
      .data([data])
      .attr("class", "line")
      // .attr("fill", "none")
      // .attr("stroke", "steelblue")
      // .attr("stroke-linejoin", "round")
      // .attr("stroke-linecap", "round")
      // .attr("stroke-width", 1.5)
      .attr("d", line);
  });
}
