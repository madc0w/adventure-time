const state = {
	player: {
		x: 0.5,
		y: 0.5,
		health: 1,
	},
	inventory: {},
	room: rooms[0],
};
const wallColor = '#3f2f0c';
const backgroundColor = '#c1e5be';
const doorSize = 0.15;
const doorThreshold = 0.04;
const doorwaySize = {
	width: 0.006,
	height: 0.04
};
const wallWidth = 0.01;
const moveIncrement = 0.006;

const mapBackgroundColor = '#e2e2b1';
const mapRoomColor = '#a5a5a4';
const mapPassageColor = '#ccd';
const mapMargin = 0.02;
const mapScale = 0.24;
const mappedRooms = [rooms[0]];

const portalSize = 0.12;
const portalAnimInterval = 60;
const numPortalFrames = 38;

const fontFamily = 'Jura';

let drawFunc = drawGame;
const characterFrames = {};
const keysDown = {};
const animIntervalIds = {};
const animFrameNums = {};
const characterImages = {};
const portalFrames = [];
let throughDoor, canvas, ctx, statusCanvas, statusCtx, portalImage;

function load() {
	// Object.prototype.originalValueOf = Object.prototype.valueOf;
	// Object.prototype.valueOf = function () {
	// 	if (typeof this !== 'number') {
	// 		throw new Error('Object is not a Number');
	// 	}
	// 	return this.originalValueOf();
	// };

	canvas = document.getElementById('game-canvas');
	statusCanvas = document.getElementById('status-canvas');
	canvas.width = Math.min(innerWidth * 0.8, innerHeight * 0.8);
	canvas.height = canvas.width;
	statusCanvas.width = canvas.width;
	statusCanvas.height = innerHeight * 0.12;
	ctx = canvas.getContext('2d');
	statusCtx = statusCanvas.getContext('2d');

	for (const character in characters) {
		characterFrames[character] = {
			standing: [],
			left: [],
			right: [],
			up: [],
			down: [],
		};

		for (const key in characterFrames[character]) {
			for (const fileName of characters[character][key] || []) {
				const img = new Image();
				img.src = `img/charactes/${fileName}`;
				characterFrames[character][key].push(img);
			}
		}
	}

	characterImages.player = characterFrames.player.standing[0];

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	for (const itemKey in items) {
		const image = new Image();
		image.src = `img/items/${items[itemKey].image}`;
		items[itemKey].image = image;
	}

	for (let i = 1; i <= numPortalFrames; i++) {
		const image = new Image();
		image.src = `img/rooms/portal-frames/portal-${(i < 10 ? '0' : '') + i}.png`;
		portalFrames.push(image);
	}
	let portalFrameNum = 0;
	setInterval(() => {
		portalImage = portalFrames[portalFrameNum];
		portalFrameNum++;
		if (portalFrameNum >= portalFrames.length) {
			portalFrameNum = 0;
		}
	}, portalAnimInterval);

	for (const room of rooms) {
		for (const door of room.doors || []) {
			door.room = rooms.find(r => r.id == door.roomId);
		}
		for (const character of room.characters || []) {
			character.motion = 'standing';
			animate(character);
		}
	}

	for (const room of rooms) {
		for (const door of room.doors || []) {
			const wall = {
				n: 's',
				s: 'n',
				e: 'w',
				w: 'e'
			}[door.wall];
			const location = door.location;

			const oppositeDoor = {
				room,
				wall,
				location,
				oppositeDoor: door,
			};
			if (door.isOneWay) {
				// TODO add a special hidden door for map
			} else {
				door.room.doors.push(oppositeDoor);
				door.oppositeDoor = oppositeDoor;
			}
		}
	}
	// console.log(rooms);

	requestAnimationFrame(draw);
}

function draw() {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawFunc();
	drawStatus();
	requestAnimationFrame(draw);
}

function drawStatus() {
	statusCtx.fillStyle = backgroundColor;
	statusCtx.fillRect(0, 0, statusCanvas.width, statusCanvas.height);
	const fontSize = 0.2 * statusCanvas.height;
	statusCtx.font = `${fontSize}px ${fontFamily}`;
	statusCtx.fillStyle = '#000';
	statusCtx.fillText('Health', 0.1 * statusCanvas.width, 0.24 * statusCanvas.height);

	statusCtx.fillStyle = '#444';
	statusCtx.fillRect(0.3 * statusCanvas.width, 0.14 * statusCanvas.height, 0.6 * statusCanvas.width, 0.1 * statusCanvas.height);
	statusCtx.fillStyle = '#a44';
	statusCtx.fillRect(0.3 * statusCanvas.width, 0.14 * statusCanvas.height, 0.6 * state.player.health * statusCanvas.width, 0.1 * statusCanvas.height);

	let i = 0;
	for (const id in state.inventory) {
		if (items[id].type == 'weapon') {
			const size = 0.08;
			const x = (0.04 + i * 0.1) * statusCanvas.width;
			const y = 0.4 * statusCanvas.height;
			const width = size * statusCanvas.width;
			const height = size * statusCanvas.width;
			if (state.player.selectedWeapon == id) {
				statusCtx.strokeStyle = '#f00';
				statusCtx.lineWidth = 2;
				statusCtx.beginPath();
				statusCtx.rect(x - 8, y - 8, width + 16, height + 16);
				statusCtx.stroke();
			}
			statusCtx.drawImage(items[id].image, x, y, width, width);
			i++;
		}
	}
}

function drawGame() {
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
		ctx.strokeStyle = state.room.wallColor || wallColor;
		ctx.lineWidth = canvas.width * wallWidth;
		ctx.beginPath();
		const x = (1 - state.room.width) * canvas.width / 2;
		const y = (1 - state.room.height) * canvas.height / 2;
		ctx.rect(x, y, state.room.width * canvas.width, state.room.height * canvas.height);
		ctx.stroke();
	}
	{
		// portals
		for (const portal of state.room.portals || []) {
			const x = ((1 - state.room.width) / 2 + (portal.location.x * state.room.width)) * canvas.width;
			const y = ((1 - state.room.height) / 2 + (portal.location.y * state.room.height)) * canvas.height;
			ctx.drawImage(portalImage, x, y, portalSize * canvas.width, portalSize * canvas.height);
		}
	}
	{
		// items
		for (const roomItem of state.room.items || []) {
			const item = items[roomItem.id];
			let x = ((1 - state.room.width) / 2 + (roomItem.location.x * state.room.width)) * canvas.width;
			let y = ((1 - state.room.height) / 2 + (roomItem.location.y * state.room.height)) * canvas.height;
			let size = item.size;
			if (roomItem.animStep) {
				size -= roomItem.animStep * item.size / 16;
				x += (item.size - size) * canvas.width / 2;
				y += (item.size - size) * canvas.height / 2;
				ctx.globalAlpha = (12 - roomItem.animStep) / 12;
			}
			// console.log(item.image.width / item.image.height);
			if (size > 0) {
				ctx.drawImage(item.image, x, y, (size * item.image.width / item.image.height) * canvas.width, size * canvas.height);
			}
			ctx.globalAlpha = 1;
		}
	}
	{
		// characters
		for (const roomCharacter of state.room.characters || []) {
			roomCharacter.velInversionTime = roomCharacter.velInversionTime || {};

			const character = characters[roomCharacter.id];
			character.move(roomCharacter);
			// console.log(roomCharacter.width * state.room.width);
			for (const roomCharacter2 of (state.room.characters || []).concat(state.player)) {
				if (roomCharacter != roomCharacter2) {
					character.interact(roomCharacter, roomCharacter2);
				}
			}

			if (roomCharacter.location.x < 0 || roomCharacter.location.x > 1 - (character.width / state.room.width)) {
				roomCharacter.vel.x *= -1;
				// roomCharacter.velInversionTime.x = now;
			}
			if (roomCharacter.location.y < 0 || roomCharacter.location.y > 1 - (character.height / state.room.height)) {
				roomCharacter.vel.y *= -1;
				// roomCharacter.velInversionTime.y = now;
			}
			// roomCharacter.location.x = Math.min(1 - (character.width / state.room.width), roomCharacter.location.x);
			// roomCharacter.location.x = Math.max(0, roomCharacter.location.x);
			// roomCharacter.location.y = Math.min(1 - (character.height / state.room.height), roomCharacter.location.y);
			// roomCharacter.location.y = Math.max(0, roomCharacter.location.y);

			const x = ((1 - state.room.width) / 2 + (roomCharacter.location.x * state.room.width)) * canvas.width;
			const y = ((1 - state.room.height) / 2 + (roomCharacter.location.y * state.room.height)) * canvas.height;
			ctx.drawImage(characterImages[roomCharacter.id], x, y, character.width * canvas.width, character.height * canvas.height);
			// ctx.fillStyle = '#f00';
			// ctx.fillRect(x, y, 4, 4);
		}
	}
	{
		// doors
		for (const door of state.room.doors || []) {
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

			ctx.fillStyle = state.room.wallColor || wallColor;
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
		const x = (state.player.x - characters.player.width / 2) * canvas.width;
		const y = (state.player.y - characters.player.height / 2) * canvas.height;
		ctx.drawImage(characterImages.player, x, y, characters.player.width * canvas.width, characters.player.height * canvas.height);
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
		const edge = (1 - state.room.width + characters.player.width + wallWidth) / 2;
		state.player.x = state.player.x - inc;
		if (state.player.x <= edge) {
			const playerPos = state.player.y - characters.player.height / 2;
			let y1, y2;
			for (const door of (state.room.doors || []).filter(d => d.wall == 'w')) {
				y1 = ((1 - state.room.height) / 2 + (door.location * state.room.height));
				y2 = y1 + doorSize - characters.player.height;
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
		const edge = (1 + state.room.width - characters.player.width - wallWidth) / 2;
		state.player.x = state.player.x + inc;
		if (state.player.x >= edge) {
			const playerPos = state.player.y - characters.player.height / 2;
			for (const door of (state.room.doors || []).filter(d => d.wall == 'e')) {
				const y1 = ((1 - state.room.height) / 2 + (door.location * state.room.height));
				const y2 = y1 + doorSize - characters.player.height;
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
		const edge = (1 - state.room.height + characters.player.height + wallWidth) / 2;
		state.player.y = state.player.y - inc;
		if (state.player.y <= edge) {
			const playerPos = state.player.x - characters.player.width / 2;
			for (const door of (state.room.doors || []).filter(d => d.wall == 'n')) {
				const x1 = ((1 - state.room.width) / 2 + (door.location * state.room.width));
				const x2 = x1 + doorSize - characters.player.width;
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
		const edge = (1 + state.room.height - characters.player.height - wallWidth) / 2;
		state.player.y = state.player.y + inc;
		if (state.player.y >= edge) {
			const playerPos = state.player.x - characters.player.width / 2;
			for (const door of (state.room.doors || []).filter(d => d.wall == 's')) {
				const x1 = ((1 - state.room.width) / 2 + (door.location * state.room.width));
				const x2 = x1 + doorSize - characters.player.width;
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

	// go through portal
	for (const portal of state.room.portals || []) {
		const x = (1 - state.room.width) / 2 + (portal.location.x * state.room.width) + (portalSize * 0.1);
		const y = (1 - state.room.height) / 2 + (portal.location.y * state.room.height) + (portalSize * 0.1);
		// ctx.strokeStyle = '#000';
		// ctx.lineWidth = 2;
		// ctx.beginPath();
		// ctx.rect(x * canvas.width, y * canvas.height, portalSize * 0.8 * canvas.width, portalSize * 0.8 * canvas.height);
		// ctx.stroke();

		// ctx.fillStyle = '#f00';
		// ctx.fillRect(state.player.x * canvas.width, state.player.y * canvas.height, 2, 2);
		if (state.player.x > x && state.player.x < x + portalSize * 0.8 &&
			state.player.y > y && state.player.y < y + portalSize * 0.8) {
			state.room = rooms.find(r => r.id == portal.roomId);
			state.player.x = state.player.y = 0.5;
		}
	}

	// pick up an item
	let i = 0;
	for (const roomItem of state.room.items || []) {
		const x = (1 - state.room.width) / 2 + (roomItem.location.x * state.room.width);
		const y = (1 - state.room.height) / 2 + (roomItem.location.y * state.room.height);

		const itemSize = items[roomItem.id].size;
		if (!roomItem.takeAnimIntervalId &&
			state.player.x < x + itemSize && state.player.x > x - itemSize &&
			state.player.y < y + itemSize && state.player.y > y - itemSize) {

			const interval = 24;
			const numSteps = 12;
			roomItem.animStep = 0;
			roomItem.takeAnimIntervalId = setInterval(() => {
				roomItem.animStep++;
			}, interval);
			const n = i;
			setTimeout(() => {
				// console.log('before state.room.items', state.room.items);
				clearInterval(roomItem.takeAnimIntervalId);
				state.room.items.splice(n, 1);
				// console.log('after state.room.items', state.room.items);
			}, interval * numSteps);
			if (!state.inventory[roomItem.id]) {
				state.inventory[roomItem.id] = 0;
			}
			const item = items[roomItem.id];
			state.inventory[roomItem.id] += item.value;
		}
		i++;
	}

	if (throughDoor) {
		const playerX1 = state.player.x - characters.player.width / 2;
		const playerY1 = state.player.y - characters.player.height / 2;
		const playerX2 = state.player.x + characters.player.width / 2;
		const playerY2 = state.player.y + characters.player.height / 2;
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
		function goThroughDoor() {
			state.room = throughDoor.room;
			if (!mappedRooms.includes(state.room)) {
				mappedRooms.push(state.room);
				// console.log(mappedRooms);
			}
		}

		if (['w', 'e'].includes(throughDoor.wall)) {
			const minY = (1 - state.room.height) / 2 + (throughDoor.location * state.room.height);
			const maxY = minY + doorSize;
			const playerY1 = state.player.y - characters.player.height / 2;
			const playerY2 = state.player.y + characters.player.height / 2;
			if (playerY2 > maxY) {
				state.player.y = maxY - characters.player.height / 2;
			} else if (playerY1 < minY) {
				state.player.y = minY + characters.player.height / 2;
			}


			const prevRoom = state.room;
			if (throughDoor.wall == 'w' && state.player.x < (1 - state.room.width - wallWidth) / 2 - doorThreshold) {
				goThroughDoor();
				const door = (state.room.doors || []).find(d => d.wall == 'e' && d.room == prevRoom);
				state.player.x = (1 + state.room.width - characters.player.width) / 2;
				state.player.y = (1 - state.room.height + doorSize) / 2 + ((door ? door.location : (1 - characters.player.height) / 2) * state.room.height);
				// console.log(state.player.y)
				if (state.player.x + characters.player.width > (1 + state.room.width) / 2) {
					state.player.x = (1 + state.room.width) / 2 - characters.player.width;
				}
			} else if (throughDoor.wall == 'e' && state.player.x > (1 + state.room.width + wallWidth) / 2 + doorThreshold) {
				goThroughDoor();
				const door = (state.room.doors || []).find(d => d.wall == 'w' && d.room == prevRoom);
				state.player.x = (1 - state.room.width + characters.player.width) / 2;
				state.player.y = (1 - state.room.height + doorSize) / 2 + ((door ? door.location : (1 - characters.player.height) / 2) * state.room.height);
				// console.log(state.player.y)
				if (state.player.y + characters.player.height > (1 + state.room.height) / 2) {
					state.player.y = (1 + state.room.height) / 2 - characters.player.height;
				}
			}

		} else {
			const minX = (1 - state.room.width) / 2 + (throughDoor.location * state.room.width);
			const maxX = minX + doorSize;
			const playerX1 = state.player.x - characters.player.width / 2;
			const playerX2 = state.player.x + characters.player.width / 2;
			if (playerX2 > maxX) {
				state.player.x = maxX - characters.player.width / 2;
			} else if (playerX1 < minX) {
				state.player.x = minX + characters.player.width / 2;
			}

			const prevRoom = state.room;
			if (throughDoor.wall == 'n' && state.player.y < (1 - state.room.height - wallWidth) / 2 - doorThreshold) {
				goThroughDoor();
				const door = state.room.doors.find(d => d.wall == 's' && d.room == prevRoom);
				state.player.y = (1 + state.room.height - characters.player.height) / 2;
				state.player.x = (1 - state.room.width + doorSize) / 2 + ((door ? door.location : (1 - characters.player.width) / 2) * state.room.width);
			} else if (throughDoor.wall == 's' && state.player.y > (1 + state.room.height + wallWidth) / 2 + doorThreshold) {
				goThroughDoor();
				const door = state.room.doors.find(d => d.wall == 'n' && d.room == prevRoom);
				state.player.y = (1 - state.room.height + characters.player.height) / 2;
				state.player.x = (1 - state.room.width + doorSize) / 2 + ((door ? door.location : (1 - characters.player.width) / 2) * state.room.width);
			}
		}
	}
}

function drawMap() {
	{
		// map background
		ctx.fillStyle = mapBackgroundColor;
		ctx.fillRect(canvas.width * mapMargin, canvas.height * mapMargin, canvas.width * (1 - 2 * mapMargin), canvas.height * (1 - 2 * mapMargin));
	}
	const mapped = [];
	{
		function drawRoom(room, offset) {
			if (mapped.includes(room)) {
				return;
			}
			mapped.push(room);
			{
				ctx.strokeStyle = room.wallColor || wallColor;
				ctx.lineWidth = wallWidth * mapScale * canvas.width;
				const width = room.width * mapScale * canvas.width;
				const height = room.height * mapScale * canvas.height;
				const x = - width / 2;
				const y = - height / 2;
				ctx.beginPath();
				ctx.rect(x + offset.x, y + offset.y, width, height);
				ctx.stroke();
				ctx.fillStyle = mapRoomColor;
				ctx.fillRect(x + offset.x, y + offset.y, width, height);
			}

			for (const door of room.doors || []) {
				door.p1 = {};
				door.p2 = {};
				if (['e', 'w'].includes(door.wall)) {
					door.p1.y = (door.location - room.height / 2) * mapScale * canvas.width;
					door.p2.y = door.p1.y + doorSize * mapScale * canvas.height;
					door.p1.x = door.p2.x = room.width * mapScale * canvas.width / 2;
					if (door.wall == 'w') {
						door.p1.x *= -1;
						door.p2.x *= -1;
					}
				} else {
					door.p1.x = (door.location - room.width / 2) * mapScale * canvas.height;
					door.p2.x = door.p1.x + doorSize * mapScale * canvas.width;
					door.p1.y = door.p2.y = room.height * mapScale * canvas.height / 2;
					if (door.wall == 'n') {
						door.p1.y *= -1;
						door.p2.y *= -1;
					}
				}
				for (const p of [door.p1, door.p2]) {
					p.x += offset.x;
					p.y += offset.y;
				}

				// ctx.font = '10px Arial';
				// ctx.fillStyle = '#000';
				// ctx.fillText(1, door.p1.x, door.p1.y);
				// ctx.fillText(2, door.p2.x, door.p2.y);
			}

			for (const door of room.doors || []) {
				if (mappedRooms.includes(door.room)) {
					let x = offset.x, y = offset.y;
					if (door.wall == 'n') {
						y -= canvas.height * mapScale;
					} else if (door.wall == 's') {
						y += canvas.height * mapScale;
					} else if (door.wall == 'w') {
						x -= canvas.width * mapScale;
					} else if (door.wall == 'e') {
						x += canvas.width * mapScale;
					}
					drawRoom(door.room, {
						x, y
					});
				}
			}
		}
	}

	drawRoom(state.room, {
		x: canvas.width / 2,
		y: canvas.height / 2
	});

	// now draw all doors
	for (const room of mapped) {
		for (const door of room.doors || []) {
			if (door.p1) {
				ctx.fillStyle = mapPassageColor;
				if (door.oppositeDoor && door.oppositeDoor.p1) {
					ctx.beginPath();
					ctx.moveTo(door.p1.x, door.p1.y);
					ctx.lineTo(door.p2.x, door.p2.y);
					ctx.lineTo(door.oppositeDoor.p2.x, door.oppositeDoor.p2.y);
					ctx.lineTo(door.oppositeDoor.p1.x, door.oppositeDoor.p1.y);
					ctx.closePath();
					ctx.fill();
				} else {
					let width, height;
					let x = door.p1.x;
					let y = door.p1.y;
					if (['e', 'w'].includes(door.wall)) {
						height = doorSize * mapScale * canvas.height;
						width = 2 * wallWidth * mapScale * canvas.width;
						x -= wallWidth * mapScale * canvas.width;
					} else {
						height = 2 * wallWidth * mapScale * canvas.height;
						width = doorSize * mapScale * canvas.width;
						y -= wallWidth * mapScale * canvas.width;
					}
					ctx.fillRect(x, y, width, height);
				}
			}
		}
	}

	{
		// you are here
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
		ctx.fill();

		// player
		const width = characters.player.width * mapScale * canvas.width;
		const height = characters.player.height * mapScale * canvas.height;
		const x = (canvas.width - width) / 2;
		const y = (canvas.height - height) / 2;
		ctx.drawImage(characterFrames.player.standing[0], x, y, width, height);
	}
}


function drawInventory() {
	const lineHeight = 0.08;
	const fontSize = lineHeight * 0.8 * canvas.height;
	ctx.font = `${fontSize * 1.2}px ${fontFamily}`;
	ctx.fillStyle = '#000';

	let y = 0.08 * canvas.height;
	const header = 'Inventory';
	const x = (canvas.width - ctx.measureText(header).width) / 2;
	ctx.fillText(header, x, y);
	y += lineHeight * canvas.height;

	ctx.font = `${fontSize}px ${fontFamily}`;
	const x1 = 0.12 * canvas.width;
	const x2 = 0.8 * canvas.width;
	const imageSize = 0.08 * canvas.width;
	for (const itemId in state.inventory) {
		const item = items[itemId];
		ctx.drawImage(item.image, x1 - imageSize * 1.2, y - imageSize, imageSize, imageSize);
		ctx.fillText(item.label, x1, y);
		ctx.fillText(state.inventory[itemId], x2, y);
		y += lineHeight * canvas.height;
	}
}

function onKeyUp(e) {
	delete keysDown[e.code];
	if (Object.keys(keysDown).length == 0) {
		animate({
			id: 'player',
			motion: 'standing'
		});
	}

	if (e.key.toUpperCase() == 'M') {
		drawFunc = drawFunc == drawMap ? drawGame : drawMap;
	} else if (e.key.toUpperCase() == 'I') {
		drawFunc = drawFunc == drawInventory ? drawGame : drawInventory;
	} else if (e.key.toUpperCase() == 'C') {
		let next, didSelect;
		if (state.player.selectedWeapon) {
			for (const id in state.inventory) {
				if (next) {
					state.player.selectedWeapon = id;
					didSelect = true;
					break;
				}
				if (state.player.selectedWeapon == id) {
					next = true;
				}
			}
			if (!didSelect) {
				state.player.selectedWeapon = Object.keys(state.inventory).filter(id => items[id].type == 'weapon')[0];
			}
		} else if (Object.keys(state.inventory).length > 0) {
			state.player.selectedWeapon = Object.keys(state.inventory).filter(id => items[id].type == 'weapon')[0];
		}
	} else if (e.key == 'Escape') {
		drawFunc = drawGame;
	}
}

function onKeyDown(e) {
	// if (gameEndTime && new Date() - gameEndTime > gameEndDelay) {
	// 	init();
	// } else {
	// }
	if (!keysDown[e.code]) {
		const motion = {
			ArrowLeft: 'left',
			ArrowRight: 'right',
			ArrowUp: 'up',
			ArrowDown: 'down'
		}[e.code];
		if (motion) {
			animate({
				id: 'player',
				motion
			});
		}
	}
	keysDown[e.code] = true;
}

function animate(character) {
	clearInterval(animIntervalIds[character.id]);
	animFrameNums[character.id] = 0;
	const motion = character.motion;
	// console.log('starting anim', motion);
	function f() {
		characterImages[character.id] = characterFrames[character.id][motion][animFrameNums[character.id] % characterFrames[character.id][motion].length];
		animFrameNums[character.id]++;
		// console.log('anim', motion);
		// console.log(characterImages[character.id]);
	}

	f();
	animIntervalIds[character.id] = setInterval(f, characters[character.id].animInterval);
}
