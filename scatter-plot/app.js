
console.log("\n\n",
"--------------------------------------\n",
"© ron@ronaldbarnes.ca 2022\n",
"--------------------------------------\n",
"\n\n"
);



let padding = 100;

let {width, height} = getSize();

// Keys are years, values are emissions, indicator (co2, etc.) and region:
let yearObj = {};

let minYear;
let maxYear;
let yearRange;
//
// Initialize the chart to a median value, looks nicer:
let startYear;


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
//		maxYear = 2013;
console.log(`MAX YEAR: ${maxYear}`);
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




	// Colour scale:
	let fScale = d3.scaleLinear()
		.domain( [0,100] )
		.range( ["black", "green"] )
		;


// Append a new SVG:
d3.select("#graph")
	.append("svg")
		.attr("width", width + 2 * padding)
		.attr("height", height + 2 * padding)
		.style("outline", "1px solid red")
	;

let svg = d3.select("svg");

// xAxis:
svg
	.append("g")
	.attr("id", "x-axis")
	.attr("transform", `translate(0, ${height + padding})`)
	.classed("x-axis", true)
	;

// yAxis:
svg
	.append("g")
	.attr("id", "y-axis")
	.classed("y-axis", true)
	.attr("transform", `translate(${padding}, 0)`)
	;

// xAxis label:
svg
	.append("text")
	.attr("x", width / 2 + padding)
	.attr("y", height + 2 * padding)
	.attr("dy", "-1em")
	.attr("text-anchor", "middle")
	.classed("axis-label", true)
	.text("co2 emissions (kt per person)")
	;

// yAxis label:
svg
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("x", -height / 2 - padding)
	.attr("y", "1.50em")
	.attr("text-anchor", "middle")
	.classed("axis-label", true)
	.text("Methane emissions (kt co2 equivalent per person)")
	;

// Add a graph title:
svg.append("text")
	.attr("x", width / 2 + padding)
	.attr("y", padding)
	.attr("dy", -padding / 2)
	.attr("text-anchor", "middle")
	.attr("id", "title")
	.classed("title", true)
	.text("Emissions per capita")
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




function makeGraph(year) {
	// console.log(`makeGraph() year=${year}`);

	setYearLabel(year);

	let data = yearObj[year];



	let xScale = d3.scaleLinear()
		.domain( d3.extent(data, d => d.co2 / d.population) )
		.range( [padding * 1.5 , width + padding])
		.clamp(true)
		;

// console.log(`ySCALE EXTENT: ${d3.extent( data, d => d.methane / d.population)}`);
	let yScale = d3.scaleLinear()
		.domain( d3.extent(data, d => d.methane / d.population) )
		.range( [height + padding / 2, padding])
		.clamp(true)
		;

	// Radius scale:
	let rScale = d3.scaleLinear()
		.domain( [0,1] )
		.range( [5,30] )
		.clamp(true)
		;

	d3.select("#x-axis")
		.call(d3.axisBottom(xScale))
		;

	d3.select("#y-axis")
		.call(d3.axisLeft(yScale))
		;

	d3.select("#title")
		.text(`Methane vs co2 Emissions per Capita for ${year}`)
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
			.delay( (d,i) => i * 10)
				.attr("r", d => rScale(d.urban / d.population) )
			.attr("stroke", "red")
			.attr("stroke-width", 1)
			;

	update
		.merge(update)
			.transition()
			.duration(500)
			.delay( (d,i) => i * 10)
			.attr("cx", d => xScale(d.co2 / d.population) )
			.attr("cy", d => yScale(d.methane / d.population) )
			.attr("fill", d => fScale(d.renewable) )
			.attr("r", d => rScale(d.urban / d.population) )
		;

	}









// Set handler for tooltips:
function setToolTip() {
	d3.selectAll("path")
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
			+ `<li>Methane per capita: ${(d.methane / d.population).toFixed(4)}</li>`
			+ `<li>co2 per capita: ${(d.co2 / d.population).toFixed(4)}</li>`
			+ ` <li>Renewable energy: ${renewable}</li> `
			+ `<li>Urban population: ${(d.urban / d.population * 100).toFixed(2)}%</li>`
			)
		;
	}



function tooltipHide() {
	d3.select("#tooltip")
		.style("opacity", 0)
		;
	}




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


function getPageWidth() {
	let divWidth = window.innerWidth;
	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	divWidth = Math.floor( divWidth / 100 ) * 100 - 2 * padding;
	return divWidth;
	}

function getPageHeight() {
	// GREAT example on stackoverflow:
	// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-cur>
	let tmpHeight = window.innerHeight
	|| document.documentElement.clientHeight
	|| window.screen.availHeight
	|| document.body.clientHeight
	;
	// Shave some space off height for radios & make an even number:
	tmpHeight = Math.floor(tmpHeight / 100 - 4) * 100;
	// If screen too small (i.e. mobile landscape): set minimum size:
	return tmpHeight < 400 ? 400 : tmpHeight;
	}
