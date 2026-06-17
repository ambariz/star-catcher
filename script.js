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

const musicNewHighScore  = new Audio("assets/8_bit_level_complete.wav")
const musicGameStart = new Audio("assets/brass_level_start.wav")
const musicText = new Audio("assets/Text 1.wav")
const musicLevel1 = new Audio("assets/match_synth_1.wav")
const musicLevel2 = new Audio("assets/match_synth_2.wav")
const musicLevel3 = new Audio("assets/match_synth_3.wav")
const musicLevel4 = new Audio("assets/match_synth_4.wav")
const musicLevel5 = new Audio("assets/match_synth_5.wav")
const musicLevel6 = new Audio("assets/match_synth_6.wav")
const musicLevel7 = new Audio("assets/match_synth_7.wav")
const musicLevel8 = new Audio("assets/match_synth_8.wav")
const musicLevel9 = new Audio("assets/match_synth_9.wav")
const musicLevel10 = new Audio("assets/match_synth_10.wav")

const cometImage = new Image();
cometImage.src = "assets/comet.png";

const playerImage = new Image();
playerImage.src = "assets/player.png";

const shieldImage = new Image();
shieldImage.src = "assets/shield.png";

const items = [];
let score = 0;
let lives = 3; 
let gameOver = false;
let highScore = localStorage.getItem("highScore") || 0;
let newHighScoreReached = false;

let currentLevel = 1;


let gameStarted = false
let bigHands = false;
let powerUpTimer = 0;
let shieldActive = false;

let rgbFlash = false;
let rgbFlashTimer = 0;

function drawPlayer() {
    if (shieldActive)
    {
    ctx.drawImage(
        shieldImage,
        player.x - 20,
        player.y - 20,
        player.width + 40,
        player.height + 40
    );
    }
    ctx.drawImage( playerImage, player.x, player.y, player.width, player.height);

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

        if (item.isPowerUp) {
            ctx.drawImage(cometImage, item.x - 40, item.y - 40, 80, 80);
        }

        else if (item.isBad) {
            drawBadStar(item.x, item.y, 12);
        } 
        else if (item.isShield) {
            ctx.drawImage(
                shieldImage,
                item.x - 50,
                item.y - 50,
                40,
                40
            )
        }
        else {
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
    if (rgbFlash) {
        const colours = ["#ff0000", "#00ff00", "#0000ff"];
        ctx.fillStyle = colours[Math.floor(rgbFlashTimer / 5) % 3];
        ctx.fillRect(0,0, canvas.width, canvas.height);
        rgbFlashTimer--;
        if (rgbFlashTimer <= 0) {
            rgbFlash = false;
        }
        return;
    }
}

function updatePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (bigHands) {
        powerUpTimer--;
        if (powerUpTimer <= 0) {
            bigHands = false;
            player.width = 60;
            player.height = 60;
        }
    }
}

function drawPowerUpStatus() {
    if (bigHands) {
        ctx.fillStyle = "#00ffff";
        ctx.font = "bold 20px Arial";

        ctx.fillText("BIG HANDS ACTIVE!!", canvas.width / 2 - 90, 60);
    }
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
            
            if (item.isPowerUp) {
                bigHands = true;
                powerUpTimer = 500;
                player.width = 180;
                player.height = 70;
            }
            else if (item.isShield) {
                shieldActive = true;
            }
            else if (item.isBad) {
                if (shieldActive) {
                    shieldActive = false;
                }
                else {
                    lives--;
                }
            } 

            else {
                score++;

                const newLevel = Math.floor(score / 10) + 1;

                if (newLevel > currentLevel) {
                    currentLevel = newLevel;

                    switch (currentLevel) {
                        case 1: musicLevel1.play(); break;
                        case 2: musicLevel1.play(); break;
                        case 3: musicLevel1.play(); break;
                        case 4: musicLevel1.play(); break;
                        case 5: musicLevel1.play(); break;
                        case 6: musicLevel1.play(); break;
                        case 7: musicLevel1.play(); break;
                        case 8: musicLevel1.play(); break;
                        case 9: musicLevel1.play(); break;
                        case 10: musicLevel1.play(); break;
                    }
                }

                if (score > highScore)
                {
                    highScore = score;

                    localStorage.setItem("highScore", highScore)
                    
                    if (!newHighScoreReached) {
                        musicNewHighScore.currentTime = 0;
                        musicNewHighScore.play();

                        rgbFlash = true;
                        rgbFlashTimer = 120;
                        newHighScoreReached = true;
    
                    }
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
    const isPowerUp = Math.random() < 0.03;
    const isShield = !isPowerUp && Math.random() < 0.07;

    const item = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        radius: 20,
        dy: Math.random() * 2 + 2 + (score * 0.1),
        isPowerUp,
        isShield,
        isBad: !isPowerUp && !isShield && isBad
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
    drawPowerUpStatus();
    
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
        currentLevel = 1;
        gameOver = false;
        newHighScoreReached = false;
        bigHands = false;
        powerUpTimer = 0;
        shieldActive = false;
        items.length = 0;

        gameLoop();
    }

    if (e.code === "Space" && !gameStarted) {
        musicGameStart.play();
        musicText.play();
        gameStarted = true;
    }
});

document.addEventListener('keyup', () => {
    player.dx = 0;
});

setInterval(createItem, 1000);

gameLoop();