// Set the dimensions of the canvas / graph
var margin = { top: 50, right: 50, bottom: 50, left: 100 },
  width = 600 - margin.left - margin.right,
  height = 270 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
// Define the axes
var xAxis = d3.svg
  .axis()
  .scale(x)
  .orient("bottom")
  .ticks(5);

var yAxis = d3.svg
  .axis()
  .scale(y)
  .orient("left")
  .ticks(5);

// Define the line
var valueline = d3.svg
  .line()
  .x(function(d) {
    console.log(d.budget);
    return x(d.budge);
  })
  .y(function(d) {
    return y(d.gross);
  });

// Adds the svg canvas
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("movies.csv", function(error, data) {
  data.forEach(function(d) {
    d.gross = Number(d.gross);
    d.budget = Number(d.budget);
  });

  // Scale the range of the data
  x.domain(
    d3.extent(data, function(d) {
      return d.budget;
    })
  );
  y.domain([
    0,
    d3.max(data, function(d) {
      return d.gross;
    })
  ]);

  // Add the valueline path.
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", function(d, i) {
      return i;
    })
    .attr("class", "circle")
    .attr("stroke", "black")
    .attr("cx", function(d) {
      return x(d.budget);
    })
    .attr("cy", function(d) {
      return y(d.gross);
    })
    .attr("r", 1)
    .attr("pointer-events", "all")
    .on("click", function(d, i) {});

  // Add the X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);
});

// ** Update data section (Called from the onclick)
function updateDataX(reset = false) {
  // Get the data again
  d3.csv("movies.csv", function(error, data) {
    data.forEach(function(d) {
      d.gross = Number(d.gross);
      d.budget = Number(d.budget);
    });

    // Scale the range of the data again
    if (!reset) x.domain([0, d3.select("#filterAxisX").node().value]);
    else
      x.domain(
        d3.extent(data, function(d) {
          return d.budget;
        })
      );
    // Select the section we want to apply our changes to
    var svg = d3.select("body").transition();
    // Make the changes
    d3.select("body")
      .transition()
      .duration(750)
      .selectAll("circle")
      .attr("cx", function(d) {
        return x(d.budget);
      })
      .attr("cy", function(d) {
        return y(d.gross);
      });
    svg
      .select(".x.axis") // change the x axis
      .duration(750)
      .call(xAxis);
  });
}

function updateDataY(reset = false) {
  // Get the data again
  d3.csv("movies.csv", function(error, data) {
    data.forEach(function(d) {
      d.gross = Number(d.gross);
      d.budget = Number(d.budget);
    });

    // Scale the range of the data again
    if (!reset) y.domain([0, d3.select("#filterAxisY").node().value]);
    else
      y.domain(
        d3.extent(data, function(d) {
          return d.gross;
        })
      );
    // Select the section we want to apply our changes to
    var svg = d3.select("body").transition();
    // Make the changes
    d3.select("body")
      .transition()
      .duration(750)
      .selectAll("circle")
      .attr("cx", function(d) {
        return x(d.budget);
      })
      .attr("cy", function(d) {
        return y(d.gross);
      });
    svg
      .select(".y.axis") // change the x axis
      .duration(750)
      .call(yAxis);
  });
}
