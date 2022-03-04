
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

let {width, height} = getSize();

let countryData;
let geoDataAll;

d3.select("#graph")
	.append("svg")
	.attr("id", "map")
	.attr("width", width)
	.attr("height", height)
	.style("background", "royalblue")
	;


d3.queue()
	.defer(d3.json, '//unpkg.com/world-atlas@1.1.4/world/50m.json')
	// This uses the formatter callback, which I'd been looking for how to use:
	.defer(d3.csv, './country_data.csv', function(row) {
		return {
			country: row.country,
			countryCode: row.countryCode,
			population: +row.population,
			medianAge: +row.medianAge,
			fertilityRate: +row.fertilityRate,
			populationDensity: +row.population / +row.landArea
		}	// end return object
	})	// end .defer #2 formatter function
	.await(function(error, mapData, populationData) {
		if (error) throw error;


		// Convert topojson to geojson:
		var geoData = topojson.feature(mapData, mapData.objects.countries).features;

		// Append population data from country_data.csv into geoData:
		populationData.forEach(row => {
			var countries = geoData.filter(d => d.id === row.countryCode);
			// Countries is a reference to a geoData object, hence appends data:
			countries.forEach(country => country.properties = row);
			});	// end forEach (outer)


		// Pass pop data to global-ish var for access in external functions,
		// i.e. setColour():
		countryData = populationData;
		geoDataAll = geoData;

		let projection = d3.geoMercator()
											 .scale(125)
											 .translate([width / 2, height / 1.4]);
//											 .translate([width / 2, height / 2]);

		var path = d3.geoPath()
								 .projection(projection);

		d3.select("svg")
			.selectAll(".country")
			.data(geoDataAll)
			.enter()
				.append("path")
				.on("mousemove touchstart", tooltipShow)
				.on("mouseout touchend", tooltipHide)
				.classed("country", true)
				.attr("d", path)
				.attr("id", d => `cc${d.properties.countryCode}`)
			;


//	changeProjection("mercator");

		// Input / select event listeners:
		var select = d3.select("#population");
		select
			.on("change", d => setColour(d3.event.target.value));
		setColour(select.property("value"));


		// Set default & show selection for projections:
		d3.select("#projection")
			// Set default projection:
			.property("value", "mercator")
			.style("display", "block")
//			.on("change", d => changeProjection(d3.event.target.value))
			.on("change", changeProjection)
			;
		d3.select("#scale")
			.property("value", 125)
			.on("change", changeProjection)
			;
		d3.select("#parallels")
			.on("change", changeProjection)
			;
		d3.select("#hrot")
			// Set to view North America (or not...):
			.property("value", 0)
			.on("change", changeProjection)
			;
		d3.select("#vrot")
			// Set to equator:
			.property("value", 0)
			.on("change", changeProjection)
			;
		// Hide sub-options for Parallels: only used by few projections:
		d3.select(".parallels")
			.style("display", "none")
			;
	});









// ----------------------------------------------------------------------------
// function changeProjection(proj = "mercator")
function changeProjection(proj = d3.select("#projection").property("value") )
	{
	console.log(`changeProjection() -> ${proj}`);

	let {width, height} = getSize();

	d3.select("svg")
		.attr("width", width)
		.attr("height", height)
		;

	let scale = d3.select("#scale").property("value");
	// console.log(`changeProjection() scale=${scale}`);

	let rotation = [
		+d3.select("#hrot").property("value"),
		+d3.select("#vrot").property("value")
		];
	// console.log("changeProjection() rotation: ", rotation);

	let parallels;
	let albersRotationX;
	let albersTranslation = [width / 2, height / 2];

	if (proj === "albers" || proj === "conicConformal")
		{
		let par = Number(d3.select("#parallels").property("value") );
		switch (par) {
			case 55:
				parallels = [50,60];
				break;
			case 45: parallels = [40,50]; break;
			case 35: parallels = [30,40]; break;
			case 25: parallels = [20,30]; break;
			case 15: parallels = [10,20]; break;
			case 5: parallels = [0,10]; break;
			default: parallels = [-10,10]; break;
			}
		// NICE trick for keeping map at same bottom-most location as it
		// wraps - otherwise moves upward with wrapping to collide with title:
		// DEPENDS on scaling factor too...
		albersTranslation[1] = height / 2 + padding.top + parallels[1];
		// albersTranslation = [width / 2, height / 2 + padding.top * 2];
		}	// end if


	if (proj === "albers" || proj === "conicConformal")
		{
		// Hide sub-options for Parallels: only used by few projections:
		d3.select(".parallels")
			.style("display", "block")
			;
		}
	else
		{
		// Hide sub-options for Albers, etc. projections:
		d3.select(".parallels")
			.style("display", "none")
			;
		} // end else


	let projection;
	switch (proj) {
		case "albers":
			projection = d3.geoAlbers()
				.scale(scale)
				.parallels(parallels)
//				.parallels([0,63.5])
				.rotate(rotation)
				.translate(albersTranslation)
				;
			break;
		case "azimuthEqualArea":
			projection = d3.geoAzimuthalEqualArea()
				// .rotate([90,0])
				.rotate(rotation)
				.scale(scale)
//				.scale(150)
				.translate([width / 2, height / 2])
				;
			break;
		case "azimuthEqualDistant":
			projection = d3.geoAzimuthalEquidistant()
				.rotate(rotation)
//				.scale(125)
				.scale(scale)
				.translate([width / 2, height / 2])
				;
			break;
		case "conicConformal":
			projection = d3.geoConicConformal()
				.parallels([40,50])
				.rotate(rotation)
//				.scale(150)
				.scale(scale)
				// .clipExtent([0,0], [width,height])
				.translate([width / 2, height / 1.5])
				.parallels(parallels)
				;
			break;
		case "equiRectangular":
			projection = d3.geoEquirectangular()
				.rotate(rotation)
				.scale(scale)
				.translate([width / 2, height / 2])
				;
			break;
		case "gnomonic":
			projection = d3.geoGnomonic()
				.rotate(rotation)
				.scale(scale)
				// .clipExtent([0,0], [width,height])
				.clipAngle(90)	//- 1e-4)
				// precision(0.3)
				.translate([width / 2, height / 2])
				;
			break;
		case "mercator":
			projection = d3.geoMercator()
				.scale(scale)
				.translate([width / 2, height / 1.5])
				.rotate(rotation)
				;
			break;
		case "naturalEarth":
			projection = d3.geoNaturalEarth1()
				.scale(scale)
				.translate([width / 2, height / 2])
				.rotate(rotation)
				;
			break;
		case "orthographic":
			projection = d3.geoOrthographic()
				.scale(scale)
				.translate([width / 2, height / 2])
				.rotate(rotation)
				;
			break;
			default:
			projection = d3.geoMercator()
				.scale(scale)
				.translate([width / 2, height / 1.5])
				.rotate(rotation)
				;
			break;
		};

		let path = d3.geoPath()
								 .projection(projection);

		d3.select("svg")
			.selectAll(".country")
				.on("mousemove touchstart", tooltipShow)
				.on("mouseout touchend", tooltipHide)
			.data(geoDataAll)
			.exit()
				.transition()
				.style("opacity", 0)
				.remove()
			;
		d3.select("svg")
			.selectAll("path")
				.attr("d", path)
				.attr("id", d => `cc${d.properties.countryCode}`)
			;
	}





// ----------------------------------------------------------------------------
function setColour(val) {

	var colorRanges = {
		population: ["antiquewhite", "purple"],
		populationDensity: ["cornsilk", "red"],
		medianAge: ["white", "black"],
		fertilityRate: ["black", "orange"]
	};


	var scaleColour = d3.scaleLinear()
		.domain([0, d3.max(countryData, d => d[val])])
		.range(colorRanges[val])
		;
	// Legend needs contrasting font since "colorRanges" uses black.
	// Invert the range on the scaleColour above...
	let legendFontColour = d3.scaleLinear()
		.domain([0, d3.max(countryData, d => d[val])])
		// ...by switching range array elements:
		.range([ colorRanges[val][1], colorRanges[val][0] ])
		;


	d3.selectAll(".country")
		.transition()
		.duration(750)
		.ease(d3.easeBackIn)
		.attr("fill", d => {
			var data = d.properties[val];
			return data ? scaleColour(data) : "#111";	// "#ccc";
		});

	let legend = "";
	// Fertility rate of 0.763 shows 763m if using ".2s", fix this confusion:
	let numFormat = val === "fertilityRate" ? ".2f" : ".2s";
/*
	let fontColour = val === "populationDensity" ?
			"black" :
			legendFontColour(i)
			;
*/
	for (let i = 0; i < scaleColour.domain()[1]; i += scaleColour.domain()[1]/10)
		{
		legend += `<div style="background: ${scaleColour(i)}; `
			+ `color: ${legendFontColour(i)};">`
			+ `${d3.format(numFormat)(i)}</div>`;
		}
	// console.log(`LEGEND: ${legend}`);

	d3.select("#colour-legend")
		.html(legend)
		.transition()
		.duration(750)
		;
	}	// end setColour





//
// For responsive design, listen to page resizing:
window.addEventListener("resize", changeProjection);




// ----------------------------------------------------------------------------
// Add Tooltip div:
d3.select("body")
	.append("div")
	.attr("id", "tooltip")
	.classed("tooltip", true)
	;





// ----------------------------------------------------------------------------
function tooltipShow(d) {
	// console.log("DATA:", d.properties);
	// console.log("DATA:", d);
	// console.log("tooltipShow() Y=", d3.event.y, "pageY=", d3.event.pageY);

	let tooltip = d3.select("#tooltip");

	let
		{
		country, fertilityRate, medianAge, population, populationDensity
		} = d.properties;

d3.select(`#cc${d.properties.countryCode}`)
	.style("stroke", "black")
	.style("stroke-width", "2px")
	;

	let html;
	if (Object.keys(d.properties).length === 0)
		{
		html = "<p>UNKNOWN COUNTRY</p>";
		}
	else
		{
		html = `<ul><li>Country: ${country}</li> `
			+ `<li>Population: ${population.toLocaleString()}</li> `
			+ `<li>Population Density: `
				+ `${populationDensity.toLocaleString(undefined, {maximumFractionDigits: 2})}</li>`
			+ ` <li>Median Age: ${medianAge}</li> `
			+ `<li>Fertility Rate: `
				+ `${fertilityRate.toLocaleString(undefined, {maximumFractionDigits: 2})}</li>`
			+ "</ul>"
		}

	tooltip
	// d3.event.y vs d3.event.pageY are different on Firefox & Chromium:
	// tooltipShow() Y= 351 pageY= 443
		.style("top", `${d3.event.pageY - tooltip.node().offsetHeight / 2}px`)
		.style("left", `${d3.event.x + 12}px`)
//		.style("z-index", 100)
		.html(html)
		.transition()
		.duration(500)
		.style("opacity", 1)
		;
	}


// ----------------------------------------------------------------------------
function tooltipHide(d) {
d3.select("#tooltip")
	.transition()
	.duration(500)
	.style("opacity", 0)
	;

d3.select(`#cc${d.properties.countryCode}`)
	.style("stroke", "black")
	.style("stroke-width", "0px")
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
	console.log(`WIDTH: ${width}	HEIGHT: ${height}`);
	return {
	width: width,
	// Add padding to height so room for title:
	height: height
	}
}


// ----------------------------------------------------------------------------
function getPageWidth() {

	// [d3.select("body").property("clientWidth"), window.innerWidth]
	// [ 877, 905 ]
	// BUT THE SVG IS 889px, causing SCROLLING?!?
//	let divWidth = window.innerWidth
	let divWidth = d3.select("body").property("clientWidth")
		- parseInt(d3.select("body").style("margin-left"))
		- parseInt(d3.select("body").style("margin-right"))
		;

	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	// Also, add padding.left & .right back to SVG so "width" is INSIDE padding
/*
	divWidth = Math.floor(
		(divWidth - padding.left - padding.right) / 100 )
		* 100
		;
*/
	// On mobile, initial width is only 200: That cannot be correct.
/*
d3.select("#title")
	.text(`width: ${divWidth}`)
	;
*/
//	divWidth = Math.max( divWidth, 450);
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
	// console.log(`getPageHeight() HEIGHT: ${tmpHeight}`);
	return tmpHeight < 400 ? 400 : tmpHeight;
	}
