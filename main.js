var width = 500;
var height = 500;

d3.csv("movies.csv", function(csv) {
  for (var i = 0; i < csv.length; ++i) {
    csv[i].director = String(csv[i].director_name);
    csv[i].duration = Number(csv[i].duration);
    csv[i].directorLikes = Number(csv[i].director_facebook_likes);
    csv[i].actor1Likes = Number(csv[i].actor_1_facebook_likes);
    csv[i].actor2Likes = Number(csv[i].actor_2_facebook_likes);
    csv[i].actor3Likes = Number(csv[i].actor_3_facebook_likes);
    csv[i].movieLikes = Number(csv[i].movie_facebook_likes);
    csv[i].gross = Number(csv[i].gross);
    csv[i].budget = Number(csv[i].budget);
    csv[i].imdbScore = Number(csv[i].imdb_score);
    if (csv[i].budget == 0) {
      csv[i].effectiveness = Number(0);
    } else {
      csv[i].effectiveness = Number(csv[i].gross / csv[i].budget);
    }
  }

  var budgetExtent = d3.extent(csv, function(row) {
    return row.budget / 1000000;
  });
  var grossExtent = d3.extent(csv, function(row) {
    return row.budget / 1000000;
  });

  // Create view for effectiveness
  var xScale = d3
    .scaleLinear()
    .domain(budgetExtent)
    .range([50, 470]);
  var yScale = d3
    .scaleLinear()
    .domain(grossExtent)
    .range([470, 30]);

  var xAxis = d3.axisBottom().scale(xScale);
  var yAxis = d3.axisLeft().scale(yScale);

  var chart1 = d3
    .select("#main")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);

  var temp1 = chart1
    .selectAll("circle")
    .data(csv)
    .enter()
    .append("circle")
    .attr("id", function(d, i) {
      return i;
    })
    .attr("stroke", "black")
    .attr("cx", function(d) {
      return xScale(d.budget / 1000000);
    })
    .attr("cy", function(d) {
      return yScale(d.gross / 1000000);
    })
    .attr("r", 1)
    .attr("pointer-events", "all")
    .on("click", function(d, i) {});

  chart1 // or something else that selects the SVG element in your visualizations
    .append("g") // create a group node
    .attr("transform", "translate(0," + (width - 30) + ")")
    .call(xAxis) // call the axis generator
    .append("text")
    .attr("fill", "black")
    .attr("class", "label")
    .attr("x", width - 16)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Budget");

  chart1 // or something else that selects the SVG element in your visualizations
    .append("g") // create a group node
    .attr("transform", "translate(50, 0)")
    .call(yAxis)
    .append("text")
    .attr("fill", "black")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Gross");
});
