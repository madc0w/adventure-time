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
const backgroundColor = '#c1e5be';
const doorSize = 0.1;
const doorwaySize = {
	width: 0.006,
	height: 0.04
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
	canvas.width = Math.min(innerWidth * 0.9, innerHeight * 0.9);
	canvas.height = canvas.width;
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
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	{
		// room background
		const roomBackground = new Image();
		roomBackground.src = `img/rooms/${state.room.backgroundImage}`;
		const x = (1 - state.room.width) * canvas.width / 2;
		const y = (1 - state.room.height) * canvas.height / 2;
		ctx.drawImage(roomBackground, x, y, state.room.width * canvas.width, state.room.height * canvas.height);
	}
	{
		// wall
		ctx.strokeStyle = state.room.wallColor;
		ctx.lineWidth = canvas.width * wallWidth;
		ctx.beginPath();
		const x = (1 - state.room.width) * canvas.width / 2;
		const y = (1 - state.room.height) * canvas.height / 2;
		ctx.rect(x, y, state.room.width * canvas.width, state.room.height * canvas.height);
		ctx.stroke();
	}
	{
		// doors
		for (const door of state.room.doors) {
			ctx.fillStyle = backgroundColor;
			let x, y;
			if (door.wall == 'w') {
				x = ((1 - state.room.width - wallWidth) / 2) * canvas.width - 1;
				y = ((1 - state.room.height) / 2 + (door.location * state.room.height)) * canvas.height;
				width = wallWidth * canvas.width + 1;
				height = doorSize * canvas.height;
			} else if (door.wall == 'e') {
				x = ((1 + state.room.width - wallWidth) / 2) * canvas.width;
				y = ((1 - state.room.height) / 2 + (door.location * state.room.height)) * canvas.height;
				width = wallWidth * canvas.width + 1;
				height = doorSize * canvas.height;
			} else if (door.wall == 'n') {
				x = ((1 - state.room.width) / 2 + (door.location * state.room.width)) * canvas.width;
				y = (1 - state.room.height - wallWidth) * canvas.height / 2 - 1;
				height = wallWidth * canvas.width + 1;
				width = doorSize * canvas.height;
			} else if (door.wall == 's') {
				x = ((1 - state.room.width) / 2 + (door.location * state.room.width)) * canvas.width;
				y = ((1 + state.room.height - wallWidth) / 2) * canvas.height;
				height = wallWidth * canvas.width + 4;
				width = doorSize * canvas.height;
			}
			ctx.fillRect(x, y, width, height);

			ctx.fillStyle = state.room.wallColor;
			if (['e', 'w'].includes(door.wall)) {
				ctx.fillRect(
					x - ((doorwaySize.height - wallWidth) / 2 * canvas.width),
					y,
					doorwaySize.height * canvas.width,
					doorwaySize.width * canvas.width
				);
				ctx.fillRect(
					x - ((doorwaySize.height - wallWidth) / 2 * canvas.width),
					y + doorSize * canvas.height,
					doorwaySize.height * canvas.width,
					doorwaySize.width * canvas.width
				);
			} else {
				ctx.fillRect(
					x,
					y - ((doorwaySize.width + wallWidth) * canvas.height),
					doorwaySize.width * canvas.width,
					doorwaySize.height * canvas.width
				);
				ctx.fillRect(
					x + (doorSize * canvas.width),
					y - ((doorwaySize.width + wallWidth) * canvas.height),
					doorwaySize.width * canvas.width,
					doorwaySize.height * canvas.width
				);
			}
		}
	}
	{
		// player
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
		state.player.y = Math.max((1 - state.room.height + state.player.height + wallWidth) / 2, state.player.y - inc);
	}
	if (keysDown.ArrowDown) {
		state.player.y = Math.min((1 + state.room.height - state.player.height - wallWidth) / 2, state.player.y + inc);
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
