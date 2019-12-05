var width = 1000;
var height = 1000;
var padding = { t: 0, r: 0, b: 0, l: 0 };
var chartPadding = { t: 40, r: 40, b: 60, l: 50 };

var svgAvailableWidth = width - padding.l - padding.r;
var svgAvailableHeight = height - padding.t - padding.b;

var svg = d3
  .select("#main")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("border", "1px solid #777");

var attributes = ["budget", "imdbScore", "directorLikes", "movieLikes"];

var labels = {
  budget: "Budget",
  imdbScore: "IMDB Score",
  directorLikes: "Director Popularity",
  movieLikes: "Movie Popularity"
};

var numAttributes = attributes.length;

var chartWidth = svgAvailableWidth / 2;
var chartHeight = svgAvailableHeight / 2;

var chartAvailableWidth = chartWidth - chartPadding.l - chartPadding.r;
var chartAvailableHeight = chartHeight - chartPadding.t - chartPadding.b;

var xScale = d3.scaleLinear().range([0, chartAvailableWidth]);
var yScale = d3.scaleLinear().range([chartAvailableHeight, 0]);

var xAxis = d3
  .axisBottom(xScale)
  .ticks(6)
  .tickSize(5, 0, 0);
var yAxis = d3
  .axisLeft(yScale)
  .ticks(6)
  .tickSize(5, 0, 0);

var selectedChart = undefined;

var brushBorder = 20;

var brush = d3
  .brush()
  .extent([
    [0, 0],
    [width / 2 + brushBorder, height / 2 + brushBorder]
  ])
  .on("start", brushStart)
  .on("brush", brushMove)
  .on("end", brushEnd);

function brushStart(attribute) {
  if (selectedChart !== attribute) {
    brush.move(d3.selectAll(".brush"), null);
  }
  xScale.domain(
    d3.extent(csvGlobal, function(d) {
      return d[attribute];
    })
  );
  yScale.domain(
    d3.extent(csvGlobal, function(d) {
      return d["gross"];
    })
  );

  selectedChart = attribute;
}

function brushMove(attribute) {
  var selection = d3.event.selection;
  if (selection) {
    var [[left, top], [right, bottom]] = selection;
    svg.selectAll(".dot").classed("selected", function(d) {
      var x = xScale(d[attribute]) + chartPadding.l;
      var y = yScale(d["gross"]) + chartPadding.t;
      if (left <= x && x <= right && top <= y && y <= bottom) {
        //get values of all movies selected here
        return true;
      }
      return left <= x && x <= right && top <= y && y <= bottom;
    });
  }
}

function brushEnd(attribute) {
  var selection = d3.event.selection;
  if (!selection) {
    selectedChart = undefined;
    svg.selectAll(".dot").classed("selected", false);
    d3.select("#chartSpot").html("");
  } else {
    createPieChart(selection, attribute);
  }
}

function createPieChart(selection, attribute) {
  d3.select("#chartSpot").html("");
  d3.select("#wordSpot").html("");
  var [[left, top], [right, bottom]] = selection;
  var movies = new Array();
  genreMap = new Map();
  var dots = svg.selectAll(".dot").classed("selected", function(d) {
    var x = xScale(d[attribute]) + chartPadding.l;
    var y = yScale(d["gross"]) + chartPadding.t;
    if (left <= x && x <= right && top <= y && y <= bottom) {
      //get values of all movies selected here
      var contains = 0;
      for (i = 0; i < movies.length; i++) {
        if (movies[i].title == d.title) {
          contains = 1;
        }
      }
      if (contains == 0) {
        movies.push(d);
      }
    }
    return left <= x && x <= right && top <= y && y <= bottom;
  });
  for (i = 0; i < movies.length; i++) {
    var splits = movies[i].genres.split("|");
    for (j = 0; j < splits.length; j++) {
      if (genreMap.has(splits[j])) {
        var newNumber = genreMap.get(splits[j]) + 1;
        genreMap.delete(splits[j]);
        genreMap.set(splits[j], newNumber);
      } else {
        genreMap.set(splits[j], 1);
      }
    }
  }

  //word cloud
  var word_dict = {};
  for (i = 0; i < movies.length; i++) {
    var words = movies[i]["plot_keywords"].split("|");
    for (j = 0; j < words.length; j++) {
      if (word_dict[words[j]] == undefined) {
        word_dict[words[j]] = 1;
      } else {
        word_dict[words[j]] = word_dict[words[j]] + 1;
      }
    }
  }

  var sorted = Object.keys(word_dict).map(function(key) {
    return [key, word_dict[key]];
  });

  // Sort the array based on the second element
  sorted.sort(function(first, second) {
    return second[1] - first[1];
  });

  var slice_idx = sorted.length > 30 ? 30 : sorted.length;
  sorted = sorted.slice(0, slice_idx);
  word_scale = 0;
  var frequency_list = [];
  for (var i = 0; i < sorted.length; i++) {
    word_scale += sorted[i][1] / sorted.length;
  }
  word_scale = 30 / word_scale;

  for (var i = 0; i < sorted.length; i++) {
    frequency_list.push({
      text: sorted[i][0],
      size: sorted[i][1] * word_scale
    });
  }

  draw_word_cloud(frequency_list);
  //end word cloud

  var pieWidth = 500;
  var pieHeight = 500;
  var pieRadius = 225;
  chartSpot = d3
    .select("#chartSpot")
    .append("svg")
    .attr("width", pieWidth)
    .attr("height", pieHeight)
    .append("g")
    .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");
  var color = d3.scaleOrdinal(d3.schemeSet2);
  var pie = d3.pie();
  var dataReady = pie(Array.from(genreMap.values()));
  var avgChart = 0;
  for (var i = 0; i < dataReady.length; i++) {
    avgChart += dataReady[i]["data"] / dataReady.length;
  }

  var arcGenerator = d3
    .arc()
    .innerRadius(0)
    .outerRadius(pieRadius);

  chartSpot
    .selectAll("arc")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", function(d, i) {
      return color(i);
    })
    .style("stroke", "black")
    .style("stroke-width", "2px");

  chartSpot
    .selectAll("arc")
    .data(dataReady)
    .enter()
    .append("text")
    .text(function(d, i) {
      return d["data"] > avgChart * 0.4 ? Array.from(genreMap.keys())[i] : "";
    })
    .each(function(d, i) {
      var centroid = arcGenerator.centroid(d);
      d3.select(this)
        .attr("x", centroid[0])
        .attr("y", centroid[1])
        .attr("dy", "0.33em");
    })
    .style("text-anchor", "middle")
    .style("font-size", 12);
}

d3.csv("movies.csv", function(csv) {
  for (var i = 0; i < csv.length; ++i) {
    csv[i].director = String(csv[i].director_name);
    csv[i].duration = Number(csv[i].duration);
    csv[i].title = String(csv[i].movie_title);
    csv[i].directorLikes = Number(csv[i].director_facebook_likes);
    csv[i].actor1Likes = Number(csv[i].actor_1_facebook_likes);
    csv[i].actor2Likes = Number(csv[i].actor_2_facebook_likes);
    csv[i].actor3Likes = Number(csv[i].actor_3_facebook_likes);
    csv[i].movieLikes = Number(csv[i].movie_facebook_likes);
    csv[i].gross = Number(csv[i].gross);
    csv[i].budget = Number(csv[i].budget);
    csv[i].imdbScore = Number(csv[i].imdb_score);
  }

  csvGlobal = csv;

  var chartEnter = svg
    .selectAll(".chart")
    .data(attributes)
    .enter()
    .append("g")
    .attr("class", "chart")
    .attr("id", function(d) {
      return d;
    })
    .attr("transform", function(d, i) {
      if (i == 0) {
        return `translate(${padding.l}, ${padding.t})`;
      }
      if (i == 1) {
        return `translate(${padding.l + chartWidth}, ${padding.t})`;
      }
      if (i == 2) {
        return `translate(${padding.l}, ${padding.t + chartHeight})`;
      }
      if (i == 3) {
        return `translate(${padding.l + chartWidth}, ${padding.t +
          chartHeight})`;
      }
    });

  chartEnter
    .append("g")
    .attr("class", "brush")
    .call(brush);

  chartEnter.each(function(attribute) {
    xScale.domain(
      d3.extent(csv, function(d) {
        return d[attribute];
      })
    );

    yScale.domain(
      d3.extent(csv, function(d) {
        return d["gross"];
      })
    );

    var chart = d3.select(`#${attribute}`);

    var dots = chart.selectAll(".dot").data(csv, function(d) {
      return d[attribute];
    });

    var dotsEnter = dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .style("stroke", "black")
      .attr("r", 3);

    dots
      .merge(dotsEnter)
      .attr("cx", function(csv) {
        return xScale(csv[attribute]) + chartPadding.l;
      })
      .attr("cy", function(csv) {
        return yScale(csv["gross"]) + chartPadding.t;
      });

    dots.exit().remove();

    chart
      .append("g")
      .attr("class", ".x.axis")
      .attr(
        "transform",
        `translate(${chartPadding.l}, ${chartHeight - chartPadding.b})`
      )
      .call(xAxis);

    // y-axis
    chart
      .append("g")
      .attr("class", ".y.axis")
      .attr("transform", `translate(${chartPadding.l}, ${chartPadding.t})`)
      .call(yAxis);

    chart
      .append("text")
      .text(function(d) {
        return labels[d];
      })
      .attr("class", "axis-label")
      .attr("transform", function(d, i) {
        return `translate(${chartPadding.l *
          2}, ${chartHeight - chartPadding.b / 2 + 10})`;
      });

    chart
      .append("text")
      .text(function(d) {
        return "Gross";
      })
      .attr("class", "axis-label")
      .attr("transform", function(d, i) {
        return `rotate(90) translate(${chartHeight / 3}, 40)`;
      });
  });
});
