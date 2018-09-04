function processData() {
  parseCSV();
  if(typeof allData !== "undefined") {
    drawGraph(calcYear(0));
  } else {
    setTimeout(processData, 1);
  }
}

function drawGraph(data) {
  console.log(data);
  var svg_width = 800;
  var svg_height = 600;
  margin = { top: 20, right: 50, bottom: 30, left: 50};
  var width = svg_width - margin.left - margin.right;
  var height = svg_height - margin.top - margin.bottom;

  var svg = d3.select('svg')
    .attr("width", svg_width)
    .attr("height", svg_height);

  var group = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().rangeRound([0, width]);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  var line = d3.line()
    .x(function(d)
        {return x(d[0])})
    .y(function(d)
        {return y(d[1])})
    x.domain(d3.extent(data, function(d) {return d[0]}));
    y.domain(d3.extent(data, function(d) {return d[1]}));

  group.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .select(".domain")
    .remove();

  group.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("killed / injured");
}
