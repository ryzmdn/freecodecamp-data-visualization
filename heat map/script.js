const w = 1200;
const h = 650;
const padding = 120;
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const legendAxisLength = 500;

const zColors = [...d3.schemeRdYlBu[9]].reverse();

const svg = d3
  .select("#root")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((data) => {
    const dataset = data.monthlyVariance;

    const xScale = d3
      .scaleBand()
      .domain(dataset.map((d) => d.year))
      .range([padding, w - padding]);

    const yScale = d3
      .scaleBand()
      .domain(d3.range(12))
      .range([padding, h - padding]);

    const zScale = d3
      .scaleQuantile()
      .domain([
        d3.min(dataset, (d) => d.variance),
        d3.max(dataset, (d) => d.variance),
      ])
      .range(zColors);

    const legendScale = d3
      .scaleLinear()
      .domain([
        d3.min(dataset, (d) => d.variance),
        d3.max(dataset, (d) => d.variance),
      ])
      .range([0, legendAxisLength]);

    const xTickItems = [
      ...new Set(dataset.map((d) => d.year).filter((year) => year % 10 === 0)),
    ];

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xTickItems)
      .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale).tickFormat((t) => months[t]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .tickValues(zScale.quantiles())
      .tickFormat(d3.format("+.2f"));

    svg
      .selectAll(".cell")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-year", (d) => d.year)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-temp", (d) => d.variance)
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => zScale(d.variance))
      .on("mouseover", (e, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `
            <p>${d.year} - ${months[d.month - 1]}</p>
            ${d.variance >= 0 ? "+" : ""}${d.variance}℃
          `
          )
          .attr("data-year", d.year)
          .style("left", `${e.pageX + 10}px`)
          .style("top", `${e.pageY + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    svg
      .append("text")
      .attr("id", "title")
      .attr("x", w / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text("Monthly Global Land-Surface Temperature");

    svg
      .append("text")
      .attr("id", "description")
      .attr("x", w / 2)
      .attr("y", 80)
      .attr("text-anchor", "middle")
      .text("1753 - 2015: base temperature 8.66℃");

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${h - padding})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${w / 2 - legendAxisLength / 2}, ${h - padding + 80})`
      )
      .call(legendAxis)
      .selectAll("rect")
      .data(zColors)
      .enter()
      .append("rect")
      .attr("width", legendAxisLength / 9)
      .attr("height", 20)
      .attr("fill", (d) => d)
      .attr(
        "transform",
        (d, i) => `translate(${(legendAxisLength * i) / 9}, -20)`
      );
  });
