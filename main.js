const state = {
	player: {
		id: 'player',
		x: 0.5,
		y: 0.5,
		health: 1,
		motion: 'standing',
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
const itemTakeDistance = 32;

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
	// const originalValueOf = Object.prototype.valueOf;
	// Object.prototype.valueOf = function () {
	// 	if (typeof this !== 'number') {
	// 		throw new Error('Object is not a Number');
	// 	}
	// 	return originalValueOf.bind(this)();
	// }

	canvas = document.getElementById('game-canvas');
	statusCanvas = document.getElementById('status-canvas');
	canvas.width = Math.min(innerWidth * 0.8, innerHeight * 0.8);
	canvas.height = canvas.width;
	statusCanvas.width = canvas.width;
	statusCanvas.height = innerHeight * 0.14;
	ctx = canvas.getContext('2d');
	statusCtx = statusCanvas.getContext('2d');

	for (const characterId in characters) {
		characterFrames[characterId] = {
			standing: [],
			left: [],
			right: [],
			up: [],
			down: [],
			wielding: {},
			strike: {},
		};

		for (const key in characterFrames[characterId]) {
			if (['wielding', 'strike'].includes(key)) {
				for (const weaponName in characters[characterId][key] || {}) {
					characterFrames[characterId][key][weaponName] = {};
					for (const direction in characters[characterId][key][weaponName] || {}) {
						characterFrames[characterId][key][weaponName][direction] = [];
						for (const fileName of characters[characterId][key][weaponName][direction] || []) {
							const img = new Image();
							img.src = `img/charactes/${fileName}`;
							characterFrames[characterId][key][weaponName][direction].push(img);
						}
					}
				}
			} else {
				for (const fileName of characters[characterId][key] || []) {
					const img = new Image();
					img.src = `img/charactes/${fileName}`;
					characterFrames[characterId][key].push(img);
				}
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
	statusCtx.fillText('Health', 0.02 * statusCanvas.width, 0.24 * statusCanvas.height);
	statusCtx.fillText('Weapons', 0.02 * statusCanvas.width, 0.58 * statusCanvas.height);

	statusCtx.fillStyle = '#444';
	statusCtx.fillRect(0.24 * statusCanvas.width, 0.14 * statusCanvas.height, 0.6 * statusCanvas.width, 0.1 * statusCanvas.height);
	statusCtx.fillStyle = '#b44';
	statusCtx.fillRect(0.24 * statusCanvas.width, 0.14 * statusCanvas.height, 0.6 * state.player.health * statusCanvas.width, 0.1 * statusCanvas.height);

	let i = 0;
	for (const id in state.inventory) {
		if (items[id].type == 'weapon') {
			const size = 0.08;
			const x = (0.24 + i * 0.1) * statusCanvas.width;
			const y = 0.4 * statusCanvas.height;
			const width = size * statusCanvas.width;
			const height = size * statusCanvas.width;
			if (state.player.wielding == id) {
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
			const loc = toScreen(portal.location, {
				width: portalSize,
				height: portalSize
			});
			ctx.drawImage(portalImage, loc.x, loc.y, portalSize * canvas.width, portalSize * canvas.height);
		}
	}
	{
		// items
		for (const roomItem of state.room.items || []) {
			const item = items[roomItem.id];
			let size = item.size;
			if (item.image.height != 0) {
				const loc = toScreen(roomItem.location, {
					width: size * item.image.width / item.image.height,
					height: size
				});
				if (roomItem.animStep) {
					size -= roomItem.animStep * item.size / 16;
					loc.x += (item.size - size) * canvas.width / 2;
					loc.y += (item.size - size) * canvas.height / 2;
					ctx.globalAlpha = (12 - roomItem.animStep) / 12;
				}
				// console.log(item.image.width / item.image.height);
				if (size > 0) {
					ctx.drawImage(item.image, loc.x, loc.y, (size * item.image.width / item.image.height) * canvas.width, size * canvas.height);
				}
				ctx.globalAlpha = 1;
			}
			// let x = ((1 - state.room.width) / 2 + (roomItem.location.x * state.room.width)) * canvas.width;
			// let y = ((1 - state.room.height) / 2 + (roomItem.location.y * state.room.height)) * canvas.height;
		}
	}
	{
		// characters
		for (const roomCharacter of state.room.characters || []) {
			const character = characters[roomCharacter.id];
			character.move && character.move(roomCharacter);
			// console.log(roomCharacter.width * state.room.width);
			for (const roomCharacter2 of (state.room.characters || []).concat(state.player)) {
				if (roomCharacter != roomCharacter2) {
					character.interact && character.interact(roomCharacter, roomCharacter2);
				}
			}

			if (roomCharacter.location.x < 0 || roomCharacter.location.x > 1 - (character.width / state.room.width)) {
				if (roomCharacter.vel) {
					roomCharacter.vel.x *= -1;
				}
				// roomCharacter.velInversionTime.x = now;
			}
			if (roomCharacter.location.y < 0 || roomCharacter.location.y > 1 - (character.height / state.room.height)) {
				if (roomCharacter.vel) {
					roomCharacter.vel.y *= -1;
				}
			}
			roomCharacter.location.y = Math.min(1 - (character.height / state.room.height) + character.height / (2 * state.room.height), roomCharacter.location.y);
			roomCharacter.location.y = Math.max(character.height / (2 * state.room.height), roomCharacter.location.y);
			roomCharacter.location.x = Math.min(1 - (character.width / state.room.width) + character.width / (2 * state.room.width), roomCharacter.location.x);
			roomCharacter.location.x = Math.max(character.width / (2 * state.room.width), roomCharacter.location.x);

			const imageLoc = toScreen(roomCharacter.location, character);
			ctx.drawImage(
				characterImages[roomCharacter.id],
				imageLoc.x,
				imageLoc.y,
				character.width * canvas.width,
				character.height * canvas.height
			);

			roomCharacter.health = roomCharacter.health || 1;
			{
				// health circle
				const r = 0.014;
				ctx.fillStyle = '#444';
				ctx.beginPath();
				ctx.arc(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * r, canvas.width * r, 0, 2 * Math.PI);
				ctx.fill();

				ctx.fillStyle = '#f00';
				ctx.beginPath();
				ctx.moveTo(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * r);
				ctx.arc(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * r, canvas.width * r, 0, roomCharacter.health * Math.PI * 2, false);
				ctx.lineTo(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * r);
				ctx.fill();
			}

			// ctx.fillStyle = '#f00';
			// ctx.fillRect(imageLoc.x, imageLoc.y, 4, 4);
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
		// console.log('state.player.x ', state.player.x);
		const loc = toScreen(state.player, characters.player);
		// const x = (state.player.x - characters.player.width / 2) * canvas.width;
		// const y = (state.player.y - characters.player.height / 2) * canvas.height;
		ctx.drawImage(characterImages.player, loc.x, loc.y, characters.player.width * canvas.width, characters.player.height * canvas.height);

		// ctx.fillStyle = '#f00';
		// ctx.fillRect(loc.x, loc.y, 4, 4);
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
		const edge = characters.player.width / (2 * state.room.width);
		state.player.x -= inc / state.room.width;
		if (state.player.x <= edge) {
			const playerPos = state.player.y - characters.player.height / (2 * state.room.height);
			for (const door of (state.room.doors || []).filter(d => d.wall == 'w')) {
				const y1 = door.location;
				const y2 = door.location + (doorSize - characters.player.height) / state.room.height;
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
		const x = state.player.x;
		state.player.x += inc / state.room.width;
		const playerEdge = state.player.x * state.room.width - characters.player.width / 2 + (1 - state.room.width) / 2 + characters.player.width;
		const edge = (1 + state.room.width) / 2;
		if (playerEdge >= edge) {
			const playerPos = state.player.y - characters.player.height / (2 * state.room.height);
			for (const door of (state.room.doors || []).filter(d => d.wall == 'e')) {
				const y1 = door.location;
				const y2 = door.location + (doorSize - characters.player.height) / state.room.height;

				// {
				// 	const loc = toScreen({
				// 		x: 1,
				// 		y: y1
				// 	});
				// 	ctx.fillStyle = '#f00';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
				// {
				// 	const loc = toScreen({
				// 		x: 1,
				// 		y: y2
				// 	});
				// 	ctx.fillStyle = '#f00';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
				// {
				// 	const loc = toScreen({
				// 		x: 1,
				// 		y: playerPos
				// 	});
				// 	ctx.fillStyle = '#0f0';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }

				if (playerPos >= y1 && playerPos <= y2) {
					throughDoor = door;
					break;
				}
			}
			if (!throughDoor || throughDoor.wall != 'e') {
				state.player.x = x;
			}
		}
	}
	if (keysDown.ArrowUp) {
		const edge = characters.player.height / (2 * state.room.height);
		state.player.y -= inc / state.room.height;
		if (state.player.y <= edge) {
			const playerPos = state.player.x - characters.player.width / (2 * state.room.width);
			for (const door of (state.room.doors || []).filter(d => d.wall == 'n')) {
				const x1 = door.location;
				const x2 = door.location + (doorSize - characters.player.width) / state.room.width;
				// {
				// 	const loc = toScreen({
				// 		x: x1,
				// 		y: 0
				// 	});
				// 	ctx.fillStyle = '#f00';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
				// {
				// 	const loc = toScreen({
				// 		x: x2,
				// 		y: 0
				// 	});
				// 	ctx.fillStyle = '#f00';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
				// {
				// 	const loc = toScreen({
				// 		x: playerPos,
				// 		y: 0
				// 	});
				// 	ctx.fillStyle = '#0f0';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
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
		const y = state.player.y;
		state.player.y += inc / state.room.height;
		const playerEdge = state.player.y * state.room.height - characters.player.height / 2 + (1 - state.room.height) / 2 + characters.player.height;
		const edge = (1 + state.room.height) / 2;
		if (playerEdge >= edge) {
			const playerPos = state.player.x;
			for (const door of (state.room.doors || []).filter(d => d.wall == 's')) {
				const x1 = door.location;
				const x2 = door.location + (doorSize - characters.player.width) / state.room.width;
				if (playerPos >= x1 && playerPos <= x2) {
					throughDoor = door;
					break;
				}
			}
			if (!throughDoor || throughDoor.wall != 's') {
				state.player.y = y;
			}
		}
	}

	// go through portal
	for (const portal of state.room.portals || []) {
		// const x = (1 - state.room.width) / 2 + (portal.location.x * state.room.width) + (portalSize * 0.1);
		// const y = (1 - state.room.height) / 2 + (portal.location.y * state.room.height) + (portalSize * 0.1);
		// ctx.strokeStyle = '#000';
		// ctx.lineWidth = 2;
		// ctx.beginPath();
		// ctx.rect(x * canvas.width, y * canvas.height, portalSize * 0.8 * canvas.width, portalSize * 0.8 * canvas.height);
		// ctx.stroke();

		// ctx.fillStyle = '#f00';
		// ctx.fillRect(state.player.x * canvas.width, state.player.y * canvas.height, 2, 2);
		if (state.player.x > portal.location.x - portalSize / 2 &&
			state.player.x < portal.location.x + portalSize / 2 &&
			state.player.y > portal.location.y - portalSize / 2 &&
			state.player.y < portal.location.y + portalSize / 2
		) {
			state.room = rooms.find(r => r.id == portal.roomId);
			state.player.x = state.player.y = 0.5;
		}
	}

	// pick up an item
	let i = 0;
	for (const roomItem of state.room.items || []) {
		const item = items[roomItem.id];
		if (item.image.height > 0) {
			const itemLoc = toScreen(roomItem.location, {
				width: item.size * (item.image.width / item.image.height),
				height: item.size
			});
			itemLoc.x += item.size * (item.image.width / item.image.height) * canvas.width / 2;
			itemLoc.y += item.size * canvas.height / 2;

			const playerLoc = toScreen(state.player, characters.player);
			playerLoc.x += characters.player.width * canvas.width / 2;
			playerLoc.y += characters.player.height * canvas.height / 2;

			const dx = playerLoc.x - itemLoc.x;
			const dy = playerLoc.y - itemLoc.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (!roomItem.takeAnimIntervalId && dist < itemTakeDistance) {
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
				state.inventory[roomItem.id] += item.value || 0;
			}
		}

		i++;
	}

	// console.log('throughDoor', throughDoor);
	if (throughDoor) {
		const oppositeWall = {
			n: 's',
			s: 'n',
			e: 'w',
			w: 'e'
		}[throughDoor.wall];
		const prevRoom = state.room;
		state.room = throughDoor.room;
		if (!mappedRooms.includes(state.room)) {
			mappedRooms.push(state.room);
			// console.log(mappedRooms);
		}
		throughDoor = null;
		if (oppositeWall) {
			if (oppositeWall == 's') {
				state.player.y = 1 - characters.player.height / (2 * state.room.height);
			} else if (oppositeWall == 'n') {
				state.player.y = characters.player.height / (2 * state.room.height);;
			} else if (oppositeWall == 'e') {
				state.player.x = 1 - characters.player.width / (2 * state.room.width);
			} else {
				state.player.x = characters.player.width / (2 * state.room.height);;
			}

			const door = (state.room.doors || []).find(d => d.wall == oppositeWall && d.room == prevRoom);
			if (['n', 's'].includes(oppositeWall)) {
				if (door) {
					state.player.x = door.location + (characters.player.width / state.room.width) / 2;
				} else {
					state.player.x = (1 - state.room.width * characters.player.width) / 2;
				}
			} else {
				if (door) {
					state.player.y = door.location + (characters.player.height / state.room.height) / 2;
				} else {
					state.player.y = (1 - state.room.height * characters.player.height) / 2;
				}
			}
		}
		// console.log('oppositeWall', oppositeWall);
		// console.log('x', state.player.x);
		// console.log('y', state.player.y);
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
		ctx.fillText(item.label, x1 + (0.04 * canvas.width), y);
		if (state.inventory[itemId]) {
			ctx.fillText(state.inventory[itemId], x2, y);
		}
		y += lineHeight * canvas.height;
	}
}

function attack() {
	if (state.player.wielding) {
		let minDist;
		let closestCharacter;
		const weapon = items[state.player.wielding];
		// console.log(weapon);
		for (const roomCharacter of state.room.characters) {
			const character = characters[roomCharacter.id];
			const characterLoc = toScreen(roomCharacter.location, character);
			characterLoc.x += character.width * canvas.width / 2;
			characterLoc.y += character.height * canvas.height / 2;

			const playerLoc = toScreen(state.player, characters.player);
			playerLoc.x += characters.player.width * canvas.width / 2;
			playerLoc.y += characters.player.height * canvas.height / 2;

			const dx = playerLoc.x - characterLoc.x;
			const dy = playerLoc.y - characterLoc.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			// console.log(dist);
			if ((!minDist || dist < minDist) && dist <= weapon.range) {
				minDist = dist;
				closestCharacter = roomCharacter;
			}
		}
		// console.log(closestCharacter);
		if (closestCharacter) {
			const character = characters[closestCharacter.id];
			closestCharacter.health -= weapon.damage / character.resilience;
			if (closestCharacter.health <= 0) {
				state.room.characters = state.room.characters.filter(c => c != closestCharacter);
			}
		}
	}

}


function onKeyUp(e) {
	delete keysDown[e.code];
	if (Object.keys(keysDown).length == 0) {
		state.player.motion = 'standing';
		animate(state.player);
	}

	if (e.key.toUpperCase() == 'M') {
		drawFunc = drawFunc == drawMap ? drawGame : drawMap;
	} else if (e.key.toUpperCase() == 'I') {
		drawFunc = drawFunc == drawInventory ? drawGame : drawInventory;
	} else if (e.key.toUpperCase() == 'A') {
		attack();
	} else if (e.key.toUpperCase() == 'C') {
		let next, didSelect;
		if (state.player.wielding) {
			for (const id in state.inventory) {
				if (next) {
					state.player.wielding = id;
					didSelect = true;
					break;
				}
				if (state.player.wielding == id) {
					next = true;
				}
			}
			if (!didSelect) {
				state.player.wielding = null;
			}
		} else if (Object.keys(state.inventory).length > 0) {
			state.player.wielding = Object.keys(state.inventory).filter(id => items[id].type == 'weapon')[0];
		}
		animate(state.player);
	} else if (e.key == 'Escape') {
		drawFunc = drawGame;
	}
}

function onKeyDown(e) {
	if (!keysDown[e.code]) {
		const motion = {
			ArrowLeft: 'left',
			ArrowRight: 'right',
			ArrowUp: 'up',
			ArrowDown: 'down'
		}[e.code];
		if (motion) {
			state.player.motion = motion;
			animate(state.player);
		}
	}
	keysDown[e.code] = true;
}

function animate(character) {
	clearInterval(animIntervalIds[character.id]);
	animFrameNums[character.id] = 0;
	let motion = character.motion;
	// console.log('starting anim', motion);
	function f() {
		let frames;
		if (state.player.wielding && character.id == 'player') {
			if (!characterFrames[character.id].wielding[state.player.wielding][motion]) {
				motion = 'left';
			}
			frames = characterFrames[character.id].wielding[state.player.wielding][motion];
		} else {
			frames = characterFrames[character.id][motion];
		}
		characterImages[character.id] = frames[animFrameNums[character.id] % frames.length];
		animFrameNums[character.id]++;
		// console.log('anim', motion);
		// console.log(characterImages[character.id]);
	}

	f();
	animIntervalIds[character.id] = setInterval(f, characters[character.id].animInterval);
}

function toScreen(loc, character) {
	character = character || {
		width: 0,
		height: 0
	};
	if (isNaN(loc.x) || isNaN(loc.y) || isNaN(character.width) || isNaN(character.height)) {
		console.log('bad!', loc, character);
	}
	const x = ((loc.x * state.room.width) - character.width / 2 + (1 - state.room.width) / 2) * canvas.width;
	const y = ((loc.y * state.room.height) - character.height / 2 + (1 - state.room.height) / 2) * canvas.height;
	return { x, y };
}
