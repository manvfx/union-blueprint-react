import React, { useState, useRef } from "react";
import TaskFlowDiagram from "./TaskFlowDiagram";
import "./App.css";

const initialData = {
  nodes: [
    {
      id: "Task 1",
      label: "Task One",
      color: "#ff6666",
      inputs: [],
      outputs: ["Task 2"],
    },
    {
      id: "Task 2",
      label: "Task Two",
      color: "#66ff66",
      inputs: ["Task 1"],
      outputs: ["Task 3"],
    },
    {
      id: "Task 3",
      label: "Task Three",
      color: "#6666ff",
      inputs: ["Task 2"],
      outputs: ["Task 4"],
    },
    {
      id: "Task 4",
      label: "Task Four",
      color: "#ffcc66",
      inputs: ["Task 3"],
      outputs: [],
    },
  ],
};

function App() {
  const [data, setData] = useState(initialData);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const zoomRef = useRef(null);

  const addTask = () => {
    const newTaskId = `Task ${data.nodes.length + 1}`;
    const newTask = {
      id: newTaskId,
      label: `Task ${newTaskId}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      inputs: [],
      outputs: [],
    };

    setData((prevData) => ({
      nodes: [...prevData.nodes, newTask],
    }));
  };

  const removeTask = () => {
    if (!selectedTask) return;

    setData((prevData) => {
      const nodes = prevData.nodes.filter((node) => node.id !== selectedTask);
      nodes.forEach((node) => {
        node.inputs = node.inputs.filter((input) => input !== selectedTask);
        node.outputs = node.outputs.filter((output) => output !== selectedTask);
      });
      return { nodes };
    });

    setSelectedTask(null);
  };

  const handleNodeClick = (taskId) => {
    if (selectedTask && selectedTask !== taskId) {
      // If a task is already selected, create a connection
      setData((prevData) => {
        const newData = { ...prevData };
        const sourceTask = newData.nodes.find(
          (node) => node.id === selectedTask
        );
        const targetTask = newData.nodes.find((node) => node.id === taskId);

        if (sourceTask && targetTask && sourceTask.id !== targetTask.id) {
          sourceTask.outputs.push(targetTask.id);
          targetTask.inputs.push(sourceTask.id);
        }

        return newData;
      });
      setSelectedTask(null);
    } else {
      // Select the task for connecting
      setSelectedTask(taskId);
    }
  };

  const handleDragStart = (taskId) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (targetId) => {
    if (draggedTask && draggedTask !== targetId) {
      setData((prevData) => {
        const newData = { ...prevData };
        const sourceTask = newData.nodes.find(
          (node) => node.id === draggedTask
        );
        const targetTask = newData.nodes.find((node) => node.id === targetId);

        if (sourceTask && targetTask && sourceTask.id !== targetTask.id) {
          sourceTask.outputs.push(targetTask.id);
          targetTask.inputs.push(sourceTask.id);
        }

        return newData;
      });
    }
    setDraggedTask(null);
  };

  const handleZoomIn = () => {
    const svg = d3.select("svg");
    svg.transition().call(zoomRef.current.scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    const svg = d3.select("svg");
    svg.transition().call(zoomRef.current.scaleBy, 0.8);
  };

  return (
    <div className="App">
      <button onClick={addTask}>Add Task</button>
      <button onClick={removeTask} disabled={!selectedTask}>
        Remove Task
      </button>
      <button onClick={handleZoomIn}>Zoom In</button>
      <button onClick={handleZoomOut}>Zoom Out</button>
      <TaskFlowDiagram
        data={data}
        onNodeClick={handleNodeClick}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        selectedTask={selectedTask}
        zoomRef={zoomRef}
      />
    </div>
  );
}

export default App;
