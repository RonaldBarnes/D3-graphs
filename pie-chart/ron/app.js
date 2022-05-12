//
// vsCodium here, via "fish" ssh file system on KDE!
//
// BUT, everything coded in nano: faster 'til I learn vsCode...

console.log("\n\n",
	"--------------------------------------\n",
	"© ron@ronaldbarnes.ca 2022\n",
	"--------------------------------------\n",
	"\n\n"
	);





let padding = {
	top: 50,
	right: 10,
	bottom: 10,
	left: 10
	};


let {width, height} = getSize();


let [minYear, maxYear] = d3.extent(birthData, d => d.year);

// Initialize the chart to a median value, looks nicer:
let startYear = minYear + (maxYear - minYear) / 2;

// Use a set for continent data as it has built-in de-duplication:
let continents = new Set();
// Here's where we map over input data, gathering unique continent codes:
birthData.map( d => { continents.add(d.continent) } );

// Map codes to names:
let continentsNames = {
	AF: "Africa",
	AS: "Asia",
	EU: "Europe",
	NA: "North America",
	OC: "Oceania, Aus, & NZ",
	SA: "South America"
	};


// Colour scale for continents, both pie slices and legend:
let colourScale = d3.scaleOrdinal()
	.domain( continents )
	.range(d3.schemeCategory10)
	;



// Add an SVG to the div with ID of "graph":
d3.select("#graph")
	.append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("outline", "1px solid red")
	;



// Pie charts centre on 0,0 by default, so make a group and centre it,
// which will become the pie chart later:
let svg = d3.select("svg");
svg
	.append("g")
	.attr("id", "graph-centre")
/*
		.attr("width", width - padding.left - padding.right)
		.attr("height", height - padding.top - padding.bottom)
		.attr("transform",
			`translate( ${width / 2}, ${height / 2})`)
*/
	// .classed("chart", true)
	// Show the internal padding: green box touches outer circle edge:
	// Helps with alignment, not needed in "production":
	.style("outline", "1px solid green")
	;



// Assign default values to our input / range slider:
d3.select("input")
	.property("min", minYear)
	.property("max", maxYear)
	.property("value", startYear)
	.on("input", function() {
		updateGraph( Number(d3.event.target.value));
		})
	;


// Initialize sort-by-continent to false:
d3.select("#groupContinents")
	.property("checked", false)
	;
// Set a variable to refer to in the arcs.sort():
let groupContinents =
	d3.select("#groupContinents").property("checked");
//console.log("CHECKBOX:", groupContinents);

// Set change handler on checkbox:
d3.select("#groupContinents")
	.on("input", function (d) {
		let groupContinents =
			d3.select("#groupContinents").property("checked");
		console.log("CHECKBOX changed:", groupContinents);
		updateGraph(Number(d3.select("input").property("value")));
		})
	;






// Initialize graph:
updateGraph(startYear);

// Make or UPDATE graph -------------------------------------------------------
function updateGraph(year)
	{
	if (typeof year !== "number")
		{
		// Window was resized, etc. so year is the event and we need to
		// extract the actual year elsewhere:
		// Maybe just skip the passed parameter entirely?
		year = Number(d3.select("#inputYear").property("value") );
		}
	console.log(`updateGraph() year:`, year);

	let yearData = birthData.filter( d => (d.year === year) );
	setYearLabel(year)


	// Responsive Design: if page changes size / orientation, redraw:
	let {width, height} = getSize();
console.log(`updateGraph() width: ${width}  height: ${height}`);



	// Re-size graph on browser re-size, rotate, etc.
	d3.select("svg")
		.attr("width", width)
		.attr("height", height)
		;

	// Re-centre graph on re-size, rotate, etc.
	d3.select("#graph-centre")
		.attr("width", width - padding.left - padding.right)
		.attr("height", height - padding.top - padding.bottom)
		.attr("transform",
			`translate( ${width / 2}, ${height / 2 + padding.top / 2})`)
		;

	// Adjust title positioning (on re-size, rotate, etc.)
	d3.select("#title")
		.attr("x", width / 2 + padding.left)
		;





	// Should we sort the slices by continent, then births?
	let groupContinents =
		d3.select("#groupContinents").property("checked");


	// The beginning of a pie chart:
	let arcs = d3.pie()
		.value(d => (d.births))
		// Sort by continent, grouping sections by colour:
		.sort(function (a, b) {
			// console.log(`Group CONTINENTS:`,groupContinents)
			if (groupContinents) {
				if (a.continent < b.continent) {
					return -1
					}
				else if (a.continent > b.continent) {
					return 1
					}
				}
			return b.births - a.births;
			})	// end sort
		// Gap between segments: (CAUSES WEIRD ARITFACTS ON TRANSITIONS!)
		// .padAngle(0.01)
			// this is the arcs.value() I think, poor explanation in lesson:
		(yearData)
		;



	let path = d3.arc()
		.outerRadius( width / 2 - padding.left - padding.right)
		// Positive innerRadius gives an annulus (donut):
		.innerRadius(width / 7)
		// cornerRadius: round arc corners
		.cornerRadius(10)
		;

	let update = d3.select("#graph-centre")
		.selectAll("path")
		.data(arcs
			// key function to bind data to specific slices based on country:
			,
			(d,i) => (d.region)
			)
		;
	update
		// Enter / create / append new DOM items to match number of data items:
		.enter()
		.append("path")
			.attr("stroke", "black")
//			.classed("arc", true)
			.attr("opacity", 0.5)
		// Handle new and updated DOM items:
		.merge(update)
			.attr("d", path)
			.transition()
			.duration(1000)
			.delay((d, i) => i * 10)
			.attr("opacity", 1)
			.attr("fill", d => colourScale(d.data.continent))
			.attr("id", d => (d.region))
		;
	update
		// Remove DOM items no longer bound to data:
		.exit()
			.transition().duration(500)	// .delay( (d,i) => (i * 50))
			.attr("opacity", 0)
			.remove()
		;

	setToolTip()
	};	// end updateGraph
// Make or UPDATE graph -------------------------------------------------------






//
// For responsive design, listen to page resizing:
window.addEventListener("resize", updateGraph );
//
// DisplayPixelRatio is > 1 on hiDPI (3.x on Pixel4a Firefox)
//  Wrote media query CSS to handle this
/*
d3.select("#devicePixelRatio")
.append("text")
.text(`devicePixelRatio: ${window.devicePixelRatio}`)
.style("font-size", "3rem")
;

THE devicePixelRatio CAN BE REPLACED: in html, add:
<meta name="viewport" content="width=device-width, initial-scale=1">

if (window.devicePixelRatio > 1)
	{
	padding = padding * 2;
	}
*/



// Put focus on year selector for keyboard navigation:
document.getElementById("inputYear").focus();




// Set handler for tooltips:
function setToolTip() {
	d3.selectAll("path")
		.on("mousemove", tooltipShow)
		.on("touchstart", tooltipShow)
		.on("mouseout", tooltipHide)
		.on("touchend", tooltipHide)
	}





// Add a graph title:
svg
	.append("text")
		.attr("id", "title")
		.attr("x", width / 2)
		.attr("dy", "1.25em")
		.style("text-anchor", "middle")
		.text("Births by Country & Year")
	;


// Create colourized legend for continents:
let legend = "";
Array.from(continents).sort().forEach(function (c) {
	legend += `<div style="background:${colourScale(c)}" `
		+ `title="${continentsNames[c]}">`
		+ `${c}: ${continentsNames[c]}</div>`;
	// console.log(`CONTINENT: ${c}=${continentsNames[c]}`)
	});
// console.log(`LEGEND: ${legend}`)
d3.select("#colour-legend")
	.html(legend)
	;





// Add Tooltip div:
d3.select("body")
	.append("div")
		.attr("id", "tooltip")
		.classed("tooltip", true)
	;



function setYearLabel(year = minYear) {
	// console.log(`setYearLabel() YEAR: ${year}`)
	// Range selector:
	// Initialize upon loading:
	d3.select("#year")
		.text(`Displaying year ${year}`)
		;
	d3.select("#minYear")
		.text(minYear)
		;
	d3.select("#maxYear")
		.text(maxYear)
		;
	}












function tooltipShow(data) {

	// console.log("DATA:", data.data);

	let tooltip = d3.select("#tooltip");

	tooltip
		.style("opacity", 1)
		.style("top", `${d3.event.y - tooltip.node().offsetHeight / 2}px`)
		.style("left", `${d3.event.x + 12}px`)
		.style("z-index", 100)
		.html(`<p>Country: ${data.data.region}</p><p>Year: ${data.data.year}</p> `
			+ `<p>Births: ${data.data.births.toLocaleString()}</p>`)
		;
	}



function tooltipHide() {
	d3.select("#tooltip")
		.style("opacity", 0)
		;
	}





function getPageWidth() {
	let divWidth = window.innerWidth;
	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	divWidth = Math.floor( divWidth / 100 ) * 100;
	return divWidth;
	}

function getPageHeight() {
	// GREAT example on stackoverflow:
	// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
	let tmpHeight = window.innerHeight
		|| document.documentElement.clientHeight
		|| window.screen.availHeight
		|| document.body.clientHeight
		;
	// Shave some space off height for radios & make an even number:
	tmpHeight = Math.floor(tmpHeight / 100 - 3) * 100;
	// If screen too small (i.e. mobile landscape): set minimum size:
	return tmpHeight < 400 ? 400 : tmpHeight;
	}


function getSize() {
	let width = getPageWidth();
	let height = getPageHeight();
	// Set size to square:
	height = Math.min(width, height);
	width = Math.min(width, height);

	// console.log(`WIDTH: ${width}  HEIGHT: ${height}`);
	return {
		width: width,
		// Add padding to height so room for title:
		height: height + padding.top,
		}
	}
