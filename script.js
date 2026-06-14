const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = {
    x: 200,
    y: 500,
    width: 60,
    height: 60,
    dx: 0
};
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.y = canvas.height - 80;

    player.x = canvas.width / 2 - player.width / 2;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas)



const items = [];
let score = 0;
let lives = 3; 
let gameOver = false;
let highScore = localStorage.getItem("highScore") || 0;

let gameStarted = false



function drawPlayer() {
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        20,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player.x + 8, player.y + 10);
    ctx.lineTo(player.x + 15, player.y - 8);
    ctx.lineTo(player.x + 22, player.y + 10);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player.x + 32, player.y + 10);
    ctx.lineTo(player.x + 25, player.y - 8);
    ctx.lineTo(player.x + 18, player.y + 10);
    ctx.fill();

    ctx.fillStyle = "#000";

    ctx.beginPath();
    ctx.arc(player.x + 14, player.y + 18, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath(); 
    ctx.arc(player.x + 26, player.y + 18, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 24, 5, 0, Math.PI);
    ctx.stroke();
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

function drawLevel() {
    const level = Math.floor(score / 10) +1;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Level: "+ level, canvas.width / 2 - 40, 30);
}

function drawBadStar(x, y, size) {
    ctx.fillStyle = "#ff0000";

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

function drawItems() {
    items.forEach(item => {

        if (item.isBad) {
            drawBadStar(item.x, item.y, 12);
        } else {
            drawStar(item.x, item.y, 12);
        }

    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText("Best: " + highScore, 10, 60);
}

function drawLives() 
{
    ctx.fillStyle = "#fff";
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Lives: ' + lives, canvas.width - 85, 30)
}

function drawBackground() 
{
    let gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0, "#0f172a")
    gradient.addColorStop(1, "#1e40af")

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0, canvas.width, canvas.height);

    ctx.fillStyle = "white";

    for (let i = 0; i<40; i++)
    {
        ctx.beginPath();
        ctx.arc( 
            (i*37) % canvas.width,
            (i * 83) % canvas.height,
            1.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function updatePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function drawWelcome() {
    drawBackground();

    ctx.fillStyle = "#fbfbfb"
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("STAR CATCHER", canvas.width / 2, canvas.height /2 - 50);
    ctx.fillStyle = "#ffffff"
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Catch the stars, avoid the red ones!", canvas.width / 2, canvas.height /2 + 10);
    ctx.font = "24px Arial";
    ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height /2 + 80);
    ctx.textAlign = "left";
}

function updateItems() {
    items.forEach((item, index) => {
        item.y += item.dy;

        if (
            item.x > player.x &&
            item.x < player.x + player.width &&
            item.y > player.y &&
            item.y < player.y + player.height
        ) {
            items.splice(index, 1);

            if (item.isBad) {
                lives--;
            } 
            else {
                score++;

                if (score > highScore)
                {
                    highScore = score;

                    localStorage.setItem("highScore", highScore)
                };
            }
        }

        if (item.y > canvas.height) {
            items.splice(index, 1);
        }

        if (lives <= 0) {
            gameOver = true;
        }
    });
}

function createItem() 
{
    const badStarChance = Math.min(0.20 + (score * 0.015), 0.80);
    const isBad = Math.random() < badStarChance;
    const item = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        radius: 20,
        dy: Math.random() * 2 + 2 + (score * 0.1),
        isBad: isBad
    };

    items.push(item);
}

function gameLoop() {

    if (!gameStarted) {
        drawWelcome();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver)
    {
        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font = "bold 40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 50);

        ctx.textAlign = "left";

        return;
    }

    drawBackground();
    
    updatePlayer();
    updateItems();
    
    drawPlayer();
    drawItems();
    drawScore();
    drawLevel();
    drawLives();
    
    requestAnimationFrame(gameLoop);


}

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        player.dx = -5;
    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        player.dx = 5;
    }

    if ((e.key === "r" || e.key === "R") && gameOver) {

        score = 0;
        lives = 3;
        gameOver = false;
        items.length = 0;

        gameLoop();
    }

    if (e.code === "Space" && !gameStarted) {
        gameStarted = true;
    }
});

document.addEventListener('keyup', () => {
    player.dx = 0;
});

setInterval(createItem, 1000);

gameLoop();