var svg = d3.select("body")
  .append("svg")
  .attr("width",500)
  .attr("height",300);
 
var circle = svg.append("circle")
  .attr("cx",100)
  .attr("cy",100)
  .attr("r",20)
  .attr("fill","steelblue")
  .call(d3.drag().on("start", function() {
      d3.select(this).attr("fill", "orange")
    })
    .on("drag", function() {
      d3.select(this).attr("cx",d3.event.x)
        .attr("cy", d3.event.y )
    })
    .on("end", function() {
      d3.select(this).attr("fill","steelblue");
    })
  )

