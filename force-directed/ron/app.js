
console.log("\n\n",
	"--------------------------------------\n",
	"© ron@ronaldbarnes.ca 2022\n",
	"--------------------------------------\n",
	"\n\n"
	);



let padding = {
	top: 50,
	right: 50,
	left: 50,
	bottom: 50,
	};
// Node / circle radius increases as multiple of pixelsPerCommittee:
let pixelsPerCommittee = 10;
let {width, height} = getSize();
//width = d3.select("#graph").attr("width") - d3.select("#checkboxes").attr("width");
// Checkboxes are ⅓ screen width (33vw), give rest to SVG:
width = width / 3 * 2;
// console.log(`WIDTH: ${width}`);

d3.select("#graph")
	.append("svg")
		.attr("width", width)
		.attr("height", height)
	;
let svg = d3.select("svg");


let nodes;
let nodeGroup;
let links;
let linkGroup;
let simulation;
// Can be scoped inside d3.csv
// let committees;
let parties =
	[
		{
		code: "D",
		name: "Democratic"
		},
		{
		code: "R",
		name: "Republican"
		},
		{
		code: "I",
		name: "Independent"
		}
	];
let partyScale = d3.scaleOrdinal()
//	.domain( ["D", "R", "I"] )
	.domain( parties.map( p => p.code) )
	.range( ["blue", "red", "grey"] )
	;











d3.csv("./senate_committee_data.csv", function(d,i,headers) {
	// formatter function, run on EACH ROW:
	// First, strip off first 2 columns' headers (name, party), then
	// filter memberships (===1) and assign header/committee names to array:
	let committees = headers.slice(2).filter( h => d[h] === "1");
	//
	return {
		name: d.name,
		party: d.party,
		committees: committees
		}	// end return
	}, function( error, data) {
		if (error) throw error;
		//
		nodes = data;
		links = makeLinks(nodes);
		// console.log("return from makeLinks:", links );







	linkGroup = svg.append("g")
		.attr("id", "linkGroup")
		.classed("links", true)
		;
	nodeGroup = svg.append("g")
		.attr("id", "nodeGroup")
		.classed("nodes", true)
		;
	simulation = d3.forceSimulation(nodes)
		.force("repel",
			d3.forceManyBody().strength(-50)
			)
		.force("collision-avoidance",
			d3.forceCollide().radius( function(d) {
				return d.committees.length * pixelsPerCommittee
				})
			)
		.force("centre",
//			d3.forceCenter( width/2 + padding.left, height / 2 + padding.top)
			d3.forceCenter( width/2, height / 2)
			)
		.force("links", d3.forceLink(links)
			.distance( d => {
			// Spread out distance of senators on multiple committees for legibility:
				let count1 = d.source.committees.length;
				let count2 = d.target.committees.length;
				return 30 * Math.max(count1, count2);
				}) // end .distance
			.id( d => d.name)
			)	// end forceLink
		.on("tick", () => {
			linkGroup
				.selectAll("line")
					.attr("x1", d => d.source.x)
					.attr("y1", d => d.source.y)
					.attr("x2", d => d.target.x)
					.attr("y2", d => d.target.y)
				;
			nodeGroup
				.selectAll("circle")
					.attr("cx", d => d.x)
					.attr("cy", d => d.y)
				;
			})	// end "on tick"
	updateGraph(nodes,links);
	// Pass all columns except first 2 (skip 0 & 1, start at 2):
	// But, ONLY the headers, not data.
	// "columns" from d3.csv: returns rows and a columns object with headers.
	createCheckBoxes(nodes.columns.slice(2));
	});	// end d3.csv














// ----------------------------------------------------------------------------
function updateGraph(nodeData, linkData)
	{
	let nodeUpdate = nodeGroup
		.selectAll("circle")
		.data(nodeData, d => d.name)
		;

	nodeUpdate
		.exit()
			.transition()
			.duration(250)
			.delay( (d,i) => i * 25)
			// Shrink 'til disappeared:
			.attr("r", 0)
			.remove()
		;

	nodeUpdate
		.enter()
			.append("circle")
				.attr("r", 0)
				.transition()
				.duration(500)
				.delay((d,i) => i * 10)
				.attr("r", d => d.committees.length * pixelsPerCommittee)
				.transition()
				.duration(500)
				.attr("fill", d => partyScale(d.party))
				.attr("stroke", "white")
				.attr("stroke-width", 3)
		;
	// Required splitting this from .enter() due to error on transitions:
	// d3.v4.js:754 Uncaught Error: unknown type: mousedown
	d3.select("#nodeGroup")
		.selectAll("circle")
			.call(d3.drag()
					.on("start", dragStart)
					.on("drag", dragDrag)
					.on("end", dragEnd)
					)
				.on("mousemove touchstart", tooltipShow)
				.on("mouseout touchend", tooltipHide)
		;

	nodeUpdate
		.merge(nodeUpdate)
/*
				// Including transition here makes d3.drag() fail below?!?
				// d3.v4.js:754 Uncaught Error: unknown type: mousedown
				// All permutations of transitions fail: radius, fill, ...
			.attr("r", 0)
			.transition()
			.duration(500)
			.delay((d,i) => i * 10)
			.attr("r", d => d.committees.length * 10)
			.attr("fill", "black")
*/
				.attr("r", d => d.committees.length * pixelsPerCommittee)
				.attr("fill", d => partyScale(d.party))
				.attr("stroke", "white")
				.attr("stroke-width", 3)
				.attr("id", d => `${d.name} (${d.party})`)
				.attr("title", d => `${d.name} (${d.party})`)
				.call(d3.drag()
					.on("start", dragStart)
					.on("drag", dragDrag)
					.on("end", dragEnd)
					)
				.on("mousemove touchstart", tooltipShow)
				.on("mouseout touchend", tooltipHide)
		;

	let linkUpdate = linkGroup
		.selectAll("line")
		.data(linkData, d => d.source.name + " " + d.target.name)
		;

	linkUpdate
		.exit()
		.remove()
		;

	linkUpdate
		.enter()
			.append("line")
			.attr("title", d => d.source.name + " " + d.target.name)
		;
	}






// ----------------------------------------------------------------------------
// Matt gets 1021 array elements returned, I'm getting 688!?!
function makeLinks(nodes)
	{
	let links = [];
	// Iterate through all senators:
	for (let i = 0; i< nodes.length; i++)
		{
		// if (i===0) console.log(`makeLinks() i=${i} and nodes[${i}]=`, nodes[i]);
		// Compare current senator to remaining senators:
		for (j = i + 1; j < nodes.length; j++ )
			{
			let senator1 = nodes[i];
			let senator2 = nodes[j];
			// Now, compare committee memberships (array elements === 1) between them:
			for (let k = 0; k < senator1.committees.length; k++)
				{
				let committee = senator1.committees[k];
				// senator1's current committee exist in list of sen2's membership?
				if ( senator2.committees.includes(committee) )
					links.push({
						source: senator1.name,
						target: senator2.name
						});
					break;
				}	// end for k...
			}	// end for j...
		}	// end for i...
	return links;
	}





// ----------------------------------------------------------------------------
function createCheckBoxes(committees)
	{
	console.log(`createCheckBoxes()`);

	let boxes = d3.select("#checkboxes")
		.selectAll("div")
		.data(committees)
		.enter()
			.append("div")
		;
	boxes
		.append("label")
			// .property didn't activate the checkboxes, had to use .attr:
			.property("for", d => d)
			.attr("for", d => d)
			.text(d => d)
		;
	boxes
		.append("input")
			.property("type", "checkbox")
			// Why name them all "committee"? Grouping is for radio buttons, no?
			// Regardless, labels do not activate
			// .property("name", "committee")
			// This sets name to committee name, NOT to literal "committee":
			// Again, labels don't activate checkboxes (.attr instead of .property?)
			// .attr("name", d => d)
			// Again, doesn't work via labels:
			// .property("name", d => d)
			.attr("id", d => d)
			.property("checked", true)
			.property("value", d => d)
			.on("change", function() {
				// Gather currently-checked committees:
				let activeCommittees = committees.filter( c =>
					d3.select(`input[value="${c}"]`)
						.property("checked")
					); // end filter
				// Update list nodes to show:
				let newNodes = nodes.map( n => {
					return {
						name: n.name,
						party: n.party,
						// When filtering out committees, AND setting circle radius
						// to be a function of # committees, then radius will not change
						// when a committee checkbox is unselected.
						// And, it shouldn't.
						// BUT, tooltip shows only membership in checked committees.
						// A bug, IMHO.
						committees: n.committees.filter( c =>
							activeCommittees.includes(c)),
						// Removing filter on committees is BIGGER bug, nothing removed
						// when un-checking checkboxes:
						// committees: n.committees,
						x: n.x,
						y: n.y,
						vx: n.vx,
						vy: n.vy
						};	// end return {}
					}).filter( n => n.committees.length > 0)
					; // end nodes.map
				let newLinks = makeLinks(newNodes);
				updateGraph(newNodes, newLinks);
				//
				simulation.nodes(newNodes)
					.force("links")
						.links(newLinks)
					;
				simulation.alpha(0.5).restart();
				})	// end "on"
		;
	//
	let legend = "";	//"<h4>Parties Legend:</h4><div id='legend'>";
	// partyScale.domain().map( p => {
	parties.map( p => {
		legend += `<div style="background: `;
		legend += partyScale(p.code);
		legend += ';">';
		legend += p.name;
		legend += "</div>";
		});
	legend += "</div>";
	// console.log("LEGEND:", legend);
	d3.select("#checkboxes")
		.append("h4")
		.text("Parties Legend:")
		.append("div")
		.attr("id", "legend")
		.html(legend)
		;
	}	// end createCheckBoxes





// ----------------------------------------------------------------------------
function dragStart(d)
	{
	console.log(`dragStart()`, d);
	simulation.alphaTarget(0.5).restart();
	d.fx = d.x;
	d.fy = d.y;
	}
function dragDrag(d)
	{
	// console.log(`dragDrag()`, d);
	d.fx = d3.event.x;
	d.fy = d3.event.y;
	}
function dragEnd(d)
	{
	// console.log(`dragEnd()`, d);
	d.fx = null;
	d.fy = null;
	simulation.alphaTarget(0);
	}







// ----------------------------------------------------------------------------
// Create tooltip div:
d3.select("body")
	.append("div")
		.attr("id", "tooltip")
	;



// ----------------------------------------------------------------------------
function tooltipShow(d) {
// console.log("DATA:", d);
// console.log("tooltipShow() Y=", d3.event.y, "pageY=", d3.event.pageY);

	let tooltip = d3.select("#tooltip");

	let html = `<ul><li>Name: ${d.name} (${d.party})</li> `
		+ `<li>Committees:</li><ul> `
//		+ `<li>Committees selected to display:</li><ul> `
		;

	// Tooltop should show ALL committee memberships, NOT just ones selected
	// via checkboxes:
	nodes.find(n => n.name === d.name).committees.map( c => {
//	d.committees.map( c => {
		html += `<li>${c}</li>`;
		})
		;
	html += "</ul></ul>";

	tooltip
		// d3.event.y vs d3.event.pageY are different on Firefox & Chromium:
		// tooltipShow() Y= 351 pageY= 443
		//
		// TRANSITION on position caused tooltip to stick to bottom-left corner
		// of page. Debugger pausing on these lines made it work... "WTH?!?"
		//
		// Note: there were permutations where the tooltip div would transition
		// across the screen into place, but those always ended up with empty
		// divs due to errors.
		//
		// Uncommenting the transition on "top" & "left" below has STRANGE
		// behaviour: constantly moving over nodes causes it to very slowly move
		// towards the mouse cursor. Maybe 10px up & right each invocation. "?!?"
		//
		// Removing transition makes it work again...
		//
		// AND, further testing: switching duration from 250 to 10 makes it work
		// mostly as expected.
		// .transition()
		// .duration(10)		// 250)
		.style("top", `${d3.event.pageY - tooltip.node().offsetHeight / 2}px`)
		.style("left", `${d3.event.x + 12}px`)
		;
	// Had to break up these into separate segments, else transition failed
	// EVERY TIME, no matter how / where I placed the statement:
	tooltip
		.transition()
		.duration(150)
		.style("opacity", 1)
		;
	// This also had to be separated to make the transition work...
	tooltip
		.html(html)
		;
	}



// ----------------------------------------------------------------------------
function tooltipHide() {
	d3.select("#tooltip")
		.transition()
		.duration(500)
		.style("top", `-200px`)
		.transition()
		.duration(500)
		.style("opacity", 0)
		;
	}




// ----------------------------------------------------------------------------
function getSize() {
	let width = getPageWidth();
	let height = getPageHeight();
	/*
	// Set size to square:
	height = Math.min(width, height);
	width = Math.min(width, height);
	*/
	// console.log(`WIDTH: ${width}  HEIGHT: ${height}`);
	return {
	width: width,
	// Add padding to height so room for title:
	height: height
	}
}


// ----------------------------------------------------------------------------
function getPageWidth() {
	let divWidth = window.innerWidth;
	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	// Also, add padding.left & .right back to SVG so "width" is INSIDE padding
	divWidth = Math.floor(
		(divWidth - padding.left - padding.right) / 100 )
		* 100
		;
	return divWidth;
	}

// ----------------------------------------------------------------------------
function getPageHeight() {
	// GREAT example on stackoverflow:
	// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-cur>
	let tmpHeight = window.innerHeight
	|| document.documentElement.clientHeight
	|| window.screen.availHeight
	|| document.body.clientHeight
	;
	// Shave some space off height for radios & make an even number:
	tmpHeight = Math.floor(
		(tmpHeight - padding.top - padding.bottom) / 100)
		* 100
		;
	// If screen too small (i.e. mobile landscape): set minimum size:
	// console.log(`getPageHeight() HEIGHT: ${tmpHeight}`);
	return tmpHeight < 400 ? 400 : tmpHeight;
	}
