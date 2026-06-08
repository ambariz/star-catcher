const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// create a player object (looks like a python dictionary!!)
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    dx: 0
};

// store items to collect
const items = [];
let score = 0;
let lives = 3; 
let gameOver = false;

// draw your player
function drawPlayer() {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // draw a cuteee face
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 25, player.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawStar(x, y, size) {
    ctx.fillStyle = "#FFD700";

    ctx.beginPath();

    for (let i = 0; i < 5; i++) {
        let angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        let outerX = x + Math.cos(angle) * size;
        let outerY = y + Math.sin(angle) * size;

        let innerAngle = angle + Math.PI / 5;
        let innerX = x + Math.cos(innerAngle) * (size / 2);
        let innerY = y + Math.sin(innerAngle) * (size / 2);

        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);

        ctx.lineTo(innerX, innerY);
    }

    ctx.closePath();
    ctx.fill();
}

// draw the items
function drawItems() {
    items.forEach(item => {
        drawStar(item.x, item.y, 12);
    });
}

// draw your score
function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function drawLives() 
{
    ctx.fillStyle = "#fff";
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Lives: ' + lives, 10,60)
}

// update the player's position
function updatePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// update the items
function updateItems() {
    items.forEach((item, index) => {
        item.y += item.dy;
        // check if it collides with the player
        if (
            item.x > player.x &&
            item.x < player.x + player.width &&
            item.y > player.y &&
            item.y < player.y + player.height
        ) {
            items.splice(index, 1);
            score++;
        }
        
        // remove if it's off the screen
        if (item.y > canvas.height) {
            items.splice(index, 1);
            lives--;
        }

        if (lives <= 0)
        {
            gameOver = true;
        }
    });
}

// create items
function createItem() {
    const item = {
        x: Math.random() * (canvas.width - 20),
        y: -20,
        radius: 10,
        dy: Math.random() * 2 + 1
    };
    items.push(item);
}

// your main game loop
function gameLoop() {

    if (gameOver)
    {
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.fillText("GAME OVER", 80,280);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateItems();
    
    drawPlayer();
    drawItems();
    drawScore();
    drawLives();
    
    requestAnimationFrame(gameLoop);
}

// add some controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.dx = -5;
    if (e.key === 'ArrowRight') player.dx = 5;
});

document.addEventListener('keyup', () => {
    player.dx = 0;
});

// create items periodically
setInterval(createItem, 1000);

// start the game!
gameLoop();