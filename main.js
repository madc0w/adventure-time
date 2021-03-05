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
const doorSize = 0.15;
const doorThreshold = 0.04;
const doorwaySize = {
	width: 0.006,
	height: 0.04
};
const wallWidth = 0.01;
const moveIncrement = 0.006;

let throughDoor;
const playerImageStanding = new Image();
const playerImageLeft = new Image();
const playerImageRight = new Image();
let playerImage;
const keysDown = {};
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
				height = wallWidth * canvas.height + 1;
				width = doorSize * canvas.width;
			} else if (door.wall == 's') {
				x = ((1 - state.room.width) / 2 + (door.location * state.room.width)) * canvas.width;
				y = ((1 + state.room.height - wallWidth) / 2) * canvas.height;
				height = wallWidth * canvas.height + 4;
				width = doorSize * canvas.width;
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
		const edge = (1 - state.room.width + state.player.width + wallWidth) / 2;
		state.player.x = state.player.x - inc;
		if (state.player.x <= edge) {
			const playerPos = state.player.y - state.player.height / 2;
			let y1, y2;
			for (const door of state.room.doors.filter(d => d.wall == 'w')) {
				y1 = ((1 - state.room.height) / 2 + (door.location * state.room.height));
				y2 = y1 + doorSize - state.player.height;
				if (playerPos >= y1 && playerPos <= y2) {
					throughDoor = door;
					break;
				}
			}
			if (!throughDoor || throughDoor.wall != 'w') {
				state.player.x = edge;
			}
		}
	}
	if (keysDown.ArrowRight) {
		const edge = (1 + state.room.width - state.player.width - wallWidth) / 2;
		state.player.x = state.player.x + inc;
		if (state.player.x >= edge) {
			const playerPos = state.player.y - state.player.height / 2;
			for (const door of state.room.doors.filter(d => d.wall == 'e')) {
				const y1 = ((1 - state.room.height) / 2 + (door.location * state.room.height));
				const y2 = y1 + doorSize - state.player.height;
				if (playerPos >= y1 && playerPos <= y2) {
					throughDoor = door;
					break;
				}
			}
			if (!throughDoor || throughDoor.wall != 'e') {
				state.player.x = edge;
			}
		}
	}
	if (keysDown.ArrowUp) {
		const edge = (1 - state.room.height + state.player.height + wallWidth) / 2;
		state.player.y = state.player.y - inc;
		if (state.player.y <= edge) {
			const playerPos = state.player.x - state.player.width / 2;
			for (const door of state.room.doors.filter(d => d.wall == 'n')) {
				const x1 = ((1 - state.room.width) / 2 + (door.location * state.room.width));
				const x2 = x1 + doorSize - state.player.width;
				if (playerPos >= x1 && playerPos <= x2) {
					throughDoor = door;
					break;
				}
			}
			if (!throughDoor || throughDoor.wall != 'n') {
				state.player.y = edge;
			}
		}
	}
	if (keysDown.ArrowDown) {
		const edge = (1 + state.room.height - state.player.height - wallWidth) / 2;
		state.player.y = state.player.y + inc;
		if (state.player.y >= edge) {
			const playerPos = state.player.x - state.player.width / 2;
			for (const door of state.room.doors.filter(d => d.wall == 's')) {
				const x1 = ((1 - state.room.width) / 2 + (door.location * state.room.width));
				const x2 = x1 + doorSize - state.player.width;
				if (playerPos >= x1 && playerPos <= x2) {
					throughDoor = door;
					break;
				}
			}
			if (!throughDoor || throughDoor.wall != 's') {
				state.player.y = edge;
			}
		}
	}

	if (throughDoor) {
		const playerX1 = state.player.x - state.player.width / 2;
		const playerY1 = state.player.y - state.player.height / 2;
		const playerX2 = state.player.x + state.player.width / 2;
		const playerY2 = state.player.y + state.player.height / 2;
		const roomX1 = (1 - state.room.width + wallWidth) / 2;
		const roomY1 = (1 - state.room.height + wallWidth) / 2;
		const roomX2 = (1 + state.room.width + wallWidth) / 2;
		const roomY2 = (1 + state.room.height + wallWidth) / 2;
		if (playerX2 < roomX2 && playerX1 > roomX1 && playerY2 < roomY2 && playerY1 > roomY1) {
			throughDoor = null;
		}
	}
	// console.log('throughDoor', throughDoor);
	if (throughDoor) {
		if (['w', 'e'].includes(throughDoor.wall)) {
			const minY = (1 - state.room.height) / 2 + (throughDoor.location * state.room.height);
			const maxY = minY + doorSize;
			const playerY1 = state.player.y - state.player.height / 2;
			const playerY2 = state.player.y + state.player.height / 2;
			if (playerY2 > maxY) {
				state.player.y = maxY - state.player.height / 2;
			} else if (playerY1 < minY) {
				state.player.y = minY + state.player.height / 2;
			}

			const prevRoom = state.room;
			if (throughDoor.wall == 'w' && state.player.x < (1 - state.room.width - wallWidth) / 2 - doorThreshold) {
				state.room = rooms.find(r => r.id == throughDoor.roomId);
				const door = state.room.doors.find(d => d.wall == 'e' && d.roomId == prevRoom.id);
				state.player.x = (1 + state.room.width - state.player.width) / 2;
				state.player.y = (1 - state.room.height + doorSize) / 2 + (door.location * state.room.height);
				console.log(state.player.y)
			} else if (throughDoor.wall == 'e' && state.player.x > (1 + state.room.width + wallWidth) / 2 + doorThreshold) {
				state.room = rooms.find(r => r.id == throughDoor.roomId);
				const door = state.room.doors.find(d => d.wall == 'w' && d.roomId == prevRoom.id);
				state.player.x = (1 - state.room.width + state.player.width) / 2;
				state.player.y = (1 - state.room.height + doorSize) / 2 + (door.location * state.room.height);
				console.log(state.player.y)
			}
		} else {
			const minX = (1 - state.room.width) / 2 + (throughDoor.location * state.room.width);
			const maxX = minX + doorSize;
			const playerX1 = state.player.x - state.player.width / 2;
			const playerX2 = state.player.x + state.player.width / 2;
			if (playerX2 > maxX) {
				state.player.x = maxX - state.player.width / 2;
			} else if (playerX1 < minX) {
				state.player.x = minX + state.player.width / 2;
			}
		}
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
