const DrawNodes = ({nodes}) => {
    
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