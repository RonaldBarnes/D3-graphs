let data = [], width = 600, height = 400, numPoints = 100;
d3.select("#graph")
	.append("svg")
	;
d3.select("svg")
	.append("g")
	;

let zoom = d3.zoom()
  .on('zoom', handleZoom(d3.event) );

function handleZoom(e) {
console.log("ZOOM:", e);
if (e === null) return;
  d3.select('svg g')
    .attr('transform', e.transform);
}

function initZoom() {
  d3.select('svg')
    .call(zoom);
}

function updateData() {
  data = [];
  for(let i=0; i<numPoints; i++) {
    data.push({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height
  	});
  }
}

function update() {
  d3.select('svg g')
    .selectAll('circle')
    .data(data)
		.enter()
		.append("circle")
//    .join('circle')
		.merge(d3.selectAll("circle"))
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; })
    .attr('r', 3);
}

initZoom();
updateData();
update();

