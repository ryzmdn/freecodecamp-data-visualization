const svg = d3.select("#root");

svg
  .append("h1")
  .attr("id", "title")
  .text("United States Educational Attainment");

svg
  .append("h2")
  .attr("id", "description")
  .text(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  );

const tooltip = svg.append("div").attr("id", "tooltip");

tooltip.append("p").attr("class", "area");
tooltip.append("p").attr("class", "education");

const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 1000 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const svgContainer = svg
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  );

const svgCanvas = svgContainer
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const legendValues = {
  percentage: [3, 12, 21, 30, 39, 48, 57, 66],
  colors: [
    "#dcfce7",
    "#bbf7d0",
    "#86efac",
    "#4ade80",
    "#22c55e",
    "#16a34a",
    "#166534",
    "#052e16",
  ],
  height: 15,
  width: 30,
};

const legend = svgCanvas
  .append("g")
  .attr("id", "legend")
  .attr(
    "transform",
    `translate(${
      width - legendValues.percentage.length * legendValues.width
    }, 0)`
  );

legend
  .selectAll("rect")
  .data(legendValues.percentage)
  .enter()
  .append("rect")
  .attr("width", legendValues.width)
  .attr("height", legendValues.height)
  .attr("x", (d, i) => i * legendValues.width)
  .attr("y", 0)
  .attr("fill", (d, i) => legendValues.colors[i]);

legend
  .selectAll("text")
  .data(legendValues.percentage)
  .enter()
  .append("text")
  .attr("class", "legend-number")
  .attr("x", (d, i) => i * legendValues.width)
  .attr("y", legendValues.height * 2)
  .text((d) => `${d}%`);

const colorScale = d3.scaleQuantize().range(legendValues.colors);

fetch(
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
)
  .then((response) => response.json())
  .then((data) => fetchData(data));

function fetchData(educationData) {
  fetch(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
  )
    .then((response) => response.json())
    .then((svgData) => {
      svgData.objects.counties.geometries.forEach((geometry) => {
        const match = educationData.find((ed) => ed.fips === geometry.id);
        if (match) {
          Object.assign(geometry, match);
        }
      });
      return svgData;
    })
    .then(drawMap);
}

function drawMap(data) {
  colorScale.domain([
    0,
    d3.max(data.objects.counties.geometries, (d) => d.bachelorsOrHigher),
  ]);

  const feature = topojson.feature(data, data.objects.counties);
  const path = d3.geoPath();

  svgCanvas
    .selectAll("path")
    .data(feature.features)
    .enter()
    .append("path")
    .on("mouseenter", (d, i) => {
      const geometry = data.objects.counties.geometries[i];
      if (geometry) {
        tooltip
          .style("opacity", 1)
          .attr("data-fips", geometry.fips)
          .attr("data-education", geometry.bachelorsOrHigher)
          .style("left", `${d3.event.layerX + 5}px`)
          .style("top", `${d3.event.layerY + 5}px`);

        tooltip
          .select("p.area")
          .text(
            `${geometry.area_name}, ${geometry.state}: ${geometry.bachelorsOrHigher}%`
          );
      }
    })
    .on("mouseout", () => tooltip.style("opacity", 0))
    .attr("d", path)
    .attr("transform", `scale(0.82, 0.62)`)
    .attr("class", "county")
    .attr("data-fips", (d, i) => data.objects.counties.geometries[i]?.fips)
    .attr("data-state", (d, i) => data.objects.counties.geometries[i]?.state)
    .attr("data-area", (d, i) => data.objects.counties.geometries[i]?.area_name)
    .attr(
      "data-education",
      (d, i) => data.objects.counties.geometries[i]?.bachelorsOrHigher
    )
    .attr("fill", (d, i) =>
      colorScale(data.objects.counties.geometries[i]?.bachelorsOrHigher)
    );
}
