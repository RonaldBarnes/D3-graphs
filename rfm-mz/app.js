/*
let width = 800;
let height = 700;
*/
let width = getPageWidth();
let height = getPageHeight();



let padding = {
	top: 50,
	right: 50,
	bottom: 50,
	left: 100
	};

let barPadding = 5;
let barWidth = 75;
// barWidth = width / 10;
let data = [];
let svg;
let xScale;
let xScale2;
let yScale;
let yScaleLog;
let colourScale;
let xAxis;
let yAxis;
let numTotalDonors;








// Initialize radio buttons:
let radio = {
	F: false,
	R: false,
	M: false
	};
// Find which button is selected:
radio.F = d3.select("#F").property("checked");
radio.R = d3.select("#R").property("checked");
radio.M = d3.select("#M").property("checked");
// If no button selected, choose a default:
if (radio.F === false && radio.M === false && radio.R === false) {
	// Initialize RFM radio button default selector to Frequency:
	d3.select("#F")
		.property("checked", true)
		;
	radio.F = d3.select("#F").property("checked");
	}
// console.log("RADIO:", radio);




d3.queue()
	// HOW does the formatting callback function fit within these calls?!

	.defer(d3.csv, "FrequencyReport.csv")
	.defer(d3.csv, "MonetaryReport.csv")

	.await(function(error, freqData, moneyData) {
		if (error) throw error;

		if (radio.F) {
			// Map over records, converting strings to numbers:
			data = freqData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					record[field] = Number(record[field].replace(/,/g,""));
					});
				return record;
				});
			} // end if Frequency
		else if (radio.M) {
			// Map over records, converting strings to numbers:
			data = moneyData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					record[field] = Number(record[field].replace(/,/g,""));
					});
				return record;
				});
			} // end if Frequency


		// console.log("DATA", data);

		createScales();
		makeGraph();
		}); // end d3.queue




function getPageWidth() {
	// Get width of graph <div>: same as body width:
	let divWidth = parseInt( d3.select("#graph").style("width") );

	// Shrink it to leave some space around sides and make it
	// an even number:
	divWidth = Math.floor( divWidth / 100 - 2) * 100;
	return divWidth;
	}

function getPageHeight() {
	// Gives height=0 at initial page load (not good...):
	// tmpHeight = parseInt( d3.select("#graph").style("height") );
	// debugger;
	tmpHeight = d3.select("html")._parents[0].scrollHeight;
	// d3.select("body")._groups[0][0].clientHeight
	tmpHeight = Math.floor(tmpHeight / 100 - 2) * 100;
	return tmpHeight;
	}






svg = createSVG();
//
function createSVG() {
// Add an SVG graphic to DOM:
	svg = d3.select("#graph")
		.append("svg")
			// .attr("viewBox", "0 0 2000 1200")
			.attr("width", width + padding.left + padding.right)
			.attr("height", height + padding.top + padding.bottom)
			.style("outline", "1px solid red")
		;

	// Add a graph title:
	svg
		.append("text")
			.attr("x", width / 2 + padding.left)
			.attr("dy", "1.0em")
			.style("text-anchor", "middle")
			.style("font-size", "1.5em")
			.text("Frequency")
		;
	return svg
	}





// Can't create scales until data has been fetched, hence inside block:
function createScales() {

	xScale = d3.scaleLinear()
		.domain( [
			d3.max(data, d => d.score),
			d3.min(data, d => d.score)
			])
		// Move range setting to inside makeGraph() so responsive:
		.range([padding.left, width])
		// .clamp(true)
		;
	xAxis = d3.axisBottom(xScale)
		;


	// Alternate scale where bar's widths relate to numDonors:
	// Gather total number of donors for xScale2:
	numTotalDonors = data.map(d => d.numDonors)
		.reduce( (p,n) =>	p+n,0);
	let [minNumDonors, maxNumDonors]
		= d3.extent(data, (d) => d.numDonors);
	// Create scale for number of donors along xAxis:
	xScale2 = d3.scaleLinear()
		.domain([0, numTotalDonors + maxNumDonors]  )
		.range([padding.left, width])
		;
	xAxis2 = d3.axisBottom(xScale2);


	yScale = d3.scaleLinear()
		// Tweak yAxis domain so doesn't go slightly off scale
		// Frequency max = 11.5M, with tickSizeOuter(0) it was off-scale
		// .domain( d3.extent(data, (d) => d.totalDonated) )
		.domain( [0, (d3.max(data, (d) => d.totalDonated) * 1.1) ] )
		.range( [height, padding.top])
		;
	//
	yAxis = d3.axisLeft(yScale)
		.tickSize(-width + padding.left - barWidth)
		.tickSizeOuter(0)
		.tickFormat(function(text) {
			return d3.format("$.2s")(text);
			})
		;


	// Some colourized bars, no real colour meaning (yet):
	colourScale = d3.scaleOrdinal()
		.domain( d3.extent( data, (d) => d.score ))
		.range(d3.schemeCategory10)
		;
	} // end createScales








// Assign default values to our input / radio buttons:
d3.selectAll("input")
	.on("change", function() {
//		makeGraph();
		})
	;
// For responsive design:
// Created new .append() every resize instead of .update...
// Look into this (later)
// window.addEventListener("resize", makeGraph );




// Initialize graph:
// makeGraph(startYear);

function makeGraph() {

	let svg = d3.select("svg");
/*
	width = getPageWidth();
	height = getPageHeight();

	svg
		.attr("width", width + padding.left + padding.right)
		.attr("height", height + padding.top + padding.bottom)
		;
*/

	svg
		.selectAll("rect")
		.data( data, (d) => d.totalDonated )

		.enter()
			.append("rect")
				.attr("x", d => xScale(d.score))
//				.attr("x", d => xScale2(d.numDonors))
				.attr("y", function( d) {
					return yScale( d.totalDonated) + padding.top;
					})
				.attr("width", barWidth)
//				.attr("width", d => xScale2(d.numDonors))
				.attr("height", function(d) {
					return height - yScale(d.totalDonated);
					})
				.attr("fill", (d,index) => colourScale(index))
				.attr("stroke", "black")
		;


	// Add xAxis
	svg
		.append("g")
			.attr("transform",
				`translate(${barWidth / 2}, ${height + padding.top})`)
			.attr("id", "xAxis")
			.call(xAxis)
		;
	// Label xAxis
	svg
		.append("text")
			.attr("id", "xAxis-label")
			.attr("width", width)
			.attr("transform",
				`translate(${width / 2 + padding.left}, `
				+ `${height + 2 * padding.top})`)
			// Move UP from bottom SVG border slightly:
			.attr("dy", "-10px")
			.attr("text-anchor", "middle")
			.style("border", "1px solid green")
			.style("background", "red")
			.text("RFM Score")
		;

	// Add yAxis
	svg
		.append("g")
			// Default sits on right border: move into view:
			.attr("transform",`translate(${padding.left}, ${padding.top})`)
			.attr("id", "yAxis")
			.call(yAxis)
		;
	// Label yAxis
	svg
		.append("text")
			.text("Donation Amount")
			.attr("transform", `rotate(-90)`)
			// Moving negative x direction == DOWN:
			.attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("dy", padding.left  / 2)
			.attr("text-anchor", "middle")
		;


/*
// TEMPORARY:
d3.select("svg")
	.append("g")
		.append("rect")
		.attr("transform", `translate(${padding.left}, ${padding.top})`)
		.attr("width", width)
		.attr("height", height)
		.style("outline", "1px solid green")
//		.attr("x", padding)
//		.attr("y", padding)
		.attr("fill", "transparent")
	;
*/

	setToolTip()
	}
	;





// Set handler for tooltips:
function setToolTip() {
	d3.selectAll("rect")
		.on("mousemove", tooltipShow)
		.on("touchstart", tooltipShow)
		.on("mouseout", tooltipHide)
		.on("touchend", tooltipHide)
	}







// Add Tooltip div:
d3.select("body")
	.append("div")
		.attr("id", "tooltip")
		.classed("tooltip", true)
	;



function setYearLabel(year = minYear) {
	console.log(`YEAR: ${year}`)
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

	// console.log("DATA:", data);

	let tooltip = d3.select("#tooltip");

	tooltip
		.style("opacity", 1)
		.style("top", `${d3.event.y - tooltip.node().offsetHeight / 2}px`)
		.style("left", `${d3.event.x + 12}px`)
		.style("z-index", 100)
		.html(`Score: ${data.score.toLocaleString()}
			<p>Number of Donors: ${data.numDonors.toLocaleString()}</p>
			<p>Total Donations: ${data.totalDonations.toLocaleString()}</p>
			<p>Total Donated: $${data.totalDonated.toLocaleString()}</p>
			<p>Average Donation: $${data.averageDonations.toLocaleString()}</p>
			`)
		;
	}



function tooltipHide() {
	d3.select("#tooltip")
		.style("opacity", 0)
		;
	}
