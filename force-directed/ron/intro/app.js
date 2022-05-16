var width = 800;
var height = 600;

var nodes = [
	{ color: "red", size: 5, },
	{ color: "orange", size: 10 },
	{ color: "yellow", size: 15 },
	{ color: "green", size: 20 },
	{ color: "blue", size: 25 },
	{ color: "purple", size: 30 }
	];



var links = [
	{ source: "red", target: "orange"},
	{ source: "orange", target: "yellow"},
	{ source: "yellow", target: "green"},
	{ source: "green", target: "blue"},
	{ source: "blue", target: "purple"},
	{ source: "purple", target: "red"},
	{ source: "green", target: "red"}
	];



d3.select("#graph")
	.append("svg")
		.attr("width", width)
		.attr("height", height)
	;

let svg = d3.select("svg")
	.attr("width", width)
	.attr("height", height)
	;

// Lines joining nodes:
let linkSelection = svg
	.selectAll("line")
	.data(links)
	.enter()
		.append("line")
			.attr("stroke", "black")
			.attr("stroke-width", 1)
	;


var nodeSelection = svg
							.selectAll("circle")
							.data(nodes)
							.enter()
							.append("circle")
//								.attr("cx", (d,i) => (width/2 + i**3) )
//								.attr("cy", (d,i) => (height/2 + i**3) )
								.attr("r", d => d.size)
								.attr("fill", d => d.color)

	// Drag supports start, drag (continuous / repeated during), and end:
	.call(d3.drag()
		.on("start", dragStart)
		.on("drag", drag)
		.on("end", dragEnd)
		)
	;


let simulation = d3.forceSimulation(nodes);

simulation
	// Nodes are pulled to centre with forceCentre, then...
	.force("centre", d3.forceCenter(width/2, height/2))
	// ...pushed apart by the forceManyBody force:
	//
	// forceManyBody():
	// Add attraction or repulsion (default)
	// Negative = repulsive, positive forces = attractive
	// Default === -30
	.force("repel", d3.forceManyBody().strength(-100) )
	// forceLink() joins nodes with links:
	// It expects to join by indeces, which our links array doesn't conform with
	// use ".id" to correct
	.force("links", d3.forceLink(links)
		.id(d => d.color)
		// Link Force Distance: strength proportional to distance:
		// Make distance proportional to size
		.distance(d => 5 * (d.source.size + d.target.size) )
		)
	// on method choices: tick or end
	.on("tick", ticked)
	; // end simulation



function ticked() {
	nodeSelection
		.attr("cx", d => d.x )
		.attr("cy", d => d.y )
		;
//	console.log("ticked() alpha=", simulation.alpha() );
	linkSelection
		.attr("x1", d => d.source.x)
		.attr("x2", d => d.target.x)
		.attr("y1", d => d.source.y)
		.attr("y2", d => d.target.y)
		;
	}

function dragStart(d)
	{
	console.log("dragStart()");
	// fx = fix x pos, fy = fix y pos:
	// Starting at circle location at beginning of drag:
	d.fx = d.x;
	d.fy = d.y;
	simulation.alphaTarget(0.5).restart();
	}

function drag(d)
	{
	console.log("drag()");
	// Update with event location:
	// NOTE: Firefox vs Chrome: x vs pageX and y vs pageY
	// Um, not necessarily with d3.event instead of d.event...
	d.fx = d3.event.x;
	d.fy = d3.event.y;
	// Reset the "bounciness" / motion: use 0 > 1 (tried 10 and blew it all up):
	// simulation.alpha(0.9).restart();
	}

function dragEnd(d)
	{
	console.log("dragEnd()");
	d.fx = null;
	d.fy = null;
	simulation.alphaTarget(0);
	}




