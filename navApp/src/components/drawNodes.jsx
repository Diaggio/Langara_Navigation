const DrawNodes = ({nodes}) => {
    const scale = 3.779528; // Inkscape's scale factor
    
    return (
        <g>
      {nodes.map(node => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="1.5"
          fill="red"
        />
      ))}
    </g>
    );
};

export default DrawNodes;