"use strict";

fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then((response) => response.json())
  .then((result) => {
    const {
      from_date,
      to_date,
      data,
    } = result;

    const width = 700;
    const height = 350;
    const topBottom = 20;
    const left = 40;
    const right = 10;
    const leftRight = left + right;
    const barColor = {
      default: "#3b82f6",
      hovered: "#1d4ed8",
    };

    const barWidth = (width - leftRight) / data.length;
    const from = new Date(from_date);
    const to = new Date(to_date);

    const ScaleX = d3.scaleTime().domain([from, to]).range([leftRight, width]);

    const ScaleY = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[1])])
      .range([height, topBottom * 2]);

    const root = d3.select("#root");

    root
      .append("h1")
      .text("United States GDP")
      .attr("id", "title")

    const svg = root
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const tooltip = root
      .append("div")
      .attr("id", "tooltip")

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .style("fill", barColor.default)
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .style("width", barWidth)
      .style("height", (d) => height - ScaleY(d[1]))
      .attr("x", (d, i) => left + barWidth * i)
      .attr("y", (d) => ScaleY(d[1]) - topBottom)
      .on("mouseenter", function (d) {
        d3.select(this).style("fill", barColor.hovered);

        const { pageX: x, pageY: y } = d3.event;

        tooltip
          .attr("transform", `translate(${x}px, ${y})px`)
          .style("left", d3.event.pageX + 16 + "px")
          .style("top", d3.event.pageY + 16 + "px")
          .style("visibility", "visible")
          .attr("data-date", d[0])
          .html(`<p class="total">$ ${d[1]}0 Billion</p>`);
      })
      .on("mouseleave", () => {
        d3.select(this).style("fill", barColor.default);
        tooltip.style("visibility", "hidden");
      });

    const xAxis = d3.axisBottom(ScaleX);
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(-${right}, ${height - topBottom})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(ScaleY);
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${left}, -${topBottom})`)
      .call(yAxis);

    root.append("p").attr("class", "source").text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf");
  })
  .catch((err) => console.error("Error fetching data:", err));
