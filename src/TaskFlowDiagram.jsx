import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TaskFlowDiagram = ({ data, onNodeClick, onDragStart, onDrop, selectedTask, zoomRef }) => {
  const svgRef = useRef();
  const gRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const width = 800;
    const height = 600;
    const rectWidth = 100;
    const rectHeight = 50;

    // Create links from node outputs
    const links = data.nodes.flatMap(node =>
      node.outputs.map(output => ({
        source: node.id,
        target: output
      }))
    );

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create a group for zooming
    const g = svg.append('g').attr('ref', gRef);

    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#999');

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('rect')
      .data(data.nodes)
      .enter().append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', d => d.color)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('stroke', d => (selectedTask === d.id ? 'black' : 'none'))
      .attr('stroke-width', d => (selectedTask === d.id ? 3 : 1))
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.id);
      })
      .on('mousedown', (event, d) => {
        onDragStart(d.id);
      })
      .on('mouseup', (event, d) => {
        onDrop(d.id);
      })
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('title').text(d => d.label);

    const text = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('x', d => d.x - rectWidth / 2)
        .attr('y', d => d.y - rectHeight / 2);

      text
        .attr('x', d => d.x)
        .attr('y', d => d.y + 5); // Adjust text position
    });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])  // Set zoom limits
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Expose zoom behavior to parent
    if (zoomRef) {
      zoomRef.current = zoom;
      zoomRef.currentTransform = d3.zoomIdentity;
    }

    // Update the current transform on zoom
    svg.on('zoom', (event) => {
      if (zoomRef) {
        zoomRef.currentTransform = event.transform;
      }
    });

  }, [data, selectedTask]);

  return (
    <svg ref={svgRef} width="800" height="600" style={{ border: '1px solid black' }}>
    </svg>
  );
};

export default TaskFlowDiagram;
