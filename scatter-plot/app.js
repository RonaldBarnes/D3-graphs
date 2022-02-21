
console.log("\n\n",
"--------------------------------------\n",
"© ron@ronaldbarnes.ca 2022\n",
"--------------------------------------\n",
"\n\n"
);



let padding = {
	top: 50,
	right: 50,
	left: 100,
	bottom: 100,
	};

let {width, height} = getSize();

// Keys are years, values are emissions, indicator (co2, etc.) and region:
let yearObj = {};

let minYear;
let maxYear;
let yearRange;
//
// Initialize the chart to a median value, looks nicer:
let startYear;





// Scales for x,y, circle (r)adius, and (f)ill colour:
let xScale = d3.scaleLinear();
let yScale = d3.scaleLinear();
// Radius scale:
let rScale = d3.scaleLinear()
	.domain( [0,1] )
	.range( [5,30] )
	.clamp(true)
	;
// Colour scale:
let fScale = d3.scaleLinear()
	.domain( [0,100] )
	.range( ["black", "green"] )
	;

let xAxis = d3.axisBottom(xScale);
let yAxis = d3.axisLeft(yScale);




// ---------------------------------------------------------------------------
d3.queue()
	.defer(d3.csv,
		"./data/co2/API_EN.ATM.CO2E.KT_DS2_en_csv_v2.csv",
		formatter)
	.defer(d3.csv,
		"./data/methane/API_EN.ATM.METH.KT.CE_DS2_en_csv_v2.csv",
		formatter)
	.defer(d3.csv,
		"./data/renewable/API_EG.FEC.RNEW.ZS_DS2_en_csv_v2.csv",
		formatter)
	.defer(d3.csv,
		"./data/population/API_SP.POP.TOTL_DS2_en_csv_v2.csv",
		formatter)
	.defer(d3.csv,
		"./data/urban_population/API_SP.URB.TOTL_DS2_en_csv_v2.csv",
		formatter)

	// Using awaitAll means "data" will be an array, one element for each CSV:
	.awaitAll( function(error, data) {
		if (error ) throw error;

		// console.log("CO2 DATA:", data[0]);


		yearObj = formatAllData(data);
		// console.log("yearObj:\n", yearObj);

		minYear = Number(d3.min(Object.keys(yearObj)));
		maxYear = Number(d3.max(Object.keys(yearObj)));
		// console.log(`MAX YEAR: ${maxYear}`);
		yearRange = [minYear, maxYear];
		//
		// Initialize the chart to a median value, looks nicer:
		startYear = Math.floor(minYear + (maxYear - minYear) / 2);

		// Add dates to range-slider:
		// Never mind, it's done inside makeGraph() now:
		// setYearLabel(startYear);


		// Initialize graph:
		makeGraph(startYear);
		})	// end awaitAll
	;





// ----------------------------------------------------------------------------
// Remove regional, etc. data not directly tied to a country:
function formatter(row)
	{
	let invalidRows = [
		"Arab World",
		"Central Europe and the Baltics",
		"Caribbean small states",
		"East Asia & Pacific (excluding high income)",
		"Early-demographic dividend",
		"East Asia & Pacific",
		"Europe & Central Asia (excluding high income)",
		"Europe & Central Asia",
		"Euro area",
		"European Union",
		"Fragile and conflict affected situations",
		"High income",
		"Heavily indebted poor countries (HIPC)",
		"IBRD only",
		"IDA & IBRD total",
		"IDA total",
		"IDA blend",
		"IDA only",
		"Not classified",
		"Latin America & Caribbean (excluding high income)",
		"Latin America & Caribbean",
		"Least developed countries: UN classification",
		"Low income",
		"Lower middle income",
		"Low & middle income",
		"Late-demographic dividend",
		"Middle East & North Africa",
		"Middle income",
		"Middle East & North Africa (excluding high income)",
		"North America",
		"OECD members",
		"Other small states",
		"Pre-demographic dividend",
		"Pacific island small states",
		"Post-demographic dividend",
		"Sub-Saharan Africa (excluding high income)",
		"Sub-Saharan Africa",
		"Small states",
		"East Asia & Pacific (IDA & IBRD countries)",
		"Europe & Central Asia (IDA & IBRD countries)",
		"Latin America & the Caribbean (IDA & IBRD countries)",
		"Middle East & North Africa (IDA & IBRD countries)",
		"South Asia (IDA & IBRD)",
		"Sub-Saharan Africa (IDA & IBRD countries)",
		"Upper middle income",
		"World",
		// Ron's additions for more-recent data:
		// These contain only methane data and are ONLY regions in years
		// 1970-1989
		"Africa Eastern and Southern",
		"Africa Western and Central",
		"North Macedonia",
		"Korea, Dem. People's Rep.",
		"Eswatini",
		];
	let obj = {
		region: row["Country Name"],
		indicator: row["Indicator Name"]
		}
	// Remove invalid data / rows by returning null:
	if (invalidRows.indexOf(obj.region) > -1) return null;


	// rows are CSV records: many years, country/region name & code,
	// plus indicator name & code:
	for (let key in row)
		{
		// Get numeric keys, i.e. year data:
		if (parseInt(key))
			{
			// Add years as keys to object:
			obj[key] = Number(row[key]) || null;
			}
		}
	// Return only the years, PLUS "Country Name" and "Indicator Name" as
	// set when initializing obj:
	return obj;
	}




// ----------------------------------------------------------------------------
// COME ON, Matt - the explanation on this was TERRIBLE!
// also, mentioning "you can use d3.nest" for 500ms isn't helpful
//
// This takes a FILE's worth of data as an array of arrays
function formatAllData(data)
	{
	// console.log("DATA:\n", data);

	data.forEach( function(arr) {
		// Get indicator and format key: (co2 / methane / ...)
		let indicator =
			arr[0]
				.indicator
				.split(" ")[0]
				.replace(",","")
				.toLowerCase()
			;
		arr.forEach( function(obj) {
			// Get current region:
			let region = obj.region;
			for (let year in obj) {
				if (parseInt(year)) {
					// Add new years that haven't appeared yet:
					if (!yearObj[year]) yearObj[year] = [];
					let yearArr = yearObj[year];
					let regionObj = yearArr.find(el => el.region === region);
					// Add new stat if region exists:
					if (regionObj) regionObj[indicator] = obj[year];
					else {
						// Encountered region for first time in given year:
						let newObj = {region: region};
// if (obj[year] !== null)
{
						newObj[indicator] = obj[year];
						yearArr.push(newObj);
}
						}
					}
				}
			})
		});
	// Remove years that don't have complete data sets for any region:
	for (let year in yearObj) {
		yearObj[year] = yearObj[year].filter( d => validRegion(year,d));

		if (yearObj[year].length === 0) delete yearObj[year];
		}
	return yearObj;
	}


// ----------------------------------------------------------------------------
// This deletes null values, which is good, BUT: it ignores missing keys!
// An "if" has been added to fix that.
function validRegion(year, d) {
	// Remove records missing crucial keys:
	// If renewable key is missing, okay: fScale(null) === black
	if (Object.keys(d).indexOf("methane") === -1
		|| Object.keys(d).indexOf("co2") === -1)
		{
		// console.log(`validRegion() DELETE missing data key for ${year}:`, d);
		return false;
		}
	for (let key in d) {
		// Allow renewable === null:
		// if (d[key] === null)
		if (d[key] === null && key !== "renewable")
			{
			// console.log(`validRegion() DELETE null data for ${year}:`, d);
			return false;
			}
		}
	return true;
	}




// ----------------------------------------------------------------------------
// Append a new SVG:
d3.select("#graph")
	.append("svg")
		.style("outline", "1px solid red")
	;

let svg = d3.select("svg");

// xAxis:
svg
	.append("g")
	.attr("id", "x-axis")
	.attr("transform", `translate(0, ${height + padding.top})`)
	.classed("x-axis", true)
	.call(xAxis)
	;
// xAxis label:
svg
	.append("text")
	.attr("text-anchor", "middle")
	.classed("axis-label", true)
	.attr("id", "x-axis-label")
	.text("co2 emissions (kt per person)")
	;


// yAxis:
svg
	.append("g")
	.attr("id", "y-axis")
	.classed("y-axis", true)
	;
// yAxis label:
svg
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("text-anchor", "middle")
	.classed("axis-label", true)
	.attr("id", "y-axis-label")
	.text("Methane emissions (kt co2 equivalent per person)")
	;

// Add a graph title:
svg.append("text")
	.attr("text-anchor", "middle")
	.attr("id", "title")
	.classed("title", true)
	// .text("Emissions per capita")
	;




// Append legend for circle colour:
d3.select("#colour-legend")
//	.append("html")
	.html(function() {
		let legend = "";
		for (let c = 0; c <= 100; c += 10) {
			legend += `<div style="background: ${fScale(c)};">${c}%</div>`;
			}
		// console.log("LEGEND:\n", legend);
		return legend;
		})
	;



// Add a border around the graph (inside padding)
// For checking alignments, etc.
// NOTE: when very narrow window, xAxis is nowhere near right border!
d3.select("svg")
	.append("g")
	.append("path")
	.attr("id", "padding-border")
	;




// ----------------------------------------------------------------------------
function makeGraph(year) {
	// console.log(`makeGraph() year=`, year);

	if (!parseInt(year))
		{
		year = d3.select(".range").property("value");
		console.log(`makeGraph() year=${year} from range.value`);
		}
	console.log(`makeGraph() year=${year}`);

	setYearLabel(year);

	let data = yearObj[year];

	let {width, height} = getSize();
	console.log(`makeGraph() WIDTHxHEIGHT: ${width}x${height}`);
	d3.select("svg")
		// ADD padding to SVG's dimensions: makes scaling so much easier
		// for calculations of axes' positions, etc.
		.attr("width", width + padding.left + padding.right)
		.attr("height", height + padding.top + padding.bottom)
		;




	xScale
		.domain( d3.extent(data, d => d.co2 / d.population) )
		// Keep circles from overlaying axes by bumping padding:
		.range( [padding.left * 1.25, width + padding.left] )
		.clamp(true)
		;

	yScale
		// .domain( d3.extent(data, d => d.methane / d.population) )
		.domain( [0, d3.max(data, d => d.methane / d.population) ])
		// Keep circles from overlaying axes by bumping padding:
		// [BOTTOM,TOP] are the coordinates - STOP FORGETTING THIS
		.range( [height + padding.top, padding.top * 1.5] )
		.clamp(true)
		;




	d3.select("#x-axis")
		.attr("transform",
			`translate(0, ${height + padding.top + padding.bottom / 4})`)
		.call(xAxis
			.tickSize(-height)
			.tickSizeOuter(0)
			// .tickSizeInner(0)
			)
		;
	d3.select("#x-axis-label")
	.attr("x", width / 2 + padding.left)
	.attr("y", height + padding.top + padding.bottom)
	.attr("dy", "-1em")
		;

	d3.select("#y-axis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis
			.tickSize(-width)
			.tickSizeOuter(0)
			)
		;
	d3.select("#y-axis-label")
		.attr("x", -height / 2 - padding.top)
		.attr("y", "1.50em")
		;

	d3.select("#title")
		.attr("x", width / 2 + padding.left)
		.attr("y", 0)	//padding.top / 2)
		.attr("dy", "1.5rem")
		// .text(`Methane vs co2 Emissions per Capita for ${year}`)
		.text(`GHG Emissions for ${year}`)
		;



	let update = d3.selectAll("circle")
		.data(data, d => d.region)
		;

	update
		.exit()
			// Shrink to nothing, then remove:
			.transition()
			.duration(500)
			.attr("r", 0)
		.remove()
		;

	// WHY the hell do I have to re-select circles and cannot re-use "update"
	// Matt does it, I've done it in other graphs...
	//	d3.select("svg").selectAll("circle").data(data, d => d.region)
	update = d3.select("svg")
		.selectAll("circle")
		.data(data, d => d.region)
		;

	update
		.enter()
		.append("circle")
				.on("mousemove touchstart", tooltipShow)
				.on("mouseout touchend", tooltipHide)
			.attr("cx", d => xScale(d.co2 / d.population) )
			.attr("cy", d => yScale(d.methane / d.population) )
			.attr("fill", d => fScale(d.renewable) )
			.transition()
			.duration(500)
			.ease(d3.easeCircle)
			.delay( (d,i) => i * 10)
				.attr("r", d => rScale(d.urban / d.population) )
			.attr("stroke", "red")
			.attr("stroke-width", 1)
			;

	update
		.merge(update)
			.transition()
			.duration(1000)
			.delay( (d,i) => i * 10)
			.ease(d3.easeCubic)
			.attr("cx", d => xScale(d.co2 / d.population) )
			.attr("cy", d => yScale(d.methane / d.population) )
			.attr("fill", d => fScale(d.renewable) )
			.attr("r", d => rScale(d.urban / d.population) )
		;

	// Green box boundary at padding during design:
	// paddingBox();
	}









// ----------------------------------------------------------------------------
// Set handler for tooltips:
function setToolTip() {
	d3.selectAll("path")
		.on("mousemove", tooltipShow)
		.on("touchstart", tooltipShow)
		.on("mouseout", tooltipHide)
		.on("touchend", tooltipHide)
	}









// ----------------------------------------------------------------------------
// Add Tooltip div:
d3.select("body")
	.append("div")
		.attr("id", "tooltip")
		.classed("tooltip", true)
	;



// ----------------------------------------------------------------------------
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

	// (re)-add event listener:
	// Assign default values to our input / range slider:
	d3.select("input")
		.property("min", minYear)
		.property("max", maxYear)
		.property("value", year)
		.on("input", function() {
			makeGraph( Number(d3.event.target.value));
			})
		;
	}






// ----------------------------------------------------------------------------
//
// For responsive design, listen to page resizing:
window.addEventListener("resize",
	makeGraph
//	makeGraph(d3.select(".range").property("value"))
	);
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
let dpr = window.devicePixelRatio;
if (dpr > 1)
	{
	// padding = padding * 2;
	paddint.top = padding.top * 2;
	padding.left = padding.left * 2;
	padding.bottom = padding.bottom * 2;
	}
/*
	d3.select("#devicePixelRatio")
		.append("text")
		// fucking mobile is broken, both Firefox & Chrome, and whatever Android
		// "default" thing:
		// cannot compose an output string, just shows "devicePixelRation"
		// no colon, no equals sign, no dPR value...
		// Also, trying to get styles to take effect can be hit & miss.
		// Too much time wasted on Responsive Design nonsense:
		// axes & labels SOMETIMES overlay each other, and tweaking padding is
		// meant to fix it, but suddenly... not a damned thing updates as it should
		.text(`devicePixelRatio (dpr) = ${dpr}`)
		.classed("devicePixelRatio", true)
		;
*/




// ----------------------------------------------------------------------------
// To assist alignment, put a box around the padding boundary:
function paddingBox()
	{
	// For testing proportions, draw line around padding
	// Note: a rect will prevent SVG from working since it'll have no data
	d3.select("#padding-border")
	//	.append("g")
	//	.append("path")
	//	.attr("id", "padding-border")
		.attr("stroke", "green")
		.attr("stroke-dasharray", "9,3")
		.attr("fill", "transparent")
		.style("opacity", 0.5)
		.attr("d", `M ${padding.left},${padding.top} h ${width} `
			+ `v ${height} `
			+ `h ${-width} `
			+ `v ${-height}`
			)
			;
	}






// ----------------------------------------------------------------------------
function tooltipShow(d) {
// console.log("DATA:", d);
// console.log("tooltipShow() Y=", d3.event.y, "pageY=", d3.event.pageY);

	let tooltip = d3.select("#tooltip");

	// Renewable energy data can be null, but that barfs errors to console, so...
	let renewable = (d.renewable === null
		? "unknown"
		: d3.format(".0%")(d.renewable / 100)
		);

	tooltip
		.style("opacity", 1)
		// d3.event.y vs d3.event.pageY are different on Firefox & Chromium:
		// tooltipShow() Y= 351 pageY= 443
		// .style("top", `${d3.event.pageY - tooltip.node().offSetHeight / 2}px`)
		.style("top", `${d3.event.pageY - tooltip.node().offsetHeight / 2}px`)
		.style("left", `${d3.event.x + 12}px`)
		.style("z-index", 100)
		.html(`<ul><li>Country: ${d.region}</li> `
			+ `<li>co2 per capita: ${(d.co2 / d.population).toFixed(4)}</li> `
			+ `<li>Methane per capita: ${(d.methane / d.population).toFixed(4)}</li>`
			+ ` <li>Renewable energy: ${renewable}</li> `
			+ `<li>Urban population: ${(d.urban / d.population * 100).toFixed(2)}%</li>`
			)
		;
	}



// ----------------------------------------------------------------------------
function tooltipHide() {
	d3.select("#tooltip")
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
		(tmpHeight - padding.top - padding.bottom) / 100 - 2)
		* 100
		;
	// If screen too small (i.e. mobile landscape): set minimum size:
console.log(`getPageHeight() HEIGHT: ${tmpHeight}`);
	return tmpHeight < 400 ? 400 : tmpHeight;
	}
