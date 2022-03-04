
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
// It's said that AREA should be used, not radius...
let pixelsPerCommittee = 10;

// Both width & height will be re-caluclated once checkboxes populated, for
// responsive design & to make best use of remaining space for SVG
// Assign arbitrary values for now:
let [width, height] = [400, 400];	// getSize();

let svg;
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
	.domain( parties.map( p => p.code) )
	.range( ["blue", "red", "grey"] )
	;











d3.csv("./senate_committee_data.csv", function(d,i,headers) {
	// formatter function, run on EACH ROW:
	// First, strip off first 2 columns' headers (name, party), then
	// filter memberships (===1) and assign header/committee names to array:
	let committees = headers.slice(2).filter( h => d[h] === "1");
	//
	if (committees.length === 0) console.log("NO COMMITTEES", d);
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



	// Create checkboxes first, now that data is read & formatted, this
	// allows for SVG to be sized responsively dependent upon remaining space:
	//
	// Pass all columns except first 2 (skip 0 & 1, start at 2):
	// But, ONLY the headers, not data.
	// "columns" from d3.csv: returns rows and a columns object with headers.
	createCheckBoxes(nodes.columns.slice(2));

	// Get fresh width value taking into account checkboxes div:
	width = getWidth();
	height = getHeight();
	// console.log(`new WIDTH: ${width}, HEIGHT: ${height}`);

	d3.select("#graph")
		.append("svg")
			.attr("width", width)
			.attr("height", height)
		;
	svg = d3.select("svg");




	// Links go first, else they have "z-index" placing them ABOVE nodes!
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
			d3.forceManyBody().strength(-75)
			)
		.force("collision-avoidance",
			d3.forceCollide().radius( function(d) {
				return nodes.find(n => n.name === d.name).committees.length
					* pixelsPerCommittee;
				})
			)
		.force("centre",
			d3.forceCenter( width/2, height / 2)
			)
		.force("links", d3.forceLink(links)
			.distance( d => {
			// Spread out distance of senators on multiple committees for legibility:
				let count1 = d.source.committees.length * pixelsPerCommittee;
				let count2 = d.target.committees.length * pixelsPerCommittee;
				return 10 * Math.max(count1, count2);
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
					// Title is mostly useless on lines except maybe debugging.
					// Might be nice for mouse-over events though?
					.attr("title", function(d) {
						// console.log("linkUpdate.enter() d:", d);
						return d.source.name + " " + d.target.name
						})
				;
			nodeGroup
				.selectAll("circle")
					// Constrain circles leaving SVG: the centres stick at boundaries:
					.attr("cx", d => d.x > width ? width : (d.x < 0 ? 0 : d.x) )
					.attr("cy", d => d.y > height ? height : (d.y < 0 ? 0 : d.y) )
				;
			})	// end "on tick"
	// Generate graph:
	updateGraph(nodes,links);
	});	// end d3.csv














// ----------------------------------------------------------------------------
function updateGraph(nodeData, linkData)
	{
	// If called on window.resize, can't pass data without invoking this
	// function. For now, use this fix 'til relocated window.resize listener:
	if (nodeData === undefined || linkData === undefined)
		{
		nodeData = d3.select("#nodeGroup").selectAll("circle").data();
		linkData = d3.select("#linkGroup").selectAll("line").data();
		}

	// ALL THIS RE-SIZING HACKING IS UGLY. I'M SORRY...
	//
	// stupid attempt to get legit size on window.resize:
	// window.innerWidth can be 1800+, not good
	d3.select("svg")
//		.transition()
//		.duration(250)
		.attr("width", 0)
		.attr("height", 0)
		;
	// Checkboxes too, FFS: they change size by margin-left & right when
	// SVG is resized to 0:
	let checkboxWidth = d3.select("#checkboxes").property("clientWidth");
	d3.select("#checkboxes")
		.attr("width", 0)
		;
	//
	// Refresh size:
	width = getWidth();
	height = getHeight();
	//
	d3.select("svg")
		.attr("width", width)
		.attr("height", height)
		;
	d3.select("#checkboxes")
		.attr("width", checkboxWidth)
		;




	let nodeUpdate = d3.select("#nodeGroup")
		.selectAll("circle")
		.data(nodeData, d => d.name)
		;

	nodeUpdate
		.exit()
			// Shrink 'til disappeared:
			.transition()
			.duration(250)
			.delay( (d,i) => i * 25)
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
				// Set size as function of ALL committees, not just ones value=checked:
				// .attr("r", d => d.committees.length * pixelsPerCommittee)
				.attr("r", d =>
					// Node circles should reflect ALL committee memberships, NOT just
					// those whose checkbox value=checked!
					nodes.find(n => n.name === d.name).committees.length
					* pixelsPerCommittee
					)
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
				// Node circles should reflect ALL committee memberships, NOT just
				// those whose checkbox value=checked!
				// .attr("r", d => d.committees.length * pixelsPerCommittee)
				.attr("r", d =>
					nodes.find(n => n.name === d.name).committees.length
						* pixelsPerCommittee
					)
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

	let linkUpdate = d3.select("#linkGroup")
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
				.on("mousemove touchstart", tooltipShow)
				.on("mouseout touchend", tooltipHide)
					// Title is mostly useless on lines except maybe debugging.
					// Might be nice for mouse-over events though?
				.attr("title", function(d) {
					// console.log("linkUpdate.enter() d:", d);
					return d.source.name + " " + d.target.name
					})
		;
	// When re-sizing SVG, nodes don't re-draw: add jiggle:
	// Oops. This causes never-ending movement, not quite right:
	// Kind of hypnotic; like looking at astronomy simulations
	// simulation.alphaTarget(0.25).restart();
	// Nice info here:
	// https://github.com/d3/d3-force/blob/main/README.md#simulation_nodes
	simulation
		.force("centre", d3.forceCenter( width/2, height/2))
			.alpha(0.5)
			.restart()
		;
	}	// end updateGraph()






// ----------------------------------------------------------------------------
// Matt gets 1021 array elements returned, I'm getting 688!?!
// Found some clues: Jon Tester, Mike Enzi, Risch are not getting enough / any
// links...
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
					{
					links.push({
						source: senator1.name,
						target: senator2.name
						});
/*
						if ( (`${senator1.name} ${senator2.name}`).includes("Tester")
						// Johnny Isakson is on Veterans' Affairs with Jon Tester but... NO LINK
						//		|| (`${senator1.name} ${senator2.name}`).includes("Johnny Isakson")
						//		|| (`${senator1.name} ${senator2.name}`).includes("Risch")
						//		|| (`${senator1.name} ${senator2.name}`).includes("Enzi")
								)
							{
							console.log(`LINK: ${senator1.name} ${senator2.name}`);
							}	// end if Tester, ...
*/
					break;
					}
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
		.attr("height", height)
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
			.text(d => {
				// Show count of committee members in label, map over all nodes:
				return d + " (" + nodes.map(n =>
					// filter on matching committees and count (.length):
					n.committees).filter(c => c.includes(d)).length + ")";
				})
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




//
// For responsive design, listen to page resizing:
window.addEventListener("resize", updateGraph);
// Adding params here causes immediate invokation.
// Could move this listener to end of d3.csv, but put the following code
// inside updateGraph() so it's always avaiable to that function:
//		d3.select("#nodeGroup").selectAll("circle").data(),
//		d3.select("#linkGroup").selectAll("line").data()
//		)
//	);

/*
d3.select("#devicePixelRatio")
	.append("text")
	.text(`devicePixelRatio: ${window.devicePixelRatio}`)
//	.style("font-size", "3rem")
	;
*/


// ----------------------------------------------------------------------------
// Create tooltip div:
d3.select("body")
	.append("div")
		.attr("id", "tooltip")
	;



// ----------------------------------------------------------------------------
function tooltipShow(d) {
	// console.log("DATA:", d);
	/*
 	console.log("tooltipShow() X=", d3.event.x, "pageX=", d3.event.pageX,
		"Y=", d3.event.y, "pageY=", d3.event.pageY);
	*/

	let tooltip = d3.select("#tooltip");
	let posTop;
	let posLeft;
	// Default position for tooltip is to right of node circle:
	let tooltipClass;

	// Make tooltips for lines as well as nodes:
	let html;
	if (d.source === undefined)
		{
		// Node / circle:
		html = `<ul><li>Name: ${d.name} (${d.party})</li> `
			+ `<li>Committees:</li><ul> `
			;
		// Tooltip should show ALL committee memberships, NOT just ones selected
		// via checkboxes:
		nodes.find(n => n.name === d.name).committees.map( c => {
			html += `<li>${c}</li>`;
			})
			;
		html += "</ul></ul>";
		}
	else
		{
		// Line:
		html = `<h4>Connection</h4> `
			+ `<ul><li>${d.source.name} (${d.source.party})</li> `
			+ `<li>${d.target.name} (${d.target.party})</li></ul>`
			;
		}


	// This also had to be separated to make the transition work...
	//
	// Append html to tooltip BEFORE calculating position, since position is
	// dependent on tooltip div size!
	tooltip
		.html(html)
		;


	// Use different class if node circle is to right side of graph:
	// We're given the x-offset as a position within window, need to remove
	// width of checkboxes div to get approximate position within SVG:
	if (d3.event.x
			- document.querySelector("#graph").offsetLeft
			> width / 2)
		{
		// Show tooltip to LEFT of node circle:
		tooltipClass = "tooltipLeft";
		posTop = d3.event.pageY - tooltip.node().offsetHeight / 2;
		posLeft = d3.event.x - tooltip.node().offsetWidth - 12;
		}
	else
		{
		// Show tooltip to RIGHT of node circle:
		tooltipClass = "tooltipRight";
		posTop = d3.event.pageY - tooltip.node().offsetHeight / 2;
		posLeft = d3.event.x + 12;
		}


	tooltip
		// d3.event.y vs d3.event.pageY are different on Firefox & Chromium?:
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
		.style("top", `${posTop}px`)
		.style("left", `${posLeft}px`)
		// Classes accumulate: remove all previous ones:
		.classed("tooltipLeft", false)
		.classed("tooltipRight", false)
		// Now, reapply only the current one based on position of mouse cursor:
		.classed(tooltipClass, true)
		;
	// Had to break up these into separate segments, else transition failed
	// EVERY TIME, no matter how / where I placed the statement:
	tooltip
		.transition()
		.duration(150)
		.style("opacity", 1)
		;
	}



// ----------------------------------------------------------------------------
function tooltipHide() {
	d3.select("#tooltip")
		.transition()
		.duration(250)
		.style("top", "-150px")
		.transition()
		.duration(500)
		.style("opacity", 0)
		// Move tooltip to top-left: resizing window smaller can leave its
		// location off-screen, such that large scroll bar(s) appear:
		.style("top", "0px")
		.style("left", "0px")
		;
	}



// ----------------------------------------------------------------------------
function getWidth()
	// This was a nightmare to set up for responsive.
	// Not quite a quick & dirty solution, more a slow and filthy one.
	{
	let checkboxWidth = d3.select("#checkboxes").property("clientWidth");

	// THIS gives issues with scrollbar widths overlooked:
	// width = window.innerWidth
	//
	// [window.innerWidth, document.documentElement.clientWidth] =
	// [1039, 1024]
	//
	// IF on mobile and flex-direction === column, then use full page width:
	// i.e. if left side of SVG is after right side of checkboxes, subtract
	// checkboxes' width from available space:
	if (document.querySelector("#graph").offsetLeft < checkboxWidth)
		{
		// Column display hence equal width:
		width = checkboxWidth;
		// HOWEVER - checkbox width CHANGES after the SVG takes on its value FFS!
		// Once the SVG is shrunk to 0x0 before calling this function,
		// #checkboxes shrinks by 15px (probably 16 with rounding...)
		// document.body margins?
		// Not sure why, it's crazy-making...
		// Will this fix it?:
		//
		// Never mind: CSS on SVG was: margin: 0 auto;
		// NOPE, need to handle body margins even with CSS SVG margin: 0;
		width = width
			// These fuck up on Firefox mobile, but required on Chromium desktop:
			- parseInt(d3.select("body").style("margin-left"))
			- parseInt(d3.select("body").style("margin-right"))
		}
	else
		{
		width = d3.select("#graph").property("clientWidth")
//			- parseInt(d3.select("body").style("margin-left"))
//			- parseInt(d3.select("body").style("margin-right"))
			;
		}
	return width;
	}

// ----------------------------------------------------------------------------
function getHeight()
	{
	// Should SVG just be made square? Node dispersal is elongated...
	// This makes it same height as checkboxes (which set height on container):
	// height = d3.select("#container").property("clientHeight");
	//
	// This will make it window height - header / title or checkboxes height:
	height = Math.max(
		window.innerHeight
			- d3.select("#title").property("clientHeight")
			// .style() gives results with "px" suffix, parseInt those away:
			- parseInt(d3.select("#title").style("margin-top"))
			- parseInt(d3.select("#title").style("margin-bottom"))
			- parseInt(d3.select("body").style("margin-top"))
			- parseInt(d3.select("body").style("margin-bottom"))
			,
		d3.select("#checkboxes").property("clientHeight")
		);
	return height;
	}








// ----------------------------------------------------------------------------
// Remaining code is "template" and unused here... Specialized versions above
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
	// return d3.select("#container").property("clientHeight");
	// GREAT example on stackoverflow:
	// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-cu
	let tmpHeight = window.innerHeight
	|| document.documentElement.clientHeight
	|| window.screen.availHeight
	|| document.body.clientHeight
	;
	// Shave some space off height for radios & make an even number:
	/*
	tmpHeight = Math.floor(
		(tmpHeight - padding.top - padding.bottom) / 100)
		* 100
		;
	*/
	// If screen too small (i.e. mobile landscape): set minimum size:
	// console.log(`getPageHeight() HEIGHT: ${tmpHeight}`);
	return tmpHeight < 400 ? 400 : tmpHeight;
	}
