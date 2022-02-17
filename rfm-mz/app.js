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
let xAxis;
// yScale(s) and yAxis(es / yAxes):
let yScale;
let yAxis;
// Green to red: green is better target:
let colourScale;

// When switching graphs, have data stored so no fetching:
let dataRecency;
let dataFreq;
let dataMoney;





// Initialize radio buttons:
// Frequency, Recency, Monetary:
let radioRFM = {
	R: false,
	F: false,
	M: false
	};
let radioRec = {
	total: false,
	numDonors: false,
	avgDaily: false,
	numDays: false,
	};
let radioFreq = {
	total: false,
	numDonors: false,
	average: false,
	numDonations: false,
	};
let radioMoney = {
	total: false,
	numDonors: false,
	numDonations: false,
	most: false,
	avgPerDonor: false,
	avgDonation: false,
	};

// updateRadioValues();

// This will update the radio object values from the HTML, or...
// Update the HTML if nothing had been set...
//
function updateRadioValues() {
	// Find which radio button is selected, R or F or M?:
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

	if (radioRFM.R) {
		//
		// Display sub-selections for Recency & hide others:
		d3.select("#optsRecency")
			.style("display", "flex")
			;
		d3.select("#optsFrequency")
			.style("display", "none")
			;
		d3.select("#optsMoney")
			.style("display", "none")
			;
//
let tmp = document.querySelector("#R");
tmp.parentNode.style.backgroundColor = "hsl(222, 90%, 75%)";
tmp = document.querySelector("#F");
tmp.parentNode.style.backgroundColor = "transparent";
tmp = document.querySelector("#M");
tmp.parentNode.style.backgroundColor = "transparent";
//
//
		// Update data set to Recency:
		data = dataRecency;
console.log("DATA SET CHANGED TO REC:\n", dataRecency);
		//
		// Find which Recency sub-select button is chosen:
		radioRec.total = d3.select("#recTotalDonated")
			.property("checked");
		radioRec.numDonors = d3.select("#recNumDonors")
			.property("checked");
		radioRec.avgDaily = d3.select("#recAvgDaily")
			.property("checked");
		radioRec.numDays = d3.select("#recNumDays")
			.property("checked");
		//
		// If no sub-select button chosen, default is ... ?
		if (radioRec.total === false
				&& radioRec.numDonors === false
				&& radioRec.numDays === false
				&& radioRec.avgDaily === false)
			{
			d3.select("#recAvgDaily")
				.property("checked", true)
				;
			// Ensure data structure reflects HTML:
			radioRec.avgDaily = d3.select("#recAvgDaily")
				.property("checked");
			}
		} // end if Recency

	if (radioRFM.F) {
		// Update data set to Frequency:
		data = dataFreq;
console.log("DATA SET CHANGED TO FREQ:\n", dataFreq);
//
let tmp = document.querySelector("#F");
tmp.parentNode.style.backgroundColor = "hsl(222, 90%, 75%)";
tmp = document.querySelector("#R");
tmp.parentNode.style.backgroundColor = "transparent";
tmp = document.querySelector("#M");
tmp.parentNode.style.backgroundColor = "transparent";
//
//
		//
		// Display sub-selections for Frequency & hide others:
		d3.select("#optsRecency")
			.style("display", "none")
			;
		d3.select("#optsFrequency")
			.style("display", "flex")
			;
		d3.select("#optsMoney")
			.style("display", "none")
			;
		//
		// Find which Frequency sub-select button is chosen:
		radioFreq.total = d3.select("#freqTotalDonated")
			.property("checked");
		radioFreq.numDonors = d3.select("#freqNumDonors")
			.property("checked");
		radioFreq.average = d3.select("#freqAvg")
			.property("checked");
		radioFreq.numDonations = d3.select("#freqNumDonations")
			.property("checked");
		//
		// If no sub-select button chosen, default is average donation:
		if (radioFreq.total === false
				&& radioFreq.numDonors === false
				&& radioFreq.average === false
				&& radioFreq.numDonations === false)
			{
			d3.select("#freqAvg")
				.property("checked", true)
				;
			// Ensure data structure reflects HTML:
			// radioFreq.total = d3.select("#freqTotalDonated")
			radioFreq.average = d3.select("#freqAvg")
				.property("checked");
			}
		} // end if Frequency

	else if (radioRFM.M) {
		//
		// Update data set to Monetary:
		data = dataMoney;
console.log("DATA SET CHANGED TO MONEY:\n", dataMoney);
//
let tmp = document.querySelector("#R");
tmp.parentNode.style.backgroundColor = "transparent";
tmp = document.querySelector("#F");
tmp.parentNode.style.backgroundColor = "transparent";
tmp = document.querySelector("#M");
tmp.parentNode.style.backgroundColor = "hsl(222, 90%, 75%)";
//
		//
		// Display sub-selections for Monetary & hide others:
		d3.select("#optsRecency")
			.style("display", "none")
			;
		d3.select("#optsFrequency")
			.style("display", "none")
			;
		d3.select("#optsMoney")
			.style("display", "flex")
			;
		//
		// Find which Monetary sub-select button is chosen:
		radioMoney.total = d3.select("#moneyTotalDonated")
			.property("checked");
		radioMoney.numDonors = d3.select("#moneyNumDonors")
			.property("checked");
		radioMoney.numDonations = d3.select("#moneyNumDonations")
			.property("checked");
// Disabled / commented out this, Axel doesn't want it:
//		radioMoney.most = d3.select("#moneyMost")
//			.property("checked");
		radioMoney.avgPerDonor = d3.select("#moneyAvgPerDonor")
			.property("checked");
		radioMoney.avgDonation = d3.select("#moneyAvgDonation")
			.property("checked");
		//
		// If no sub-select button chosen, default is average donation:
		if (radioMoney.total === false
				&& radioMoney.numDonors === false
				&& radioMoney.numDonations === false
				&& radioMoney.most === false
				&& radioMoney.avgPerDonor === false
				&& radioMoney.avgDonation === false) {
			d3.select("#moneyTotalDonated")
				.property("checked", true)
				;
			// Ensure data structure reflects HTML:
			radioMoney.total = d3.select("#moneyTotalDonated")
				.property("checked");
			} // end if
		} // end else if Monetary


	console.log("RADIOs \n",
		"radioRFM:", radioRFM, "\n",
		"radioRec", radioRec, "\n",
		"radioFreq", radioFreq, "\n",
		"radioMoney", radioMoney
		);
	}




d3.queue()
	// HOW does the formatting callback function fit within these calls?!

	.defer(d3.csv, "RecencyReport.csv")
	.defer(d3.csv, "FrequencyReport.csv")
	.defer(d3.csv, "MonetaryReport.csv")

	.await(function(error, recData, freqData, moneyData) {
		if (error) throw error;

			// Map over records, converting strings to numbers:
			data = dataRecency = recData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					// Date fields do not get converted to Number():
					if ( field !== "dateFirst" && field !== "dateLast") {
						record[field] = Number(record[field].replace(/,/g,""));
						}
					});
				return record;
				});

			// Map over records, converting strings to numbers:
			data = dataFreq = freqData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					record[field] = Number(record[field].replace(/,/g,""));
					});
				return record;
				});

			// Map over records, converting strings to numbers:
			data = dataMoney = moneyData.map( record => {
				// Stupid JS Number() chokes on commas in formatted numbers?!?
				Object.keys(record).forEach( field => {
					record[field] = Number(record[field].replace(/,/g,""));
					});
				return record;
				});


		console.log("d3.queue()\n",
			"dataRecency:", dataRecency, "\n",
			"dataFreq: ", dataFreq, "\n",
			"dataMoney:", dataMoney
			);

		// Choose the data set according to the radio buttons selected:
		updateRadioValues();
		// Now we have data, set the scales:
		createScales();
		// Create a basic, unpopulated graph (which then calls updateGraph())
		makeGraph();
		// Explanation of bar colours:
		colourLegend();
		}); // end d3.queue




function getPageWidth() {
	let divWidth = window.innerWidth;
	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	divWidth = Math.floor( divWidth / 100 - 2) * 100;
	return divWidth;
	}

function getPageHeight() {
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
	// Shave some space off height for radios & make an even number:
	tmpHeight = Math.floor(tmpHeight / 100 - 3) * 100;
	// If screen too small (i.e. mobile landscape): set minimum size:
	return tmpHeight < 400 ? 400 : tmpHeight;
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
			.text("MicroZip Data: RFM Analysis")
		;

	// Add a border around the graph (inside padding)
	// For checking alignments, etc.
	// NOTE: when very narrow window, xAxis is nowhere near right border!
	d3.select("svg")
		.append("g")
			.append("path")
				.attr("id", "padding-border")

	return svg
	}





// Can't create scales until data has been fetched, hence inside block:
function createScales() {

	xScale = d3.scaleLinear()
//		.domain( d3.extent(data, d => d.score).sort( (a,b) => b-a))
		// Reverse-sort, either max, min or extent.sort like above
		.domain([
			d3.max(data, d => d.score),
			d3.min(data, d => d.score)
			])
		// Move range setting to inside makeGraph() so responsive:
		.range([padding.left, width])
		// .clamp(true)
		;
	xAxis = d3.axisBottom(xScale)
		;

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


	// Some colourized bars, GREEN is gooder, RED is badder:
	// colourScale = d3.scaleOrdinal()
	colourScale = d3.scaleLinear()
		.domain( d3.extent( data, (d) => d.score ))
//		.range(d3.schemeCategory10)
		.range(["red", "green"])
		;

	} // end createScales







// Listeners on input fields:
d3.selectAll("input")
	.on("change", function() {
		console.log(`INPUT field changed...`);
		updateRadioValues();
		updateGraph();
		})
	;
//
// For responsive design, listen to page resizing:
window.addEventListener("resize", updateGraph );
//
//
// DisplayPixelRatio is > 1 on hiDPI (3.x on Pixel4a Firefox)
//	Wrote media query CSS to handle this
/*
d3.select("#pixel")
	.append("text")
	.text(`devicePixelRatio: ${window.devicePixelRatio}`)
	.style("font-size", "3em")
	;
*/
if (window.devicePixelRatio > 1)
	{
	padding.left = padding.left * 2;
	padding.bottom = padding.bottom * 2;
	}


// Initialize graph:
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
		;
	// Label yAxis
	svg
		.append("text")
			.attr("id", "yAxis-label")
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




// Responsive design - changes in size of window or radio buttons:
function updateGraph() {
	width = getPageWidth();
	height = getPageHeight();
	// Width of bars changes as screen width changes:
	barWidth = width / 10;
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
		// Centre axis ticks below centre of bars:
		.attr("transform",
			`translate(${barWidth / 2}, ${height + padding.top})`)
		.call(xAxis)
		;
	d3.select("#xAxis-label")
		// Place x axis label on bottom border, then...
		.attr("transform",
			`translate(${width / 2 + padding.left}, `
			+ `${height + padding.top + padding.bottom})`)
			// ...move UP from bottom SVG border slightly:
			.attr("dy", "-1em")
		;




	// Change yAxis DEPENDING ON RADIO BUTTONS selected:

	if (radioRFM.R === true && radioRec.total === true)
		{
		yScale
			.domain( [0, (d3.max(data, (d) => d.totalDonated) * 1.1) ] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("$.1s")(text))
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Total Donation Amount")
			;
		}

	if (radioRFM.R === true && radioRec.numDays === true)
		{
		yScale
			.domain( [0, d3.max(data, d => d.numDays) * 1.1]  )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format(".2s")(text))
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Days")
			;
		}

	else if (radioRFM.R === true && radioRec.numDonors === true)
		{
		yScale
			.domain( [0, (d3.max(data, d => d.numDonors) * 1.1) ] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("")(text))
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Donors")
			;
		}

	else if (radioRFM.R === true && radioRec.avgDaily === true)
		{
		yScale
			.domain( [0, (d3.max(data, (d) => d.avgDaily) * 1.1) ] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("$.2s")(text))
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Average Daily Amount")
			;
		}

	else if ( (radioRFM.F === true && radioFreq.total === true)
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
				.tickFormat( text => d3.format("$.2s")(text))
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
		yScale
			.domain( [0, d3.max(data, d => d.numDonors) * 1.1] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format(".2s")(text))
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Donors")
			;
		}

	else if ( (radioRFM.F === true && radioFreq.numDonations === true)
			|| (radioRFM.M === true && radioMoney.numDonations === true) )
		{
		// use different yScale...
		yScale
			.domain( [0, d3.max(data, d => d.numDonations) * 1.1] )
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format(".2s")(text))
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Donations")
			;
		}

	else if (radioRFM.F === true && radioFreq.average === true)
		{
		yScale
			.domain( [0, d3.max(data, d => d.avgNumDonations * 1.1) ])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("")(text))
//				.tickFormat( text => d3.format("$,.0f")(text))
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.transition()
			.duration(5000)
			.text("Average Number Donations")
			;
		} // end else if

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
		}	// end else if

	else if (radioRFM.M === true && radioMoney.numDonors === true)
		{
		// update yScale...
		yScale
			.domain( [0, d3.max(data, d => d.numDonors) * 1.1])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat(function(text) {
					return d3.format(".2s")(text);
					})
				)
			;
		d3.select("#yAxis-label")
			// .attr("x", -(height) / 2 - padding.top - padding.bottom)
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Number of Donors")
			;
		}	// end else if

	else if (radioRFM.M === true && radioMoney.most === true)
		{
		// use original yScale... change domain & range:
		yScale
			.domain( [0, d3.max(data, d => d.mostDonated * 1.1) ])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				.tickFormat( text => d3.format("$.2s")(text))
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.text("Most Donated (Amount?)")
			;
		}	// end else if

	else if (radioRFM.M === true && radioMoney.avgPerDonor === true)
		{
		// update yScale...
		yScale
			.domain([ 0, d3.max(data, d => d.avgDonatedPerDonor * 1.1) ])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.transition()
			.duration(5000)
			.text("Average Donation Amount per Donor")
			;
		} // end if moneyAvgPerDonor

	else if (radioRFM.M === true && radioMoney.avgDonation === true)
		{
		// update yScale...
		yScale
			.domain([ 0, d3.max( data, d => d.avgDonation * 1.1) ])
			.range([height, padding.top])
			;
		d3.select("#yAxis")
			.call(yAxis
				.tickSize(-width + padding.left - barWidth)
				.tickSizeOuter(0)
				)
			;
		d3.select("#yAxis-label")
			.attr("x", -(height) / 2 - padding.bottom)
			.transition()
			.duration(5000)
			.text("Average Donation Amount")
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
		.transition()
		.duration(1000)
		.delay( (d,i) => i * 100)
		.attr("fill", (d,index) => colourScale(d.score))
		.attr("x", d => xScale(d.score) + barPadding / 2)
		.attr("y", function( d) {

			if (radioRFM.R === true && radioRec.avgDaily === true)
				{
				return yScale(d.avgDaily) + padding.top;
				}

			else if (radioRFM.R === true && radioRec.numDays === true)
				{
				return yScale(d.numDays) + padding.top;
				}

			else if ( (radioRFM.R === true && radioRec.total === true)
				|| (radioRFM.F === true && radioFreq.total === true)
				|| (radioRFM.M === true && radioMoney.total === true) )
				{
				return yScale( d.totalDonated) + padding.top;
				}
			else if ( (radioRFM.R === true && radioRec.numDonors === true)
					|| (radioRFM.F === true && radioFreq.numDonors === true)
					|| (radioRFM.M === true && radioMoney.numDonors === true) )
				{
				return yScale(d.numDonors) + padding.top;
				}
			else if (radioRFM.F === true && radioFreq.average === true)
				{
				return yScale(d.avgNumDonations) + padding.top;
				}
			else if ( (radioRFM.F === true && radioFreq.numDonations === true)
					|| (radioRFM.M === true && radioMoney.numDonations === true) )
				{
				return yScale(d.numDonations) + padding.top;
				}
			else if (radioRFM.M === true && radioMoney.avgPerDonor === true)
				{
				return yScale(d.avgDonatedPerDonor) + padding.top;
				}
			else if (radioRFM.M === true && radioMoney.avgDonation === true)
				{
				return yScale(d.avgDonation) + padding.top;
				}
			else if (radioRFM.M === true && radioMoney.total === true)
				{
				return yScale(d.totalDonated) + padding.top;
				}
			else if (radioRFM.M === true && radioMoney.most === true)
				{
				return yScale(d.mostDonated) + padding.top;
				}
			})
		.attr("width", barWidth - barPadding)
		.attr("height", function(d) {
			if ( (radioRFM.R === true && radioRec.total === true)
					|| (radioRFM.F === true && radioFreq.total === true)
					|| (radioRFM.M === true && radioMoney.total === true) )
				{
				return height - yScale(d.totalDonated);
				}
			else if ( (radioRFM.R === true && radioRec.numDonors === true)
					|| (radioRFM.F === true && radioFreq.numDonors === true)
					|| (radioRFM.M === true && radioMoney.numDonors === true) )
				{
				return height - yScale(d.numDonors);
				}
			else if (radioRFM.R === true && radioRec.avgDaily === true)
				{
				return height - yScale(d.avgDaily);
				}
			else if (radioRFM.R === true && radioRec.numDays === true)
				{
				return height - yScale(d.numDays);
				}
			else if (radioRFM.F === true && radioFreq.average === true)
				{
				return height - yScale(d.avgNumDonations);
				}
			else if ( (radioRFM.F === true && radioFreq.numDonations === true)
					|| (radioRFM.M === true && radioMoney.numDonations === true) )
				{
				return height - yScale(d.numDonations);
				}
			else if (radioRFM.M === true && radioMoney.most === true)
				{
				return height - yScale( d.mostDonated);
				}
			else if (radioRFM.M === true && radioMoney.avgPerDonor === true)
				{
				return height - yScale( d.avgDonatedPerDonor);
				}
			else if (radioRFM.M === true && radioMoney.avgDonation === true)
				{
				return height - yScale( d.avgDonation);
				}
			})
		.attr("stroke", "black")


	setToolTip();

	paddingBox();
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


function paddingBox()
	{
	// For testing proportions, draw line around padding
	// Note: a rect will prevent SVG from working since it'll have no data
	d3.select("#padding-border")
//		.append("g")
//			.attr("id", "padding-border")
//			.append("path")
			.attr("stroke", "green")
			.attr("fill", "transparent")
			.attr("d", `M ${padding.left},${padding.top} h ${width} `
				+ `v ${height} `
				+ `h ${-width} `
				+ `v ${-height}`
				)
		;
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




function tooltipShow(data) {

// console.log("DATA:", data);

	let tooltip = d3.select("#tooltip");

	let html = `<p>Score: ${data.score.toLocaleString()}</p>`
		+ (data.numDonors ?
				`<p>Number Donors: ${data.numDonors.toLocaleString()}</p>` : "")
		+ (data.numDonations ?
				`<p>Number Donations: ${data.numDonations.toLocaleString()}</p>` : "")
		+ (data.numDays ?
				`<p>Number Days: ${data.numDays.toLocaleString()}</p>` : "")
		+ (data.mostDonated ?
				`<p>Most Donated: $${data.mostDonated.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
		+ (data.avgDonation ?
				`<p>Average Donation: $${data.avgDonation.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
		+ (data.avgNumDonations ?
				`<p>Average Number of Donations: ${data.avgNumDonations.toLocaleString(undefined, {minimumFractionDigits: 2} )}</p>` : "")
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
