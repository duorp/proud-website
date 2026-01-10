async function renderStoryGrid(containerSelector, data, width) {
  const boxSize = width / 3;
  const radius = boxSize / 2.5;
  const height = boxSize * 4;

  const x_scale = d3.scaleLinear()
    .domain([1, 4])
    .range([0, width]);

  const y_scale = d3.scaleLinear()
    .domain([1, 5])
    .range([0, height]);

  const method_scale = d3.scaleOrdinal()
    .domain(["Home", "Pill", "Unknown", "Surgical"])
    .range(["#7BD1F0", "#3F8FBC", "#1E5C92", "#083A71"]);

  const married_scale = d3.scaleOrdinal()
    .domain(["Yes", "No"])
    .range(["#E17745", "#B75145"]);

  const age_scale = d3.scaleOrdinal()
    .domain(["Adolescent", "Young Adult", "Adult"])
    .range(["#D6F4BF", "#C9D250", "#29995A"]);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")  // <- crucial
    .style("visibility", "hidden")
    .style("background", "#eee")
    .style("padding", "5px")
    .style("border", "1px solid #999")
    .style("border-radius", "3px")
    .style("pointer-events", "none"); // so it doesn't block hover


  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#FFF5E5");

  // Married rectangles (odd/even sizing preserved)
  svg.selectAll(".married")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x_scale(d.Col) )
    .attr("y", d => y_scale(d.Row) )
    .attr("width", (d, i) => i % 2 ? boxSize / 2 : boxSize)
    .attr("height", (d, i) => i % 2 ? boxSize : boxSize / 2)
    .attr("fill", d => married_scale(d.Married));

  // Method circles
  svg.selectAll(".method")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x_scale(d.Col) + boxSize / 2)
    .attr("cy", d => y_scale(d.Row) + boxSize / 2)
    .attr("r", radius)
    .attr("fill", d => method_scale(d.Method));

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
    .startAngle(Math.PI)
    .endAngle(Math.PI * 2);

  // Age arcs (odd)
  svg.selectAll(".age-odd")
    .data(data.filter((_, i) => i % 2))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("transform", d =>
      `translate(${x_scale(d.Col) + boxSize / 2}, ${y_scale(d.Row) + boxSize / 2}) rotate(90)`
    )
    .attr("fill", d => age_scale(d.Age));

  // Age arcs (even)
  svg.selectAll(".age-even")
    .data(data.filter((_, i) => i % 2 === 0))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("transform", d =>
      `translate(${x_scale(d.Col) + boxSize / 2}, ${y_scale(d.Row) + boxSize / 2})`
    )
    .attr("fill", d => age_scale(d.Age));

  // Tooltip hitboxes
// Append hitboxes last
// join data
const hitboxes = svg.selectAll(".hitbox")
  .data(data)
  .join("rect")  // this handles enter + update + exit
  .attr("class", "hitbox")
  .attr("x", d => x_scale(d.Col))
  .attr("y", d => y_scale(d.Row))
  .attr("width", boxSize)
  .attr("height", boxSize)
  .attr("fill", "transparent")
  .style("pointer-events", "all")
  .style("cursor", "pointer")
  .on("mouseover", (event, d) => {
        const x = x_scale(d.Col);
    const y = y_scale(d.Row);
    console.log(x)
    console.log(y)
    console.log("Hovered over:", d.Name);
    tooltip
      .style("visibility", "visible")
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px")
      .html(`<strong>${d.Name}</strong><br>${d.Story}`);
  })
  .on("mousemove", (event) => {
    tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");
  })
  .on("mouseout", () => tooltip.style("visibility", "hidden"));
}