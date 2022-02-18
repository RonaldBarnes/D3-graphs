// write your code here!
// vsCodium here, via "fish" ssh file system on KDE!



let width = 600;
let height = 700;
let padding = 25;
let barPadding = 1;

// let minYear = d3.min(birthData, d => d.year);
let [minYear, maxYear] = d3.extent(birthData, d => d.year);
// Initialize the chart to a median value, looks nicer:
let startYear = minYear + (maxYear - minYear) / 2;

let continents = new Set();
birthData.forEach(d => continents.add(d.continent));
let continentsNames = {
	AF: "Africa",
	AS: "Asia",
	EU: "Europe",
	NA: "North America",
	OC: "Oceania, Aus, & NZ",
	SA: "South America"
	};

/*
let continents = [];
for (let i = 0; i < birthData.length; i++) {
	let continent = birthData[i].continent;
	if (continents.indexOf(continent) === -1) {
		continents.push(continent);
		}
	}
*/

let colourScale = d3.scaleOrdinal()
	.domain( continents )
	.range(d3.schemeCategory10)
	;


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
	.attr("transform",
		`translate( ${width / 2}, 
			${height / 2 + padding})`)
	.classed("chart", true)
	// .style("outline", "1px solid green")
	;



// Assign default values to our input / range slider:
d3.select("input")
	.property("min", minYear)
	.property("max", maxYear)
	.property("value", startYear)
	.on("input", function() {
		makeGraph( Number(d3.event.target.value));
		})
	;


// Initialize sort-by-continent to false:
d3.select("#groupContinents")
	.property("checked", false)
	;
// Set a variable to refer to in the arcs.sort():
let groupContinents =
	d3.select("#groupContinents").property("checked");
console.log("CHECKBOX:", groupContinents);
// Set change handler on checkbox:
d3.select("#groupContinents")
	.on("input", function (d) {
		let groupContinents =
			d3.select("#groupContinents").property("checked");
		console.log("CHECKBOX changed:", groupContinents);
		makeGraph(Number(d3.select("input").property("value")));
		})
	;



// Initialize graph:
makeGraph(startYear);	

function makeGraph(year) {
	let yearData = birthData.filter( d => d.year === year);
	setYearLabel(year)
	let groupContinents =
		d3.select("#groupContinents").property("checked");

	// The beginning of a pie chart:
	let arcs = d3.pie()
		.value(d => d.births)
		// Sort by continent, grouping sections by colour:
		.sort(function (a, b) {
			console.log(`Group CONTINENTS:`,groupContinents)
			if (groupContinents) {
				if (a.continent < b.continent) {
					return -1
					}
				else if (a.continent > b.continent) {
					return 1
					}
				}
			return b.births - a.births;
			})
			// this is the arcs.value() I think, poor explanation in lesson:
		(yearData)
		// Doesn't work: "arcs.padAngle is not a function"
		// padAngle(0.25)
		;

	let path = d3.arc()
		.outerRadius( width / 2 - 10)
		// Positive innerRadius gives an annulus (donut):
		.innerRadius(width / 4)
		// pie.padAngle doesn't seem to work on d3.pie (above)
		// pie.padAngle: set padding between arcs
		// arc.padAngle: set padding between arcs (again?)
		// arc.cornerRadius: round arc corners
		// .padAngle(0.0075)
		.cornerRadius(5)
		;

	let update = d3.select(".chart")
		.selectAll(".arc")
		.data(arcs)
		;
	update
		.exit()
		.remove()
		;
	update
		.enter()
		.append("path")
			.classed("arc", true)
		.merge(update)
			.transition()
			.duration(1000)
			.delay((d, i) => i * 50)
			.attr("fill", d => colourScale(d.data.continent))
			.attr("stroke", "black")
			.attr("d", path)
	setToolTip()
	}
	;

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
		.attr("x", width / 2)
		.attr("dy", "1.5em")
		.style("text-anchor", "middle")
		.style("font-size", "1.5em")
		.text("Births by Country by Year")
	;


// Create colourized legend for continents:
let legend = "";
Array.from(continents).sort().forEach(function (c) {
	legend += `<div style="background:${colourScale(c)}" `
		+ `title="${continentsNames[c]}">`
		+ `${c}: ${continentsNames[c]}</div>`;
	console.log(`CONTINENT: ${c}=${continentsNames[c]}`)
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

	// console.log("DATA:", data.data);

	let tooltip = d3.select("#tooltip");
/*
	let retVal = `<h3>Median age range: ${data.x0} - ${data.x1}</h3>`
		+ `<p>${data.length} countries:</p><ul>`;
	data.map( d => {
		// console.log(`RETVAL ${retVal} and "d.region" = `, d.region);
		retVal += `<li>${d.region}</li>`;
		});
	retVal += "</ul>";
*/
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
