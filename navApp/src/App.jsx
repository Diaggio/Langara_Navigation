import { useState } from 'react';
import './App.css';
import Map from './components/map';
import Sidebar from './components/sidebar';
import nodes from './assets/Nodes/nodes.json';

function App() {
  const [activePath, setActivePath] = useState(null);
  const [showNodes, setShowNodes] = useState(true);

  const handlePathfind = (start, end) => {
    setActivePath({ start, end });
  };

  return (
    <div className="Container">
      <Sidebar 
        nodes={nodes} 
        onPathfind={handlePathfind} 
        showNodes={showNodes} 
        setShowNodes={setShowNodes}
      />
      <Map 
        nodes={nodes} 
        activePath={activePath} 
        showNodes={showNodes} 
      />
    </div>
  );
}

export default App;