const DATASETS = {
  kickstarter_pledges: {
    title: "Kickstarter Pledges",
    description:
      "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    source:
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json",
  },
  movie_sales: {
    title: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
    source:
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json",
  },
  video_game_sales: {
    title: "Video Game Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
    source:
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json",
  },
};

const urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET_KEY = "video_game_sales";
const selectedDataset = DATASETS[urlParams.get("data") || DEFAULT_DATASET_KEY];

const body = d3.select("#root");
const tooltip = body.append("div").attr("id", "tooltip").style("opacity", 0);

const svg = d3.select("#treeMapDiagram");
const svgWidth = +svg.attr("width");
const svgHeight = +svg.attr("height");

body
  .append("h1")
  .attr("id", "title")
  .text(selectedDataset.title);

body
  .append("p")
  .attr("id", "description")
  .text(selectedDataset.description);

const colorFader = (color) => d3.interpolateRgb(color, "#fff")(0.2);
const colorScale = d3
  .scaleOrdinal()
  .range(
    [
      "#1f77b4",
      "#aec7e8",
      "#ff7f0e",
      "#ffbb78",
      "#2ca02c",
      "#98df8a",
      "#d62728",
      "#ff9896",
      "#9467bd",
      "#c5b0d5",
      "#8c564b",
      "#c49c94",
      "#e377c2",
      "#f7b6d2",
      "#7f7f7f",
      "#c7c7c7",
      "#bcbd22",
      "#dbdb8d",
      "#17becf",
      "#9edae5",
    ].map(colorFader)
  );

const treemapLayout = d3.treemap().size([svgWidth, svgHeight]).paddingInner(1);

d3.json(selectedDataset.source)
  .then((data) => {
    const rootNode = d3
      .hierarchy(data)
      .eachBefore((node) => {
        node.data.id = `${node.parent ? node.parent.data.id + "." : ""}${
          node.data.name
        }`;
      })
      .sum((node) => node.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    treemapLayout(rootNode);

    const cellGroup = svg
      .selectAll("g")
      .data(rootNode.leaves())
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (node) => `translate(${node.x0},${node.y0})`);

    cellGroup
      .append("rect")
      .attr("id", (node) => node.data.id)
      .attr("class", "tile")
      .attr("width", (node) => node.x1 - node.x0)
      .attr("height", (node) => node.y1 - node.y0)
      .attr("data-name", (node) => node.data.name)
      .attr("data-category", (node) => node.data.category)
      .attr("data-value", (node) => node.data.value)
      .attr("fill", (node) => colorScale(node.data.category))
      .on("mousemove", (event, node) => {
        tooltip
          .style("opacity", 0.9)
          .html(
            `Name: ${node.data.name}<br>Category: ${node.data.category}<br>Value: ${node.data.value}`
          )
          .attr("data-value", node.data.value)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    cellGroup
      .append("text")
      .attr("class", "tile-text")
      .selectAll("tspan")
      .data((node) => node.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (text, index) => 13 + index * 10)
      .text((text) => text);

    const uniqueCategories = [
      ...new Set(rootNode.leaves().map((node) => node.data.category)),
    ];

    const legend = d3.select("#legend");
    const legendWidth = +legend.attr("width");
    const legendOffset = 10;
    const legendRectSize = 15;
    const legendHSpacing = 150;
    const legendVSpacing = 10;
    const legendTextXOffset = 3;
    const legendTextYOffset = -2;
    const legendItemsPerRow = Math.floor(legendWidth / legendHSpacing);

    const legendGroup = legend
      .append("g")
      .attr("transform", `translate(60,${legendOffset})`)
      .selectAll("g")
      .data(uniqueCategories)
      .enter()
      .append("g")
      .attr("transform", (category, index) => {
        return `translate(${(index % legendItemsPerRow) * legendHSpacing},${
          Math.floor(index / legendItemsPerRow) * legendRectSize +
          legendVSpacing * Math.floor(index / legendItemsPerRow)
        })`;
      });

    legendGroup
      .append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .attr("class", "legend-item")
      .attr("fill", (category) => colorScale(category));

    legendGroup
      .append("text")
      .attr("x", legendRectSize + legendTextXOffset)
      .attr("y", legendRectSize + legendTextYOffset)
      .text((category) => category);
  })
  .catch((error) => console.error(error));
