function processData() {
  parseCSV();
  setTimeout(10);
  if(typeof allData !== "undefined") {
    console.log("Works!");
    console.log(allData);
    drawGraph(calcYear(0));
  } else {
    console.log("Timeout to short");
    //setTimeout(processData, 1);
  }
}

function drawGraph(data) {
  var svg_width = 1800;
  var svg_height = 600;
  margin = { top: 20, right: 50, bottom: 30, left: 50};
  var width = svg_width - margin.left - margin.right;
  var height = svg_height - margin.top - margin.bottom;

  var svg = d3.select('svg')
    .attr("width", svg_width)
    .attr("height", svg_height);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseDate = d3.timeParse("%B %d, %Y");
  var formatDate = d3.timeFormat("%B");

  // var graphData = data.map(function(d) {
  //   return {
  //     date: formatDate(parseDate(d[0])),
  //     killed: d[1],
  //     injured: d[2]
  //   }
  // });
  data.forEach(function(d) {
    d.date = formatDate(parseDate(d[0]));
    d.killed = +d[1];
    d.injured = +d[2];
  });

  var x = d3.scaleTime().range([0, width])
    //.domain(d3.extent(graphData, function(d) {console.log(d.date); return d.date}));
    .domain(d3.extent(data, function(d) {console.log(d.date); return d.date}));
  var y = d3.scaleLinear().range([height, 0])
    //.domain(d3.extent(graphData, function(d) {return d.injured}));
    .domain(d3.extent(data, function(d) {return d.injured}));

    var line = d3.line()
    .x(function(d) {return x(d.date)})
    .y(function(d) {return y(d.injured)});

  g.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", "translate(0," + height + ")")
    .select(".domain");
    //.remove();

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("killed / injured");

  g.append("path")
    .datum(graphData)
    .attr("class", "line")
    .attr("d", line);
}
