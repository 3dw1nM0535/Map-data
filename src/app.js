var myMeteoriteGraph = (function() {
  var width, height, tip, projection, zoom, path, svg, g;
  
  width = 900,
  height = 500;

  tip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      return "<span>Name: " + d.properties.name + "<br>Year: " + d.properties.year.slice(0, 4) + "<br>Classification: " + d.properties.recclass + "<br>Mass: " + d.properties.mass + "g</span>";
    });

  projection = d3.geo.mercator()
    .translate([0, 0])
    .scale(width / 2 / Math.PI);

  zoom = d3.behavior.zoom()
    .scaleExtent([1, 15])
    .on("zoom", move);

  path = d3.geo.path()
    .projection(projection);

  svg = d3.select(".canvas")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .call(zoom);

  svg.call(tip);

  g = svg.append("g");

  g.append("rect")
    .attr("class", "overlay")
    .attr("x", -width / 2)
    .attr("y", -height / 2)
    .attr("width", width)
    .attr("height", height);

  d3.json("https://s3-us-west-2.amazonaws.com/s.cdpn.io/441940/world-110m2.json", function(error, world) {
    if (error) throw error;

    d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json", function(error, data) {
      //console.log(data["features"]);
      var arr, max, min, r;
      arr = [];
      data.features.forEach(function(e) {
        arr.push(e.properties.mass);
      });
      max = Math.max(...arr);
      min = Math.min(...arr);
      
      data.features.sort(function(a,b) {
    return b.properties.mass - a.properties.mass
  })

      r = d3.scale.linear()
        .clamp([true])
        .domain([min, max/5])
        .range([1.5, 15]);

      g.selectAll("circle")
        .data(data.features)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.properties.reclong, d.properties.reclat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.properties.reclong, d.properties.reclat])[1];
        })
        .attr("r", function(d) {
          if (d.properties.mass === null) {
            return r(min);
          } else {
            return r(d.properties.mass);
          }
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .style("fill", "red")
        .attr("fill-opacity", .5)
        .attr("stroke-width", .25)
        .attr("stroke", "#EAFFD0")
    });

    g.append("path")
      .datum(topojson.feature(world, world.objects.countries))
      .attr("class", "land")
      .attr("d", path);

    g.append("path")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) {
        return a !== b;
      }))
      .attr("class", "boundary")
      .attr("d", path);

  });

  function move() {
    g.attr("transform", "translate(" +
      d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
  }
})();