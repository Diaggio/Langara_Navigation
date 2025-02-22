import { useState } from 'react';

const Sidebar = ({ onPathfind, nodes, showNodes, setShowNodes }) => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onPathfind(start, end);
    };

    return (
        <div className="sidebar">
            <h2>Options</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="start">Choose your starting point:</label>
                <select 
                    name="start" 
                    id="start" 
                    value={start} 
                    onChange={(e) => setStart(e.target.value)}
                >
                    <option value="">Select start</option>
                    {nodes.map(node => (
                        <option key={node.id} value={node.id}>{node.id}</option>
                    ))}
                </select>
                <br/>
                <label htmlFor="end">Choose your end point:</label>
                <br/>
                <select 
                    name="end" 
                    id="end" 
                    value={end} 
                    onChange={(e) => setEnd(e.target.value)}
                >
                    <option value="">Select end</option>
                    {nodes.map(node => (
                        <option key={node.id} value={node.id}>{node.id}</option>
                    ))}
                </select>
                <br/>
                <button type="submit">
                    Go
                </button>
            </form>

            <button onClick={() => setShowNodes(!showNodes)}>
                {showNodes ? 'Hide' : 'Show'} Nodes
            </button>
        </div>
    );
};

export default Sidebar;