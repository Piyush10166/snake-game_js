const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const restartButton = document.querySelector('.btn-restart');

const highScoreElement = document.querySelector('#high-score');
const scoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');

let blockHeight = 50;
let blockWidth = 50;

if (window.innerWidth <= 480) {  // phones
    blockHeight = 25;
    blockWidth = 25;
}

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let score = 0;
let time = `00:00`;
highScoreElement.innerText = highScore;

let rows, cols;

let intervalId = null;
let timeIntervalId = null;

let isPaused = false;
let isGameRunning = false;


let food = null;

const blocks = [];
let snake = [];

let direction = 'right';

function buildBoard() {
    board.innerHTML = '';
    blocks.length = 0;

    cols = Math.floor(board.clientWidth / blockWidth);
    rows = Math.floor(board.clientHeight / blockHeight);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const block = document.createElement('div');
            block.classList.add("block");
            board.appendChild(block);
            blocks[`${row}-${col}`] = block;
        }
    }
    snake = [{ x: 1, y: 3 }];
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
}
buildBoard();

function render() {

    let head = null

    blocks[`${food.x}-${food.y}`].classList.add('food');

    if (direction === 'left') {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    }
    else if (direction === 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    }
    else if (direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y };
    }
    else if (direction === 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y };
    }

    // wall collision
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId);
        clearInterval(timeIntervalId);

        modal.style.display = 'flex';
        startGameModal.style.display = 'none';
        gameOverModal.style.display = 'flex';
        return;
    }
    // food consumption
    if (head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove('food')
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
        blocks[`${food.x}-${food.y}`].classList.add('food')
        snake.unshift(head);

        score += 10;
        scoreElement.innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
        }

    }

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill', 'head');
    })

    snake.unshift(head);
    snake.pop();

    snake.forEach((segment, index) => {
        if (index === 0) {
            blocks[`${segment.x}-${segment.y}`].classList.add('head');
        } else {
            blocks[`${segment.x}-${segment.y}`].classList.add('fill');
        }
    })
}

function togglePause() {
    if (!isGameRunning) return;

    if (!isPaused) {
        // PAUSE
        clearInterval(intervalId);
        clearInterval(timeIntervalId);

        isPaused = true;

        modal.style.display = 'flex';
        startGameModal.style.display = 'flex';
        gameOverModal.style.display = 'none';

        startGameModal.querySelector('h3').innerText = 'Game Paused';
        startButton.innerText = 'Resume Game';
    } else {
        // RESUME
        modal.style.display = 'none';

        intervalId = setInterval(() => { render(); }, 100);
        timeIntervalId = setInterval(() => {
            let [min, sec] = time.split(':').map(Number);

            sec++;
            if (sec === 60) {
                min++;
                sec = 0;
            }

            const mm = String(min).padStart(2, '0');
            const ss = String(sec).padStart(2, '0');

            time = `${mm}:${ss}`;
            timeElement.innerText = time;
        }, 1000);

        isPaused = false;
    }
}

startButton.addEventListener("click", () => {
    modal.style.display = 'none';

    isPaused = false;
    isGameRunning = true;
    
    intervalId = setInterval(() => { render(); }, 100);

    timeIntervalId = setInterval(() => {
        let [min, sec] = time.split(':').map(Number);

        sec++;
        if (sec === 60) {
            min++;
            sec = 0;
        }

        const mm = String(min).padStart(2, '0');
        const ss = String(sec).padStart(2, '0');

        time = `${mm}:${ss}`;
        timeElement.innerText = time;
    }, 1000);
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
    blocks[`${food.x}-${food.y}`].classList.remove('food')
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill', 'head');
    })
    score = 0;
    time = `00:00`

    scoreElement.innerText = score;
    timeElement.innerText = time;
    highScoreElement.innerText = highScore;

    modal.style.display = 'none';

    direction = 'right';
    snake =[{ x: 1, y: 3 }]
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
    intervalId = setInterval(() => { render(); }, 100)
    timeIntervalId = setInterval(() => {
        let [min, sec] = time.split(':').map(Number);

        sec++;
        if (sec === 60) {
            min++;
            sec = 0;
        }

        const mm = String(min).padStart(2, '0');
        const ss = String(sec).padStart(2, '0');

        time = `${mm}:${ss}`;
        timeElement.innerText = time;
    }, 1000);
}



addEventListener('keydown', (event) => {
    // const key = event.key.toLowerCase();

    if (event.key === 'Escape') {
        togglePause();
    }

    if (!isGameRunning || isPaused) return;

    if (event.key === 'ArrowLeft' || event.key === 'a') {
        direction = 'left'
    }
    else if (event.key === 'ArrowRight' || event.key === 'd') {
        direction = 'right';
    }
    else if (event.key === 'ArrowUp' || event.key === 'w') {
        direction = 'up';
    }
    else if (event.key === 'ArrowDown' || event.key === 's') {
        direction = 'down';
    }
});

window.addEventListener('resize', () => {
    blockHeight = window.innerWidth <= 480 ? 25 : 50;
    blockWidth = window.innerWidth <= 480 ? 25 : 50;

    clearInterval(intervalId);
    clearInterval(timeIntervalId);

    modal.style.display = 'flex';
    startGameModal.style.display = 'flex';
    gameOverModal.style.display = 'none';

    score = 0;
    time = '00:00';
    scoreElement.innerText = score;
    timeElement.innerText = time;

    direction = 'right';

    buildBoard();

});