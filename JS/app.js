
//<<------Board Creation and Updation-------->>
const board = document.getElementById('board');
var cells;
let row, column;
var matrix;
let source_coordinate;
let target_coordinate;

renderBoard();

function renderBoard(cellWidth=22){ 
    
    const root=document.documentElement;  //updating cell-width in CSS
    root.style.setProperty('--cell-width', `${cellWidth}px`)
    
    row = Math.floor(board.clientHeight / cellWidth);
    column = Math.floor(board.clientWidth / cellWidth);
    
    board.innerHTML = ''; //clearing board
    cells = [];
    matrix = [];
    
    for(let i=0; i<row; i++){
        const rowArr = [];
        const rowElement=document.createElement('div');
        rowElement.classList.add('row');
        rowElement.setAttribute('id', `${i}`);
        
        for(let j=0; j<column; j++){
            const colElement=document.createElement('div');
            colElement.classList.add('column');
            colElement.setAttribute('id', `${i}-${j}`);
            
            cells.push(colElement);
            rowArr.push(colElement)
            rowElement.appendChild(colElement);
        }
        matrix.push(rowArr);
        board.appendChild(rowElement);
    }

    source_coordinate = set('source');
    target_coordinate = set('target');
    boardInteractions(cells);
}


//<<------Button Interactions-------->>
const navOptions = document.querySelectorAll('.nav-menu>li>a');
let dropOptions = null;

const removeActive = (elements, parent = false)=>{
    elements.forEach(element => {
        if(parent) element = element.parentElement; //from a(navOption) to li
        element.classList.remove('active');
    });
}

navOptions.forEach(navOption =>{
    navOption.addEventListener('click', ()=>{
        const li = navOption.parentElement; //from a(navOption) to li, on clicking i-link
        if(li.classList.contains('active')){
            li.classList.remove('active');
            return;
        }
        removeActive(navOptions,true);
        li.classList.add('active');
        if(li.classList.contains('drop-box')){
            dropOptions=li.querySelectorAll('.drop-menu>li') //inner li
            click_dropOptions(navOption.innerText);
        }
    })
})

let pixelSize = 22;
let speed = 'Normal';
let algorithm = 'BFS';
const visualizeBtn= document.getElementById('visualizeBtn');

function click_dropOptions(target){
    dropOptions.forEach(dropOption=>{
        dropOption.addEventListener('click', ()=>{
            
            removeActive(dropOptions);
            dropOption.classList.add('active');

            if(target === 'Pixel'){
                pixelSize = +dropOption.innerText.replace('px', '');
                renderBoard(pixelSize);
            }
            else if(target === 'Speed')
                speed = dropOption.innerText;
            else if(target === 'Algorithms'){
                algorithm = dropOption.innerText.split(' ')[0]; //you only want first word of algorithm
                visualizeBtn.innerText = `VISUALIZE - ${algorithm}`;
            }

            removeActive(navOptions, true);
        })
    })
}

document.addEventListener('click', (e)=>{        //when you click somewhere else
    const navMenu = document.querySelector('.nav-menu');
    if(!navMenu.contains(e.target)){
        removeActive(navOptions, true);
    }
})


const clearPathBtn = document.getElementById('clearPathBtn');
const clearBoardBtn = document.getElementById('clearBoardBtn');

clearPathBtn.addEventListener('click', clearPath);
clearBoardBtn.addEventListener('click', clearBoard);

function clearPath() {
    cells.forEach(cell=>{
        cell.classList.remove('path');
        cell.classList.remove('visited');
    })
}

function clearBoard() {
    cells.forEach(cell=>{
        cell.classList.remove('wall');
        cell.classList.remove('path');
        cell.classList.remove('visited');
    })
}

//<<------Board Interactions-------->>
function isValid(x, y){
    return (x>=0 && y>=0 && x<row && y<column); 
}
function set(className, x = -1, y = -1){
    if(isValid(x, y)){
        matrix[x][y].classList.add(className);
    }else{
        x = Math.floor(Math.random() * row);
        y = Math.floor(Math.random() * column);
        matrix[x][y].classList.add(className);
    }
    return {x, y};
}

let isDrawing = false;
let isDragging = false;
let DragPoint = null;

function boardInteractions(cells){
    cells.forEach((cell)=>{
        const pointerdown = (e)=>{
            if(e.target.classList.contains('source')){
                DragPoint = 'source';
                isDragging = true;
            }else if(e.target.classList.contains('target')){
                DragPoint = 'target';
                isDragging = true;
            }else{
                isDrawing = true;
            }
        }

        const pointermove = (e)=>{
            if(isDrawing){
                e.target.classList.add('wall');
            }
            else if(DragPoint && isDragging){    
                document.querySelector(`.${DragPoint}`).classList.remove(`${DragPoint}`)
                
                e.target.classList.add(`${DragPoint}`);
                
                coordinate = e.target.id.split('-');
                if(DragPoint === 'source'){
                    source_coordinate.x = +coordinate[0];
                    source_coordinate.y = +coordinate[1];
                }else{
                    target_coordinate.x = +coordinate[0];
                    target_coordinate.y = +coordinate[1];
                }
            }
        }

        const pointerup = ()=>{
            isDragging = false;
            isDrawing = false;
            DragPoint = null; 
        }
        cell.addEventListener('pointerdown', pointerdown);
        cell.addEventListener('pointermove', pointermove);
        cell.addEventListener('pointerup', pointerup);
        cell.addEventListener('click', ()=>{
            cell.classList.toggle('wall');
        })
    })
}


//<<------Visualization Controls-------->>
document.getElementById('pauseBtn').addEventListener('click', pauseAnimation);
document.getElementById('resumeBtn').addEventListener('click', resumeAnimation);
document.getElementById('stopBtn').addEventListener('click', stopAnimation);

let animationDelay = 10; // base delay in ms
let animationTimer = null;
let isPaused = false;
let animationIndex = 0;

function getSpeedMultiplier() {
    switch (speed) {
        case 'Slow': return 100;
        case 'Fast': return 20;
        default: return 50; // Normal
    }
}

function animate(elements, className) {
    clearTimeout(animationTimer);
    animationDelay = getSpeedMultiplier();
    animationIndex = 0;
    isPaused = false;

    function step() {
        if (isPaused || animationIndex >= elements.length) return;

        const el = elements[animationIndex];
        el.classList.remove('visited');
        el.classList.add(className);

        animationIndex++;

        if (animationIndex === elements.length && className === 'visited') {
            animate(pathToAnimate, 'path');
        } else {
            animationTimer = setTimeout(step, animationDelay);
        }
    }

    step();
}

function pauseAnimation() {
    isPaused = true;
    clearTimeout(animationTimer);
}

function resumeAnimation() {
    if (!isPaused) return;
    isPaused = false;
    animateContinue();
}

function animateContinue() {
    animationTimer = setTimeout(() => {
        animateStep();
    }, animationDelay);
}

function stopAnimation() {
    isPaused = false;
    clearTimeout(animationTimer);
    animationIndex = 0;
    visitedCell = [];
    pathToAnimate = [];
    clearPath();
}

function animateStep() {
    if (isPaused || animationIndex >= visitedCell.length) return;
    const el = visitedCell[animationIndex];
    el.classList.remove('visited');
    el.classList.add('visited');
    animationIndex++;
    animationTimer = setTimeout(() => animateStep(), animationDelay);
}
