import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TaskFlowDiagram = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 800;
    const height = 600;

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", 2)
      .attr("stroke", "#999");

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => d.color)
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node.append("title").text((d) => d.label);

    const text = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .text((d) => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      text.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });
  }, [data]);

  return (
    <svg
      ref={svgRef}
      width="800"
      height="600"
      style={{ border: "1px solid black" }}
    ></svg>
  );
};

export default TaskFlowDiagram;
