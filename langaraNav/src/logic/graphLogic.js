export class Graph{

    constructor(totalNodes){
        this.totalNodes = totalNodes;
        this.AdjacencyList = new Map();

    }

    addNode(node){
        if(!this.AdjacencyList.has(node)){
            this.AdjacencyList.set(node,new Map());
        }

    }

    addEdge(nodeA,nodeB,weight){
        this.addNode(nodeA);
        this.addNode(nodeB);

        if(this.AdjacencyList.get(nodeA).has(nodeB)){
            return false;
        }

        this.AdjacencyList.get(nodeA).set(nodeB,weight);
        this.AdjacencyList.get(nodeB).set(nodeA,weight);

        return true;
    }

    removeEdge(nodeA, nodeB) {
        if (this.AdjacencyList.has(nodeA)) {
            this.AdjacencyList.get(nodeA).delete(nodeB);
        }
        if (this.AdjacencyList.has(nodeB)) {
            this.AdjacencyList.get(nodeB).delete(nodeA);
        }
    }

    removeNode(node) {
        if (!this.AdjacencyList.has(node)) {
            return;
        }
        // Remove all edges connected to this node
        for (const neighbour of this.AdjacencyList.get(node).keys()) {
            this.removeEdge(node, neighbour);
        }
        // Remove the node itself
        this.AdjacencyList.delete(node);
    }

    nodesList(){
        return this.AdjacencyList.keys();
    }

    getNeighbours(node){
        let neighbourMap = this.AdjacencyList.get(node);
        if(neighbourMap == undefined){
            return [];
        }

        return neighbourMap.entries();
    }

    displayEdges(node) {
        const neighbours = this.AdjacencyList.get(node);
        
        if (neighbours === undefined) {
            console.log("Node " + node + " not found in graph.");
            return;
        }

        console.log("Edges for node: " + node);
        // Loop through the entries in the inner Map
        for (const [target, weight] of neighbours.entries()) {
            console.log(" -> connects to: " + target + " (distance: " + weight.toFixed(2) + ")");
        }
    }
}

export class MinPriorityQueue{

    constructor(){
        this.heap = [];
    }

    size(){
        return this.heap.length;
    }

    enqueue(item,priority){
        const entry = {item:item, priority:priority};
        this.heap.push(entry)

        let childIndex = this.heap.length - 1;

        while(childIndex > 0){
            let parentIndex = Math.floor((childIndex - 1)/2);
            
            let parent = this.heap[parentIndex];
            let child = this.heap[childIndex];

            if(parent.priority <= child.priority){
                break;
            }

            this.heap[parentIndex]=child;
            this.heap[childIndex]=parent;

            childIndex = parentIndex;

        }
    }

    dequeue(){

        if(this.heap.length == 0){
            return undefined;
        }

        let topItem = this.heap[0];
        let lastItem = this.heap.pop();

        if(this.heap.length > 0){
            this.heap[0] = lastItem;
        }

        let parentIndex = 0;

        while(true){

            let leftChildIndex = parentIndex * 2 + 1;
            let rightChildIndex = leftChildIndex + 1;

            let smallestIndex = parentIndex;

            if(leftChildIndex < this.heap.length && 
                this.heap[leftChildIndex].priority < this.heap[smallestIndex].priority){
                    smallestIndex = leftChildIndex;
                }
            if(rightChildIndex < this.heap.length &&
                this.heap[rightChildIndex].priority < this.heap[smallestIndex].priority){
                    smallestIndex = rightChildIndex;
                }
            
            if(smallestIndex == parentIndex){
                break;
            }

            let temp = this.heap[parentIndex];
            this.heap[parentIndex] = this.heap[smallestIndex];
            this.heap[smallestIndex] = temp;

            parentIndex = smallestIndex;
        }

        return topItem;

    }

}


export function dijkstra(graph,source){

    const distance = new Map();
    const path = new Map();

    for(const node of graph.nodesList()){
        distance.set(node, Infinity);
    }

    distance.set(source, 0);

    let queue = new MinPriorityQueue();
    queue.enqueue(source, 0);

    while(queue.size() > 0){
        let entry = queue.dequeue();
        let currentNode = entry.item;
        let currentDistance = entry.priority;

        if(currentDistance != distance.get(currentNode)){
            continue;
        }

        for(const [neighbour,edgeWeight] of graph.getNeighbours(currentNode)){
            let newDistance = currentDistance + edgeWeight;
            if(newDistance < distance.get(neighbour)){
                distance.set(neighbour, newDistance);
                path.set(neighbour, currentNode);
                queue.enqueue(neighbour, newDistance);
            }
        }

    }

    /* path returns a map thats in reverse, use reconstruct path to make it go forward
        the map looks like this, "A3Room-302" is "target", "temp-start" is the source
        {
        "A2Hallway-2": "temp-start",
        "A2Stairs-1": "A2Hallway-2",
        "A3Stairs-1": "A2Stairs-1",
        "A3Room-302": "A3Stairs-1"
        } */
    return {distance:distance, path:path};


}

/* "previous" is the actual path object, see djikstra above
    takes the map, converts it to an array and puts it in the
    right order for traversal */
export function reconstructPath(previous, source, target) {
  const path = [];
  let node = target;

  if (source === target) {
    return [source];
  }

  if (!previous.has(target)) {
    return []; // unreachable
  }

  while (node !== undefined) {
    path.push(node);
    if (node === source) {
      break;
    }
    node = previous.get(node);
  }

  path.reverse();
  return path;
}


