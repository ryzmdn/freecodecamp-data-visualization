const CONFIG = {
  dimensions: {
    width: 1000,
    height: 650,
    padding: {
      top: 100,
      left: 110,
      right: 60,
      bottom: 80
    },
    dotRadius: 5
  },
  colors: {
    doping: {
      dot: "#3b82f6",
      tooltip: "#60a5fa"
    },
    clean: {
      dot: "#f97316",
      tooltip: "#fb923c"
    }
  },
  legend: {
    spacing: 20,
    items: [
      { text: "No doping allegations", type: "clean" },
      { text: "Riders with doping allegations", type: "doping" }
    ]
  }
};

async function createChart() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json");
    const dataset = await response.json();
    
    const container = d3.select("#root");
    initTooltip(container);

    const svg = initSVG(container);
    
    chartTitle(svg);
    chartSubtitle(svg);

    const { xScale, yScale } = createScales(dataset);

    axes(svg, xScale, yScale);
    axisLabel(svg);
    legendElement(svg);
    dataPoints(svg, dataset, xScale, yScale);
    
  } catch (error) {
    console.error("Error creating chart:", error);
  }
}

function initTooltip(container) {
  return container
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("visibility", "hidden");
}

function initSVG(container) {
  return container
    .append("svg")
    .attr("id", "chart")
    .attr("width", CONFIG.dimensions.width)
    .attr("height", CONFIG.dimensions.height)
    .style("background", "white")
    .style("opacity", 0.93);
}

function createTooltip(data) {
  const tooltipParts = [];

  tooltipParts.push(`<span class='cyclist'>${data.Name}: ${data.Nationality}</span>`);
  tooltipParts.push(`<br/>`);
  tooltipParts.push(`<span class='climb-time'>${data.Time}</span>`);
  tooltipParts.push(`<br/>`);

  if (data.Doping) {
    tooltipParts.push(`<span class='dopingDetails'>${data.Doping}</span>`);
  } else {
    tooltipParts.push(`<span class='dopingDetails'>(No doping allegations)</span>`);
  }

  return tooltipParts.join('');
}

function createScales(dataset) {
  const xScale = d3.scaleLinear()
    .domain([
      d3.min(dataset, d => d.Year - 1),
      d3.max(dataset, d => d.Year + 1)
    ])
    .range([CONFIG.dimensions.padding.left, CONFIG.dimensions.width - CONFIG.dimensions.padding.right]);

  const yScale = d3.scaleTime()
    .domain([
      new Date((d3.min(dataset, d => d.Seconds) - 15) * 1000),
      new Date((d3.max(dataset, d => d.Seconds) + 15) * 1000)
    ])
    .range([CONFIG.dimensions.padding.top, CONFIG.dimensions.height - CONFIG.dimensions.padding.bottom]);

  return { xScale, yScale };
}

function chartTitle(svg) {
  svg.append("text")
    .text("Doping in Professional Bicycle Racing")
    .attr("id", "title")
    .attr("x", CONFIG.dimensions.width / 2)
    .attr("y", CONFIG.dimensions.padding.top / 2)
    .attr("text-anchor", "middle");
}

function chartSubtitle(svg) {
  svg.append("text")
    .text("35 Fastest times up Alpe d'Huez")
    .attr("id", "subtitle")
    .attr("x", CONFIG.dimensions.width / 2)
    .attr("y", CONFIG.dimensions.padding.top / 1.3)
    .attr("text-anchor", "middle");
}

function axes(svg, xScale, yScale) {
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d => parseInt(d));
    
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%M:%S"));

  svg.append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${CONFIG.dimensions.height - CONFIG.dimensions.padding.bottom})`);

  svg.append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", `translate(${CONFIG.dimensions.padding.left}, 0)`);
}

function axisLabel(svg) {
  const yLabelX = (2 * CONFIG.dimensions.padding.left) / 5;
  const yLabelY = CONFIG.dimensions.height / 2;
  
  svg.append("text")
    .text("Time in Minutes")
    .attr("x", yLabelX)
    .attr("y", yLabelY)
    .attr("transform", `rotate(-90, ${yLabelX}, ${yLabelY})`)
}

function legendElement(svg) {
  const legend = svg.append("g")
    .attr("id", "legend")
    .selectAll("g")
    .data(CONFIG.legend.items)
    .enter()
    .append("g")
    .attr("class", "legend-item");

  legend.append("circle")
    .attr("class", "legend-item-dot")
    .attr("cx", CONFIG.dimensions.width - 4.5 * CONFIG.dimensions.padding.right)
    .attr("cy", (_, i) => 1.2 * CONFIG.dimensions.padding.top + i * CONFIG.legend.spacing)
    .attr("r", CONFIG.dimensions.dotRadius)
    .style("fill", d => CONFIG.colors[d.type].dot);

  legend.append("text")
    .attr("class", "legend-item-text")
    .text(d => d.text)
    .attr("dominant-baseline", "central")
    .attr("x", CONFIG.dimensions.width - 4.5 * CONFIG.dimensions.padding.right + CONFIG.legend.spacing)
    .attr("y", (_, i) => 1.2 * CONFIG.dimensions.padding.top + i * CONFIG.legend.spacing);

  svg.append("rect")
    .attr("id", "legend-border")
    .attr("x", CONFIG.dimensions.width - 4.5 * CONFIG.dimensions.padding.right - CONFIG.legend.spacing)
    .attr("y", CONFIG.dimensions.padding.top)
    .attr("width", 250)
    .attr("height", 3 * CONFIG.legend.spacing)
    .attr("rx", 3)
    .attr("ry", 3);
}

function dataPoints(svg, dataset, xScale, yScale) {
  const tooltip = d3.select("#tooltip");

  svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", d => d.Year)
    .attr("data-yvalue", d => new Date(d.Seconds * 1000))
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(new Date(d.Seconds * 1000)))
    .attr("r", CONFIG.dimensions.dotRadius)
    .style("fill", d => d.Doping ? CONFIG.colors.doping.dot : CONFIG.colors.clean.dot)
    .on("mouseover", function(d, i) {
      const dot = d3.select(this);
      handleMouseOver(d, tooltip, xScale, yScale, dot);
    })
    .on("mouseout", () => handleMouseOut(tooltip));
}

function handleMouseOver(d, tooltip, xScale, yScale, dot) {
  const { padding, width } = CONFIG.dimensions;
  
  const year = dot.attr("data-xvalue");
  
  tooltip
    .html(createTooltip(d))
    .style("top", yScale(new Date(d.Seconds * 1000)) - 45 + "px" )
    .style("left", padding.left + xScale(d.Year) - width / 2 + 25 + "px" )
    .attr("data-year", year)
    .transition()
    .duration(200)
    .style("background", d.Doping ? CONFIG.colors.doping.tooltip : CONFIG.colors.clean.tooltip)
    .style("opacity", 0.9)
    .style("visibility", "visible");
}

function handleMouseOut(tooltip) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
    .style("visibility", "hidden");
}

createChart();