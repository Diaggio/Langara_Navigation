
class Graph{

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
}