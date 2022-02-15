/*
let width = 800;
let height = 700;
*/
let width = getPageWidth();
let height = getPageHeight();
console.log(`WTH? WIDTH=${width} HEIGHT=${height}`);


let padding = {
	top: 50,
	right: 50,
	bottom: 75,
	left: 100
	};

let barPadding = 10;
let barWidth = 50;
barWidth = width / 12;
// Data supplied to bar graph routine (rects):
let data;
let svg;
// xScale & xAxis:
let xScale;
let xScale2;	// Unused: was to change bar widths based on X
let xAxis;
// yScale(s) and yAxis(es / yAxes):
let yScale;
let yScaleFreqNumDonors;
let yScaleFreqAvgDonation;
let yScaleLog; // Not used, but Score == 1 is often useless data
let yAxis;
// Green to red: green is better target:
let colourScale;
let numTotalDonors;

// When switching graphs, have data stored so no fetching:
let dataRecency;
let dataFreq;
let dataMoney;





// Initialize radio buttons:
// Frequency, Recency, Monetary:
let radioRFM = {
	F: false,
	R: false,
	M: false
	};
let radioFreq = {
	total: false,
	numDonors: false,
	average: false,
	};
let radioMoney = {
	total: false,
	numDonors: false,
	avgPerDonor: false,
	avgDonation: false,
	};

// updateRadioValues();

// This will update the radio object values from the HTML, or...
// Update the HTML if nothing had been set...
//
function updateRadioValues() {
	// Find which button is selected:
	radioRFM.R = d3.select("#R").property("checked");
	radioRFM.F = d3.select("#F").property("checked");
	radioRFM.M = d3.select("#M").property("checked");
	//
	// If no button selected, choose a default:
	if (radioRFM.F === false
			&& radioRFM.M === false
			&& radioRFM.R === false) {
		// Initialize RFM radio button default selector to Frequency:
		d3.select("#F")
			.property("checked", true)
			;
		// Ensure data structure reflects HTML:
		radioRFM.F = d3.select("#F").property("checked");
		}
	if (radioRFM.F) {
		// Display sub-selections for Frequency:
		d3.select("#optsFrequency")
			.style("display", "flex")
			;
		d3.select("#optsMoney")
			.style("display", "none")
			;
		// Update data set to Frequency:
		data = dataFreq;
console.log("DATA SET CHANGED TO FREQ:", data, dataFreq);
		//
		// If no sub-select button chosen, default is average donation:
		if (radioFreq.total === false
				&& radioFreq.numDonors === false
				&& radioFreq.average === false) {
			d3.select("#freqAvg")
				.property("checked", true)
				;
			// Ensure data structure reflects HTML:
			// radioFreq.total = d3.select("#freqTotalDonated")
			radioFreq.total = d3.select("#freqAvg")
				.property("checked");
			}
		// Find which Frequency sub-select button is chosen:
		radioFreq.total = d3.select("#freqTotalDonated")
			.property("checked");
			// Set yScale to new data set:
//			yScale
//				.domain( d3.extent( d => totalDonations))
		radioFreq.numDonors = d3.select("#freqNumDonors")
			.property("checked");
			// Set yScale to new data set:
//			yScale
//				.domain( d3.extent( d => numDonors))
		radioFreq.average = d3.select("#freqAvg")
			.property("checked");
		} // end if Frequency

	else if (radioRFM.M) {
		// Display sub-selections for Monetary:
		d3.select("#optsMoney")
			.style("display", "flex")
			;
		d3.select("#optsFrequency")
			.style("display", "none")
			;
		//
		// If no sub-select button chosen, default is average donation:
		if (radioMoney.total === false
				&& radioMoney.numDonors === false
				&& radioMoney.avgPerDonor === false
				&& radioMoney.averagePerDonation === false) {
			d3.select("#moneyAvgPerDonor")
				.property("checked", true)
				;
			// Ensure data structure reflects HTML:
			radioMoney.total = d3.select("#moneyAvgPerDonor")
				.property("checked");
			} // end if
		//
		// Find which Monetary sub-select button is chosen:
		radioMoney.total = d3.select("#moneyTotalDonated")
			.property("checked");
			// Set yScale to new data set:
//			yScale
//				.domain( d3.extent( d => totalDonated))
		radioMoney.numDonors = d3.select("#moneyNumDonors")
			.property("checked");
			// Set yScale to new data set:
//			yScale
//				.domain( d3.extent( d => numDonors))
		radioMoney.avgPerDonor = d3.select("#moneyAvgPerDonor")
			.property("checked");
			// Set yScale to new data set:
//			yScale
//				.domain( d3.extent( d => avgDonation))
		radioMoney.avgDonation = d3.select("#moneyAvgDonation")
			.property("checked");
		// Update data set to Monetary:
		data = dataMoney;
console.log("DATA SET CHANGED TO MONEY:", data, dataMoney);
		} // end else if Monetary


//	let temp = d3.select("#freqAvg");
//	temp.parentNode
	console.log("RADIOs radioRFM:", radioRFM,
		"radioFreq", radioFreq,
		"radioMoney", radioMoney
		);
	}




d3.queue()
	// HOW does the formatting callback function fit within these calls?!

	.defer(d3.csv, "FrequencyReport.csv")
	.defer(d3.csv, "MonetaryReport.csv")

	.await(function(error, freqData, moneyData) {
		if (error) throw error;

//		if (radioRFM.F) {
			// Map over records, converting strings to numbers:
			data = dataFreq = freqData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					record[field] = Number(record[field].replace(/,/g,""));
					});
				return record;
				});
//			} // end if Frequency
//		else if (radioRFM.M) {
			// Map over records, converting strings to numbers:
			data = dataMoney = moneyData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					record[field] = Number(record[field].replace(/,/g,""));
					});
				return record;
				});
//			} // end if Monetary


		console.log("d3.queue() DATA", data, dataFreq, dataMoney);

		// Set the data set according to the radio buttons selected:
		updateRadioValues();
		createScales();
		makeGraph();
		colourLegend();
		}); // end d3.queue




function getPageWidth() {
	// Get width of graph <div>: same as body width:
	// let divWidth = parseInt( d3.select("#graph").style("width") );
	let divWidth = window.innerWidth;
	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	divWidth = Math.floor( divWidth / 100 - 2) * 100;
	return divWidth;
	}

function getPageHeight() {
	// Gives height=0 at initial page load (since nothing's drawn):
	// tmpHeight = parseInt( d3.select("#graph").style("height") );
	//
	// This doesn't shrink once bar graph drawn:
	// tmpHeight = d3.select("html")._parents[0].scrollHeight;
	// Again, height doesn't shrink once bars exist:
	// let tmpHeight = d3.select("html")._parents[0].scrollHeight
	//
	//	let tmpHeight = d3.select("body")._groups[0][0].clientHeight
	//	let tmpHeight = d3.select("html")._parents[0].clientHeight
	//
	// document.body.clientHeight = 854 (but is only 34px at load!)
	// window.innerHeight = 997
	// document.documentElement.clientHeight = 997
	// window.screen.height = 1200
	// window.screen.availHeight = 1200
	//
	// GREAT example on stackoverflow:
	// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
	let tmpHeight = window.innerHeight
		|| document.documentElement.clientHeight
		|| window.screen.availHeight
		|| document.body.clientHeight
		;
	tmpHeight = Math.floor(tmpHeight / 100 - 3) * 100;
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
			.attr("id", "title")
			.attr("x", width / 2 + padding.left)
			.attr("dy", "1.0em")
			.style("text-anchor", "middle")
			// attr, not style, because CSS for media queries:
			.attr("font-size", "1.5em")
			.text("Recency / Frequency / Monetary Analysis")
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

/*
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
*/

	// This yScale is for Frequency totalDonated per group:
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

/*
	// This yScale is for Frequency: Number of Donors per group
	yScaleFreqNumDonors = d3.scaleLinear()
		.domain( [0, d3.max(data, d => d.numDonors)])
		.range( [height, padding.top])
		;
	//
	yAxisFreqNumDonors = d3.axisLeft(yScaleFreqNumDonors)
		.tickSize(-width + padding.left - barWidth)
		.tickSizeOuter(0)
		.tickFormat(function(text) {
			return d3.format(".2s")(text);
			})
		;

	// This yScale is for Frequency: Average Donation Amount per group
	yScaleFreqAvgDonation = d3.scaleLinear()
		.domain( [0, d3.max(data, d => d.avgDonation)])
		.range( [height, padding.top])
		;
	//
	yAxisFreqAvgDonation = d3.axisLeft(yScaleFreqAvgDonation)
		.tickSize(-width + padding.left - barWidth)
		.tickSizeOuter(0)
		.tickFormat(function(text) {
			return d3.format("$.2s")(text);
			})
		;
*/


	// Some colourized bars, no real colour meaning (yet):
	// colourScale = d3.scaleOrdinal()
	colourScale = d3.scaleLinear()
		.domain( d3.extent( data, (d) => d.score ))
//		.range(d3.schemeCategory10)
		.range(["red", "green"])
		;

	} // end createScales








// Assign default values to our input / radio buttons:
d3.selectAll("input")
	.on("change", function() {
		console.log(`INPUT field changed...`);
		updateRadioValues();
		updateGraph();
		})
	;
// For responsive design:
// Created new .append() every resize instead of .update...
// Look into this (later)
window.addEventListener("resize", updateGraph );


/*
// DisplayPixelRatio is > 1 on hiDPI (3.x on Pixel4a Firefox)
//	Wrote media query CSS to handle this
d3.select("#pixel")
	.append("text")
	.text(window.devicePixelRatio)
	.style("font-size", "3em")
	;
*/


// Initialize graph:
// makeGraph(startYear);

function makeGraph() {

	let svg = d3.select("svg");

	width = getPageWidth();
	height = getPageHeight();

	svg
		.attr("width", width + padding.left + padding.right)
		.attr("height", height + padding.top + padding.bottom)
		;


	svg
		.selectAll("rect")
		.data( data, (d) => d.totalDonated )
		// Add rects / bars to graph, default is Frequency data:
		.enter()
			.append("rect")
/*
				.transition()
				.duration(1000)
				.delay( (d,i) => i * 100)
				.attr("x", d => xScale(d.score) + barPadding/2)
				.attr("y", function( d) {
					// return yScale( d.totalDonated) + padding.top;
					return yScaleFreqAvgDonation( d.averageDonation) + padding.top;
					})
				.attr("width", barWidth - barPadding)
				.attr("height", function(d) {
					// return height - yScale(d.totalDonated);
					return height - yScaleFreqAvgDonation(d.averageDonation);
					})
				.attr("fill", (d,index) => colourScale(d.score))
				.attr("stroke", "black")
				.transition()
				.duration(1000)
				.delay( (d,i) => i * 50)
*/
		;


	// Add xAxis
	svg
		.append("g")
			.attr("id", "xAxis")
			.attr("transform",
				`translate(${barWidth / 2}, ${height + padding.top})`)
			.call(xAxis)
		;
	// Label xAxis
	svg
		.append("text")
			.attr("id", "xAxis-label")
			.attr("width", width)
			.attr("transform",
				`translate(${width / 2 + padding.left}, `
				+ `${height + padding.top + padding.bottom})`)
			// Move UP from bottom SVG border slightly:
			.attr("dy", "-1em")
			.attr("text-anchor", "middle")
			.text("RFM Score")
		;


	// Add yAxis
	svg
		.append("g")
			.attr("id", "yAxis")
			// Default sits on right border: move into view:
			.attr("transform",`translate(${padding.left}, ${padding.top})`)
			.call(yAxis)
			// .call(yAxisFreqAvgDonation)
		;
	// Label yAxis
	svg
		.append("text")
			.attr("id", "yAxis-label")
			// .text("Donation Amount")
//			.text("Average Donation Amount")
			.attr("transform", `rotate(-90)`)
			// Moving negative x direction == DOWN:
			.attr("x", -(height) / 2 - padding.bottom)
			.attr("dy", "1.5em")
			.attr("text-anchor", "middle")
		;


	// Firefox remembers selected radios, so may not be default.
	// Running update next will change yAxis (etc?) to user-selection:
	updateGraph();
	}
	;




// Responsive design - changes in size of window:
function updateGraph() {
	width = getPageWidth();
	height = getPageHeight();
	// Width of bars changes as screen width changes:
	barWidth = width / 12;
	// console.log(`WIDTH: ${width}  HEIGHT: ${height}`);

console.log("updateGraph() DATA:", data);

	svg = d3.select("svg");
	svg
		.attr("width", width + padding.left + padding.right)
		.attr("height", height + padding.top + padding.bottom)
		;

	xScale
		.range([padding.left, width])
		;
	d3.select("#xAxis")
		.attr("transform",
			`translate(${barWidth / 2}, ${height + padding.top})`)
		.call(xAxis)
		;
	d3.select("#xAxis-label")
		.attr("transform",
			`translate(${width / 2 + padding.left}, `
			+ `${height + padding.top + padding.bottom})`)
			// Move UP from bottom SVG border slightly:
			.attr("dy", "-1em")
		;




	// Change yAxis DEPENDING ON RADIO BUTTONS selected:

	if ( (radioRFM.F === true && radioFreq.total === true)
				|| (radioRFM.M === true && radioMoney.total) )
		{
		// use original yScale...
		yScale
			.domain( [0, (d3.max(data, (d) => d.totalDonated) * 1.1) ] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format(".3s")(text))
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Total Donation Amount")
			;
		}

	else if (radioRFM.F === true && radioFreq.numDonors === true)
		{
		// use different yScale...
		yScale	// FreqNumDonors
			.domain( [0, d3.max(data, d => d.numDonors) * 1.1] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis			// yAxisFreqNumDonors
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format(".2s")(text))
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Donors")
			;
		}

	else if (radioRFM.F === true && radioFreq.average === true)
		{
		yScale
			.domain( [0, (d3.max(data, (d) => d.avgDonation) * 1.1) ] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("$.2f")(text))
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.transition()
			.duration(5000)
			.text("Average Donation Amount")
			;
		} // end if ... else if ... else if

	else if (radioRFM.M === true && radioMoney.total === true)
		{
		// use original yScale... change domain & range:
		yScale
			.domain( [0, d3.max(data, d => d.totalDonated * 1.1) ])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("$.3s")(text))
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Total Donation Amount")
			;
		}

	else if (radioRFM.M === true && radioMoney.numDonors === true)
		{
		// use different yScale...
		yScale
			.domain( [0, d3.max(data, d => d.numDonors) * 1.1])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat(function(text) {
					return d3.format("")(text);
					})
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Donors")
			;
		}

	else if (radioRFM.M === true && radioMoney.avgPerDonor === true)
		{
		// use different yScale...
		yScaleFreqAvgDonation
			.domain( d3.extent(data, d => d.avgDonationPerDonor))
			.range([height, padding.top])
			;
		yScale
			.domain( d3.extent(d => d.avgDonationPerDonor))
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis			// yAxisFreqAvgDonation
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.transition()
			.duration(5000)
			.text("Average Donation Amount per Donor")
			;
		} // end if moneyAvgPerDonor

	else if (radioRFM.M === true && radioMoney.avgDonation === true)
		{
		// use different yScale...
		yScaleFreqAvgDonation
			.domain( d3.extent(data, d => d.avgDonatedPerDonation))
			.range([height, padding.top])
			;
		yScale
			.domain( d3.extent(d => d.avgDonatedPerDonation))
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis			// yAxisFreqAvgDonation
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.transition()
			.duration(5000)
			.text("Average Donation Amount per Donation")
			;
		} // end if radioRFM.M







	d3.select("#title")
		.attr("x", width / 2 + padding.left)
		;


	rects = d3.selectAll("rect");
	rects
		.data(data)
		;

	rects
		.exit()
		.remove()
		;

	rects = rects.merge(rects);

	rects
//		.merge(rects)
		.transition()
		.duration(1000)
		.delay( (d,i) => i * 100)
		.attr("fill", (d,index) => colourScale(d.score))
		.attr("x", d => xScale(d.score) + barPadding / 2)
		.attr("y", function( d) {
			if ( (radioRFM.F === true && radioFreq.total === true)
				|| (radioRFM.M === true && radioMoney.total === true) )
				{
				return yScale( d.totalDonated) + padding.top;
				}
			else if ( (radioRFM.F === true && radioFreq.numDonors === true)
					|| (radioRFM.M === true && radioMoney.numDonors === true) ) {
				return yScale(d.numDonors) + padding.top;
				}
			else if (radioRFM.F === true && radioFreq.average === true)
				{
				return yScale(d.avgDonation) + padding.top;
				}
			else if (radioRFM.M === true && radioMoney.avgPerDonor === true)
				{
				return yScale(d.avgDonatedPerDonor);
				}
			else if (radioRFM.M === true && radioMoney.avgDonation === true)
				{
				return yScale(d.avgDonatedPerDonation);
				}
			else if (radioRFM.M === true && radioMoney.total === true)
				{
				return yScale(d.totalDonated) + padding.top;
				}
			})
		.attr("width", barWidth - barPadding)
		.attr("height", function(d) {
			if ( (radioRFM.F === true && radioFreq.total === true)
					|| (radioRFM.M === true && radioMoney.total === true) ) {
				return height - yScale(d.totalDonated);
				}
			else if ( (radioRFM.F === true && radioFreq.numDonors === true)
					|| (radioRFM.M === true && radioMoney.numDonors === true) ) {
				return height - yScale(d.numDonors);
				}
			else if (radioRFM.F === true && radioFreq.average === true)
				{
				return height - yScale(d.avgDonation);
				}
			else if (radioRFM.M === true && radioMoney.avgPerDonor === true)
				{
				return height - yScale( d => d.avgDonationPerDonor);
				}
			})
		.attr("stroke", "black")


	setToolTip();
/*
	d3.selectAll("rect")
		.on("mousemove", tooltipShow)
		.on("touchstart", tooltipShow)
		.on("mouseout", tooltipHide)
		.on("touchend", tooltipHide)
		;
*/
/*
// TEMPORARY: test padding vs graph position: BREAKS SVG: rect - data:
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

	}








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

	let html = `<p>Score: ${data.score.toLocaleString()}</p>`
		+ (data.numDonors ?
				`<p>Number Donors: ${data.numDonors.toLocaleString()}</p>` : "")
		+ (data.numDonations ?
				`<p>Number Donations: ${data.numDonations.toLocaleString()}</p>` : "")
		+ (data.mostDonated ?
				`<p>Most Donated: $${data.mostDonated.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
		+ (data.avgDonation ?
				`<p>Average Donation: $${data.avgDonation.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
		+ (data.avgDonatedPerDonor ?
				`<p>Average Donation per Donor: `
			+ `$${data.avgDonatedPerDonor.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
		+ (data.totalDonated ?
				`<p>Total Donated: `
			+ `$${data.totalDonated.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
		;

	tooltip
		.style("opacity", 1)
		.style("top", `${d3.event.y - tooltip.node().offsetHeight / 2}px`)
		.style("left", `${d3.event.x + 12}px`)
		.style("z-index", 100)
		.html(html)
		;
	}



function tooltipHide() {
	d3.select("#tooltip")
		.style("opacity", 0)
		;
	}




function colourLegend() {
	// Create colourized legend for continents:
	let legend = "";
	data.map( r => {
		legend += `<div style="background:${colourScale(r.score)}" `
		+ `title="${r.score}">`
		+ `${r.score}</div>`;
		// console.log(`Colour Legend: ${r.score}`);
		});
	// console.log(`LEGEND: ${legend}`)
	d3.select("#colour-legend")
		.html(legend)
	;
	}
