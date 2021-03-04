const state = {
	player: {
		x: 0.5,
		y: 0.5,
		width: 0.05,
		height: 0.1,
		orientation: 0,
	},
	room: rooms[0],
};
const wallWidth = 0.01;
const playerImageStanding = new Image();
const playerImageLeft = new Image();
const playerImageRight = new Image();
let playerImage;
const keysDown = {};
const moveIncrement = 0.006;
let canvas, ctx;

function load() {
	canvas = document.getElementById('game-canvas');
	canvas.width = innerWidth * 0.9;
	canvas.height = innerHeight * 0.9;
	ctx = canvas.getContext('2d');

	playerImageStanding.src = 'img/player standing.png';
	playerImageLeft.src = 'img/player left.png';
	playerImageRight.src = 'img/player right.png';
	playerImage = playerImageStanding;

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	requestAnimationFrame(draw);
}

function draw() {
	ctx.fillStyle = '#c1e5be';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	{
		const roomBackground = new Image();
		roomBackground.src = `img/rooms/${state.room.backgroundImage}`;
		const x = (1 - state.room.width) * canvas.width / 2;
		const y = (1 - state.room.height) * canvas.height / 2;
		ctx.drawImage(roomBackground, x, y, state.room.width * canvas.width, state.room.height * canvas.height);
	}
	{
		ctx.strokeStyle = state.room.wallColor;
		ctx.lineWidth = canvas.width * wallWidth;
		ctx.beginPath();
		const x = (1 - state.room.width) * canvas.width / 2;
		const y = (1 - state.room.height) * canvas.height / 2;
		ctx.rect(x, y, state.room.width * canvas.width, state.room.height * canvas.height);
		ctx.stroke();
	}
	{
		const x = (state.player.x - state.player.width / 2) * canvas.width;
		const y = (state.player.y - state.player.height / 2) * canvas.height;
		ctx.drawImage(playerImage, x, y, state.player.width * canvas.width, state.player.height * canvas.height);
	}

	let numKeysDown = 0;
	for (const key in keysDown) {
		if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(key)) {
			numKeysDown++;
		}
	}
	let inc = moveIncrement;
	if (numKeysDown == 2) {
		inc /= Math.sqrt(2);
	}

	if (keysDown.ArrowLeft) {
		state.player.x = Math.max((1 - state.room.width + state.player.width) / 2, state.player.x - inc);
	}
	if (keysDown.ArrowRight) {
		state.player.x = Math.min((1 + state.room.width - state.player.width) / 2, state.player.x + inc);
	}
	if (keysDown.ArrowUp) {
		state.player.y = Math.max((1 - state.room.height + state.player.height) / 2, state.player.y - inc);
	}
	if (keysDown.ArrowDown) {
		state.player.y = Math.min((1 + state.room.height - state.player.height) / 2, state.player.y + inc);
	}

	requestAnimationFrame(draw);
}

function onKeyUp(e) {
	delete keysDown[e.code];
	if (Object.keys(keysDown).length == 0) {
		playerImage = playerImageStanding;
	}
}

function onKeyDown(e) {
	// if (gameEndTime && new Date() - gameEndTime > gameEndDelay) {
	// 	init();
	// } else {
	// }
	keysDown[e.code] = true;
	if (keysDown.ArrowLeft) {
		playerImage = playerImageLeft;
	} else if (keysDown.ArrowRight) {
		playerImage = playerImageRight;
	}
}
