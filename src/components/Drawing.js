var constants = require("../helpers/Constants.js");

const map_size = constants.map_size;
let padding = constants.block_padding;
let square_round = constants.block_round;

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
};

function drawGrid(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#bbaca1";
    ctx.fill();
    const square_size = (canvas.width - padding * (map_size + 1)) / map_size;

    //drawing grid
    for (let i = 0; i < map_size; i++) {
        for (let j = 0; j < map_size; j++) {
            const x = padding * (j + 1) + square_size * j;
            const y = padding * (i + 1) + square_size * i;

            ctx.roundRect(x, y, square_size, square_size, square_round);
            ctx.fillStyle = "#cdc1b5";
            ctx.fill();
        }
    }
}

function calculateText(width) {
    let fontSize = 60,
        fontBais = 20;
    if (width <= 500) {
        fontSize = Math.round((fontSize * width) / 500);
        fontBais = Math.round((fontBais * width) / 500);
        padding = Math.round((constants.block_padding * width) / 500);
        square_round = Math.round((constants.block_round * width) / 500);
    }
    return [fontSize, fontBais];
}

export function drawState(canvas, state, color_theme) {
    const ctx = canvas.getContext("2d");
    const [fontSize, fontBias] = calculateText(canvas.width);

    ctx.textAlign = "center";
    ctx.font = fontSize + "px Arial";
    const square_size = (canvas.width - padding * (map_size + 1)) / map_size;

    const playerColor = constants.player_color[color_theme];
    const playerTextColor = constants.player_text_color;
    const aiColor = constants.ai_color[color_theme];
    const aiTextColor = constants.ai_text_color;
    const wallColor = constants.wall_color;

    //drawing grid
    drawGrid(canvas);
    //drawing squares
    for (let i = 0; i < map_size; i++) {
        for (let j = 0; j < map_size; j++) {
            if (state[i * map_size + j] == 0) {
                continue;
            }
            const x = padding * (j + 1) + square_size * j;
            const y = padding * (i + 1) + square_size * i;

            ctx.roundRect(x, y, square_size, square_size, square_round);

            if (state[i * map_size + j] >= 100) {
                // 100이상은 벽
                ctx.fillStyle = wallColor;
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = square_size / 20;
                ctx.stroke();
            } else if (state[i * map_size + j] < 0) {
                //음수가 플레이어
                ctx.fillStyle = playerColor[-state[i * map_size + j]];
                ctx.fill();
                ctx.fillStyle = playerTextColor[-state[i * map_size + j]];
                ctx.fillText(-state[i * map_size + j], x + square_size / 2, y + square_size / 2 + fontBias);
            } else {
                ctx.fillStyle = aiColor[state[i * map_size + j]];
                ctx.fill();
                ctx.fillStyle = aiTextColor[state[i * map_size + j]];
                ctx.fillText(state[i * map_size + j], x + square_size / 2, y + square_size / 2 + fontBias);
            }
        }
    }
}

export function animationPath(canvas, state, paths, next_state, color_theme) {
    const ctx = canvas.getContext("2d");
    const [fontSize, fontBias] = calculateText(canvas.width);

    ctx.textAlign = "center";
    ctx.font = fontSize + "px Arial";
    const square_size = (canvas.width - padding * (map_size + 1)) / map_size;

    const playerColor = constants.player_color[color_theme];
    const playerTextColor = constants.player_text_color;
    const aiColor = constants.ai_color[color_theme];
    const aiTextColor = constants.ai_text_color;
    const wallColor = constants.wall_color;

    let frame = 40;
    let cur = 40;

    const animate = setInterval(() => {
        drawGrid(canvas);
        cur--;
        for (let i = 0; i < paths.length; i++) {
            //row col row col
            const val = state[paths[i][0] * map_size + paths[i][1]];
            const ratio = Math.pow(cur / frame, 1.7);

            const col = paths[i][1] * ratio + paths[i][3] * (1 - ratio);
            const row = paths[i][0] * ratio + paths[i][2] * (1 - ratio);
            const x = padding * (col + 1) + square_size * col;
            const y = padding * (row + 1) + square_size * row;

            ctx.roundRect(x, y, square_size, square_size, square_round);

            if (val >= 100) {
                // 100이상은 벽
                ctx.fillStyle = wallColor;
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = square_size / 20;
                ctx.stroke();
            } else if (val < 0) {
                // 음수가 플레이어
                ctx.fillStyle = playerColor[-val];
                ctx.fill();
                ctx.fillStyle = playerTextColor[-val];
                ctx.fillText(-val, x + square_size / 2, y + square_size / 2 + fontBias);
            } else {
                ctx.fillStyle = aiColor[val];
                ctx.fill();
                ctx.fillStyle = aiTextColor[val];
                ctx.fillText(val, x + square_size / 2, y + square_size / 2 + fontBias);
            }
        }
        if (cur == 0) {
            clearInterval(animate);
            drawState(canvas, next_state, color_theme);
        }
    }, 7);
}
