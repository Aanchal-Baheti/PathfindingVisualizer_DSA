
// <<<---------***GENERATE MAZE ALGORITHM***--------->>>
var wallToAnimate;
const generateMazeBtn= document.getElementById('generateMazeBtn');

generateMazeBtn.addEventListener('click',()=>{
    wallToAnimate = [];
    generateMaze(0, row-1, 0, column-1, false, 'horizontal')
    animate(wallToAnimate, 'wall');
})

function generateMaze(rowStart, rowEnd, colStart, colEnd,surroundingWall, orientation){
    if(rowStart > rowEnd || colStart > colEnd){
        return;
    }
    //-------first recursion call will generate surrounding wall for maze
    if(!surroundingWall){
        for(let j=0; j<column; j++){
            for(let i=0; i<row; i+=row-1){
                if(!matrix[i][j].classList.contains('source') && !matrix[i][j].classList.contains('target'))
                    wallToAnimate.push(matrix[i][j]);
            }
        }
        for(let i=0; i<row; i++){
            for(let j=0; j<column; j+=column-1){
                if(!matrix[i][j].classList.contains('source') && !matrix[i][j].classList.contains('target'))
                    wallToAnimate.push(matrix[i][j]);
            }
        }
        surroundingWall = true;
    }
    //---------creating horizontal division
    if(orientation ===  'horizontal'){
        
        let possibleRows = [];
        for(let i = rowStart; i <= rowEnd; i+=2){
            possibleRows.push(i);
        }
        let possibleCols = [];
        for(let i = colStart-1; i <= colEnd+1; i+=2){
            if(i>0 && i<column-1)
                possibleCols.push(i);
        }
        const randomRow = possibleRows[Math.floor(Math.random()*possibleRows.length)];
        const randomCol = possibleCols[Math.floor(Math.random()*possibleCols.length)]; // one random column cell in this row will not be marked
        
        for(let j = colStart-1; j <= colEnd+1; j++){
            const cell = matrix[randomRow][j];
            if(!cell || j === randomCol) continue;
            if(cell.classList.contains('source') || cell.classList.contains('target')) continue;
            wallToAnimate.push(cell);
        }
        
        let newOrientation = ((randomRow-2)-rowStart > colEnd-colStart)? 'horizontal':'vertical'; // if current division is horizantally taller, we will divide it vertically in next call
        generateMaze(rowStart, randomRow-2, colStart, colEnd, true, newOrientation); //upper subdivision
        
        newOrientation = (rowEnd-(randomRow+2) > colEnd-colStart)? 'horizontal':'vertical';
        generateMaze(randomRow+2, rowEnd, colStart, colEnd, true, newOrientation); //lower subdivision
    }
    //----------creating vertical division
    else{

        let possibleCols = [];
        for(let i = colStart; i <= colEnd; i+=2){
            possibleCols.push(i);
        }
        let possibleRows = [];
        for(let i = rowStart-1; i <= rowEnd+1; i+=2){
            if(i>0 && i<row-1)
                possibleRows.push(i);
        }
        const randomRow = possibleRows[Math.floor(Math.random()*possibleRows.length)]; // one random row cell in this row will not be marked
        const randomCol = possibleCols[Math.floor(Math.random()*possibleCols.length)];
        
        for(let i = rowStart-1; i <= rowEnd+1; i++){
            if(!matrix[i]) continue;
            const cell = matrix[i][randomCol];
            if(i === randomRow) continue;
            if(cell.classList.contains('source') || cell.classList.contains('target')) continue;
            wallToAnimate.push(cell);
        }
        
        let newOrientation = (rowEnd-rowStart > colEnd-(randomCol+2))? 'horizontal':'vertical';
        generateMaze(rowStart, rowEnd, randomCol+2, colEnd, true, newOrientation);//right subdivision
        
        newOrientation = (rowEnd-rowStart > (randomCol-2)-colStart)? 'horizontal':'vertical';
        generateMaze(rowStart, rowEnd, colStart, randomCol-2, true, newOrientation);//left subdivision
    }
}


//<<<<<<<<<< A L G O R I T H M S - Pathfinding >>>>>>>>>>

var visitedCell;
var pathToAnimate;
visualizeBtn.addEventListener('click',()=>{
    visitedCell = [];
    pathToAnimate = [];
    clearPath();
    switch(algorithm){
        case 'BFS'       : BFS();
                            break;
        case 'DFS'       : if(DFS(source_coordinate)){
                            pathToAnimate.push(matrix[source_coordinate.x][source_coordinate.y]);
                            } break;
        case 'Greedy'    : Greedy();
                            break;
        case 'Dijkstra': Dijkstra();
                            break;
        case 'A*'        : Astar();
                            break;
        default : break;
    }
    animate(visitedCell, 'visited');
})


// <<<----------***BFS ALGORITHM***--------->>>

function BFS(){
    const queue = [];
    const queueVis = new Set();
    const parentmap = new Map();
    
    queue.push(source_coordinate);
    queueVis.add(`${source_coordinate.x}-${source_coordinate.y}`);
    
    while(queue.length > 0){
        const current = queue.shift();
        visitedCell.push(matrix[current.x][current.y]);
    
        if(current.x === target_coordinate.x && current.y === target_coordinate.y){
            getPath(parentmap, target_coordinate);
            return;
        }
    
        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1},
            {x:current.x, y:current.y+1}
        ];
        for(const neighbour of neighbours){
            const childkey = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) 
                && !queueVis.has(childkey)
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ){
                queue.push(neighbour);
                queueVis.add(childkey)
                parentmap.set(childkey, current)
            }
        }

    }
}
function getPath(parentmap, node){
    if(!node) return; //if not valid - base case for source
    pathToAnimate.push(matrix[node.x][node.y]); 
    const parent = parentmap.get(`${node.x}-${node.y}`);
    getPath(parentmap, parent);
}

// <<<----------***DIJKSTRA's ALGORITHM***--------->>>

class PriorityQueue{
    constructor(){
        this.elements = [];
        this.length = 0;
    }
    push(data){
        this.elements.push(data);
        this.length++;
        this.upHeapify(this.length-1);
    }
    pop(){
        this.swap(0, this.length-1);
        const popped = this.elements.pop();
        this.length--;
        this.downHeapify(0);
        return popped;
    }
    upHeapify(index){
        if(index === 0) return;
        const parent = Math.floor((index-1)/2);
        if(this.elements[index].cost < this.elements[parent].cost)
            this.swap(parent, index);
        this.upHeapify(parent);

    }
    downHeapify(index){
        let minNode = index;
        const leftChild = (2*index) + 1;
        const rightChild = (2*index) + 2;
        if(leftChild<this.length && this.elements[leftChild].cost < this.elements[minNode].cost){
            minNode = leftChild;
        }
        if(rightChild<this.length && this.elements[rightChild].cost < this.elements[minNode].cost){
            minNode = rightChild;
        }
        if(minNode !== index){
            this.swap(minNode, index);
            this.downHeapify(minNode);
        }
    }
    isEmpty(){
        return this.length === 0;
    }
    swap(x,y){
        [this.elements[x], this.elements[y]] = [this.elements[y], this.elements[x]]
    }
}

function Dijkstra(){
    const pq = new PriorityQueue();
    const parentmap = new Map();
    
    const distance = [];
    for(let i = 0; i<row; i++){
        const INF = [];
        for(let j = 0; j<column; j++){
            INF.push(Infinity);
        }
        distance.push(INF); //2D-matrix
    }
    
    distance[source_coordinate.x][source_coordinate.y] = 0;
    pq.push({coordinate: source_coordinate, cost: 0});

    while(!pq.isEmpty()){
        const {coordinate: current, cost: distanceSoFar} = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);

        if(current.x === target_coordinate.x && current.y === target_coordinate.y){
            getPath(parentmap, target_coordinate);
            return;
        }
        
        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1},
            {x:current.x, y:current.y+1}
        ];
        for(const neighbour of neighbours){
            const childkey = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) 
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall'))
            {
                const edgeWeight = 1;
                const distanceToNeighbour = distanceSoFar + edgeWeight;
                if(distanceToNeighbour < distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    pq.push({coordinate: neighbour, cost: distanceToNeighbour});
                    parentmap.set(childkey, current)
                }
            }
        }
    }
}


// <<<----------***GREEDY's ALGORITHM***--------->>>
// Every step is taken such that, it gets you closer to the target and hence continue your path.
// Once you find out this path doesnt lead you to target, you choose another path .

function heuristicValue(node){ 
    // returns dx+dy; - using this value you decide if you are getting closer to target
    let dx = Math.abs(node.x - target_coordinate.x);
    let dy = Math.abs(node.y - target_coordinate.y);
    return dx + dy;
}
function Greedy(){
    const pq = new PriorityQueue();
    const pqVis = new Set();
    const parentmap = new Map();
    
    pq.push({coordinate: source_coordinate, cost: heuristicValue(source_coordinate)});
    pqVis.add(`${source_coordinate.x}-${source_coordinate.y}`);
    
    while(pq.length > 0){
        const {coordinate: current, cost: distanceSoFar} = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);
       
        if(current.x === target_coordinate.x && current.y === target_coordinate.y){
            getPath(parentmap, target_coordinate);
            return;
        }

        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1},
            {x:current.x, y:current.y+1}
        ];
        for(const neighbour of neighbours){
            const childkey = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) 
                && !pqVis.has(childkey)
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ){
                pq.push({coordinate: neighbour, cost: heuristicValue(neighbour)});
                pqVis.add(childkey)
                parentmap.set(childkey, current)
            }
        }
    }
}


// <<<----------*** A* ALGORITHM ***--------->>>
// A* = Dijkstra + Greedy
// priortizes path on the basis of = distance + heuristicValue

function Astar(){
    const pq = new PriorityQueue();
    const openSet = new Set();  // pqVisisted
    const closedSet = new Set();  // Visited    
    const parentmap = new Map();
    
    const gScore = [];          //distance[] as in dijkstra - simpler terms 
    for(let i = 0; i<row; i++){
        const INF = [];
        for(let j = 0; j<column; j++){
            INF.push(Infinity);
        }
        gScore.push(INF); //2D-matrix
    }
    gScore[source_coordinate.x][source_coordinate.y] = 0;

    pq.push({coordinate: source_coordinate, cost: 0 + heuristicValue(source_coordinate)});
    openSet.add(`${source_coordinate.x}-${source_coordinate.y}`);
    
    while(pq.length > 0){
        const {coordinate: current, cost: gScoreSoFar} = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);
        
        if(current.x === target_coordinate.x && current.y === target_coordinate.y){
            getPath(parentmap, target_coordinate);
            return;
        }
        closedSet.add(`${current.x}-${current.y}`);

        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1},
            {x:current.x, y:current.y+1}
        ];
        for(const neighbour of neighbours){
            const childkey = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) 
                && !openSet.has(childkey)
                && !closedSet.has(childkey)
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall'))
            {
                const edgeWeight = 1;
                const gScoreToNeighbour = gScore[current.x][current.y] + edgeWeight;
                const fScore = gScoreToNeighbour + heuristicValue(neighbour);

                if(gScoreToNeighbour < gScore[neighbour.x][neighbour.y]){
                    gScore[neighbour.x][neighbour.y] = gScoreToNeighbour;
                    pq.push({coordinate: neighbour, cost: fScore});
                    openSet.add(childkey);
                    parentmap.set(childkey, current)
                }
            }
        }
    }
}


// <<<----------*** DFS ALGORITHM ***--------->>>
const visited = new Set();
function DFS(current){
    if (matrix[source_coordinate.x][source_coordinate.y].classList.contains('wall') ||
        matrix[target_coordinate.x][target_coordinate.y].classList.contains('wall')) {
        console.log("Source or target is inside a wall!");
        return false;
    }
    if(current.x === target_coordinate.x && current.y === target_coordinate.y){
        return true;
    }
    
    visitedCell.push(matrix[current.x][current.y]);
    visited.add(`${current.x}-${current.y}`);
    
    const neighbours = [
        {x:current.x, y:current.y+1},
        {x:current.x+1, y:current.y},
        {x:current.x, y:current.y-1},
        {x:current.x-1, y:current.y},
    ];
    for(const neighbour of neighbours){
        if(isValid(neighbour.x, neighbour.y)
            && !visited.has(`${neighbour.x}-${neighbour.y}`) 
            && !matrix[neighbour.x][neighbour.y].classList.contains('wall'))
        {
            if(DFS(neighbour)){
                pathToAnimate.push(matrix[neighbour.x][neighbour.y]);
                return true;
            }
        }
    }
    return false;
}