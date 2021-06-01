let state = {
	player: {
		id: 'player',
		x: 0.5,
		y: 0.5,
		health: 1,
		motion: 'idleFrames',
	},
	inventory: {},
	room: rooms[0],
};

const characterIntersectionLeeway = 0.88;
const resaleFactor = 0.7;
const moneySymbol = '&#10086;';
const wallColor = '#3f2f0c';
const backgroundColor = '#c1e5be';
const doorSize = 0.15;
const doorThreshold = 0.04;
const doorwaySize = {
	width: 0.006,
	height: 0.04
};
const wallWidth = 0.02;
const moveIncrement = 0.006;
const itemTakeDistance = 32;
const numTakeItemAnimSteps = 12;
const numCharacterDieAnimSteps = 148;

const mapBackgroundColor = '#e2e2b1';
const mapPassageColor = '#ccd';
const mapMargin = 0.02;
const mapScale = 0.24;

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
let throughDoor, canvas, ctx, statusCanvas, statusCtx, portalImage, attackMotion, clickSound, roomMusic, dreamSound, didUserInteract;

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
	canvas.width = Math.min(innerWidth * 0.86 - 28, innerHeight * 0.8 - 28);
	canvas.height = canvas.width;
	statusCanvas.width = canvas.width;
	statusCanvas.height = innerHeight * 0.14;
	ctx = canvas.getContext('2d');
	statusCtx = statusCanvas.getContext('2d');

	defaultRoomMusic = new Audio(`sounds/${defaultRoomMusic}`);
	dreamSound = new Audio('sounds/dream.mp3');
	clickSound = new Audio('sounds/click.mp3');

	if (localStorage.state) {
		state = JSON.parse(localStorage.state);
		state.room.doors = rooms[state.room.id].doors;
		const savedRooms = JSON.parse(localStorage.rooms);
		for (const savedRoom of savedRooms) {
			const room = rooms.find(r => r.id == savedRoom.id);
			room.items = savedRoom.items;
			room.characters = savedRoom.characters;
		}
		// for (const sound in state.room.sounds) {
		// 	console.log('state.room.sounds ', sound);
		// }

		state.isPaused = false;
	}

	setInterval(() => {
		localStorage.state = JSON.stringify(state, (key, value) => {
			// console.log('key value', key, value);
			return key == 'doors' ? [] : value;
		});
		localStorage.rooms = JSON.stringify(rooms, (key, value) => {
			return key == 'doors' ? [] : value;
		});
	}, 2000);

	for (const characterId in characters) {
		const character = characters[characterId];
		characterFrames[characterId] = {
			idleFrames: [],
			left: [],
			right: [],
			up: [],
			down: [],
			dieFrames: [],
			attackPrepFrames: [],
			attackFrames: [],
			wielding: {},
			attack: {},
		};

		for (const key in characterFrames[characterId]) {
			if (['wielding', 'attack'].includes(key)) {
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

		for (const sound in character.sounds) {
			character.sounds[sound] = new Audio(`sounds/${character.sounds[sound]}`);
		}
	}

	characterImages.player = characterFrames.player.idleFrames[0];

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	document.addEventListener('mousedown', e => {
		didUserInteract = true;
	});

	for (const itemKey in items) {
		const item = items[itemKey];
		const image = new Image();
		image.src = `img/items/${item.image}`;
		item.image = image;
		for (const sound in item.sounds || {}) {
			item.sounds[sound] = new Audio(`sounds/${item.sounds[sound]}`);
		}
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
		for (const sound in room.sounds || {}) {
			// console.log('sounds/${room.sounds[sound]}', `sounds/${room.sounds[sound]}`);
			room.sounds[sound] = new Audio(`sounds/${room.sounds[sound]}`);
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

	if (localStorage.state) {
		setRoom(state.room);
		if (state.isGameOver) {
			document.getElementById('toggle-pause').innerHTML = 'Play Again';
			state.player.motion = 'dieFrames';
			animate(state.player);
		}
	} else {
		state.mappedRooms = [rooms[0].id];
		setRoom(rooms[0]);
		state.t = 0;
	}

	requestAnimationFrame(draw);

	if (!JSON.parse(localStorage.didShowInstructions || null)) {
		localStorage.didShowInstructions = true;
		setTimeout(() => {
			showModal('instructions-modal');
		}, 800);
	}
}

function draw() {
	if (!state.isPaused) {
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// console.log('state.player.health ', state.player.health);
		if (state.player.health <= 0) {
			state.player.health = 0;
			state.isGameOver = true;
		}

		drawFunc();
		drawStatus();
		state.t++;
	}
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
	statusCtx.fillRect(0.24 * statusCanvas.width - 4, 0.14 * statusCanvas.height - 4, 0.6 * statusCanvas.width + 8, 0.1 * statusCanvas.height + 8);
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
		const x = (1 - getValue(state.room, 'width')) * canvas.width / 2;
		const y = (1 - getValue(state.room, 'height')) * canvas.height / 2;
		ctx.drawImage(roomBackground, x, y, getValue(state.room, 'width') * canvas.width, getValue(state.room, 'height') * canvas.height);
	}
	{
		// wall
		ctx.strokeStyle = state.room.wallColor || wallColor;
		ctx.lineWidth = canvas.width * wallWidth;
		ctx.beginPath();
		const x = (1 - getValue(state.room, 'width')) * canvas.width / 2;
		const y = (1 - getValue(state.room, 'height')) * canvas.height / 2;
		ctx.rect(x, y, getValue(state.room, 'width') * canvas.width, getValue(state.room, 'height') * canvas.height);
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
					ctx.globalAlpha = (numTakeItemAnimSteps - roomItem.animStep) / numTakeItemAnimSteps;
				}
				// console.log(item.image.width / item.image.height);
				if (size > 0) {
					ctx.drawImage(item.image, loc.x, loc.y, (size * item.image.width / item.image.height) * canvas.width, size * canvas.height);
				}
				ctx.globalAlpha = 1;
			}
			// let x = ((1 - getValue(state.room, 'width')) / 2 + (roomItem.location.x * getValue(state.room, 'width'))) * canvas.width;
			// let y = ((1 - getValue(state.room, 'height')) / 2 + (roomItem.location.y * getValue(state.room, 'height'))) * canvas.height;
		}
	}
	{
		// characters
		for (const roomCharacter of state.room.characters || []) {
			const character = characters[roomCharacter.id];

			if (!state.isGameOver) {
				if (roomCharacter.motion != 'attackFrames' &&
					character.attackMetrics &&
					Math.random() < character.attackMetrics.prob &&
					distance(roomCharacter) < character.attackMetrics.range &&
					roomCharacter.motion != 'dieFrames'
				) {
					roomCharacter.motion = 'attackPrepFrames';
					animate(roomCharacter);
					setTimeout(() => {
						if (distance(roomCharacter) < character.attackMetrics.range && roomCharacter.motion != 'dieFrames') {
							roomCharacter.motion = 'attackFrames';
							animate(roomCharacter);
							state.player.health -= character.attackMetrics.strength;
							if (character.sounds.attack) {
								play(character.sounds.attack);
							}
							setTimeout(() => {
								roomCharacter.motion = 'idleFrames';
								animate(roomCharacter);
							}, character.attackMetrics.resetTime);
						} else {
							roomCharacter.motion = 'idleFrames';
							animate(roomCharacter);
						}
					}, character.attackMetrics.prepTime || 0);
				}

				const prevCharacterLoc = {
					x: roomCharacter.location.x,
					y: roomCharacter.location.y,
				};
				for (const move of character.move || []) {
					move(roomCharacter);
				}

				// console.log(roomCharacter.width * getValue(state.room, 'width'));
				let interactingCharacters = state.room.characters || [];
				if (!state.player.isInvisible) {
					interactingCharacters = interactingCharacters.concat(state.player);
				}

				for (const roomCharacter2 of interactingCharacters) {
					if (roomCharacter != roomCharacter2) {
						for (const interact of character.interact || []) {
							interact(roomCharacter, roomCharacter2);
						}
					}
				}

				if (roomCharacter.location.x < 0 || roomCharacter.location.x > 1 - (character.width / getValue(state.room, 'width'))) {
					if (roomCharacter.vel) {
						roomCharacter.vel.x *= -1;
					}
					// roomCharacter.velInversionTime.x = now;
				}
				if (roomCharacter.location.y < 0 || roomCharacter.location.y > 1 - (character.height / getValue(state.room, 'height'))) {
					if (roomCharacter.vel) {
						roomCharacter.vel.y *= -1;
					}
				}

				roomCharacter.location.y = Math.min(1 - (character.height / getValue(state.room, 'height')) + character.height / (2 * getValue(state.room, 'height')), roomCharacter.location.y);
				roomCharacter.location.y = Math.max(character.height / (2 * getValue(state.room, 'height')), roomCharacter.location.y);
				roomCharacter.location.x = Math.min(1 - (character.width / getValue(state.room, 'width')) + character.width / (2 * getValue(state.room, 'width')), roomCharacter.location.x);
				roomCharacter.location.x = Math.max(character.width / (2 * getValue(state.room, 'width')), roomCharacter.location.x);

				const playerWidth = characterIntersectionLeeway * (characters.player.width / getValue(state.room, 'width')) / 2;
				const playerHeight = characterIntersectionLeeway * (characters.player.height / getValue(state.room, 'height')) / 2;
				const characterWidth = characterIntersectionLeeway * (character.width / getValue(state.room, 'width')) / 2;
				const characterHeight = characterIntersectionLeeway * (character.height / getValue(state.room, 'height')) / 2;
				if (state.player.x + playerWidth > roomCharacter.location.x - characterWidth &&
					state.player.x - playerWidth < roomCharacter.location.x + characterWidth &&
					state.player.y + playerHeight > roomCharacter.location.y - characterHeight &&
					state.player.y - playerHeight < roomCharacter.location.y + characterHeight
				) {
					roomCharacter.location.x = prevCharacterLoc.x;
					roomCharacter.location.y = prevCharacterLoc.y;
				}
			}

			let size = 1;
			if (roomCharacter.animStep) {
				if (!roomCharacter.baseLoc) {
					roomCharacter.baseLoc = {
						x: roomCharacter.location.x,
						y: roomCharacter.location.y
					};
				}
				// console.log('roomCharacter.baseLoc', roomCharacter.baseLoc);
				roomCharacter.location.x = roomCharacter.baseLoc.x + character.width * roomCharacter.animStep / (2 * numCharacterDieAnimSteps * getValue(state.room, 'width'));
				roomCharacter.location.y = roomCharacter.baseLoc.y + character.height * roomCharacter.animStep / (2 * numCharacterDieAnimSteps * getValue(state.room, 'height'));
				ctx.globalAlpha = (numCharacterDieAnimSteps - roomCharacter.animStep) / numCharacterDieAnimSteps;
				size = 1 - roomCharacter.animStep / numCharacterDieAnimSteps;
				// console.log('size ', size);
			}

			let imageLoc;
			// console.log(characterImages[roomCharacter.id]);
			if (roomCharacter.rotation) {
				// debug(roomCharacter.rotation);
				imageLoc = toScreen({
					x: roomCharacter.location.x + character.width / 2,
					y: roomCharacter.location.y + character.height / 2
				}, character);
				ctx.save();
				ctx.translate(imageLoc.x, imageLoc.y);
				ctx.rotate(roomCharacter.rotation);
				ctx.drawImage(
					characterImages[roomCharacter.id],
					-character.width * canvas.width / 2,
					-character.height * canvas.height / 2,
					size * character.width * canvas.width,
					size * character.height * canvas.height
				);
				ctx.restore();
			} else {
				imageLoc = toScreen(roomCharacter.location, character);
				ctx.drawImage(
					characterImages[roomCharacter.id],
					imageLoc.x,
					imageLoc.y,
					size * character.width * canvas.width,
					size * character.height * canvas.height
				);
			}
			ctx.globalAlpha = 1;

			roomCharacter.health = roomCharacter.health || 1;
			if (character.type == 'enemy' && !roomCharacter.animStep) {
				const healthIndicatorRadius = 0.014;
				const targetedCharacter = getTargetedCharacter();
				// console.log('targetedCharacter ', targetedCharacter);
				if (targetedCharacter == roomCharacter) {
					const r = 0.02;
					const alpha = Math.floor(127 * (Math.sin(state.t / 22) + 1));
					let alphaHex = alpha.toString(16);
					if (alphaHex.length < 2) {
						alphaHex = '0' + alphaHex;
					}
					ctx.fillStyle = '#0000dd' + alphaHex;
					ctx.beginPath();
					ctx.moveTo(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * r);
					ctx.arc(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * healthIndicatorRadius, canvas.width * r, 0, 2 * Math.PI, false);
					ctx.fill();
				}

				// health circle
				ctx.fillStyle = '#444';
				ctx.beginPath();
				ctx.arc(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * healthIndicatorRadius, canvas.width * healthIndicatorRadius, 0, 2 * Math.PI);
				ctx.fill();

				ctx.fillStyle = '#f00';
				ctx.beginPath();
				ctx.moveTo(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * healthIndicatorRadius);
				ctx.arc(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * healthIndicatorRadius, canvas.width * healthIndicatorRadius, 0, roomCharacter.health * Math.PI * 2, false);
				ctx.lineTo(imageLoc.x + (character.width * canvas.width / 2), imageLoc.y - canvas.width * healthIndicatorRadius);
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
				x = ((1 - getValue(state.room, 'width') - wallWidth) / 2) * canvas.width - 1;
				y = ((1 - getValue(state.room, 'height')) / 2 + (door.location * getValue(state.room, 'height'))) * canvas.height;
				width = wallWidth * canvas.width + 1;
				height = doorSize * canvas.height;
			} else if (door.wall == 'e') {
				x = ((1 + getValue(state.room, 'width') - wallWidth) / 2) * canvas.width;
				y = ((1 - getValue(state.room, 'height')) / 2 + (door.location * getValue(state.room, 'height'))) * canvas.height;
				width = wallWidth * canvas.width + 1;
				height = doorSize * canvas.height;
			} else if (door.wall == 'n') {
				x = ((1 - getValue(state.room, 'width')) / 2 + (door.location * getValue(state.room, 'width'))) * canvas.width;
				y = (1 - getValue(state.room, 'height') - wallWidth) * canvas.height / 2 - 1;
				height = wallWidth * canvas.height + 1;
				width = doorSize * canvas.width;
			} else if (door.wall == 's') {
				x = ((1 - getValue(state.room, 'width')) / 2 + (door.location * getValue(state.room, 'width'))) * canvas.width;
				y = ((1 + getValue(state.room, 'height') - wallWidth) / 2) * canvas.height;
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
		if (state.player.isInvisible) {
			if (state.t - state.player.invisibilityStart > items.invisibilityPotion.duration) {
				state.player.isInvisible = false;
			} else {
				ctx.globalAlpha = 0.6;
			}
		}
		ctx.drawImage(characterImages.player, loc.x, loc.y, characters.player.width * canvas.width, characters.player.height * canvas.height);
		ctx.globalAlpha = 1;

		// ctx.fillStyle = '#f00';
		// ctx.fillRect(loc.x, loc.y, 4, 4);
	}

	if (state.isGameOver) {
		const text = 'GAME OVER';
		const lineHeight = Math.floor(0.16 * canvas.height);
		ctx.font = `${lineHeight}px ${fontFamily}`;
		ctx.fillStyle = '#f00';
		const x = (canvas.width - ctx.measureText(text).width) / 2;
		ctx.fillText(text, x, 0.4 * canvas.height);

		if (!state.didDie) {
			state.didDie = true;
			document.getElementById('toggle-pause').innerHTML = 'Play Again';
			play(characters.player.sounds.die);

			state.player.motion = 'dieFrames';
			animate(state.player);
		}

		return;
	}

	const prevPlayerLoc = {
		x: state.player.x,
		y: state.player.y,
	};
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
		const edge = characters.player.width / (2 * getValue(state.room, 'width'));
		state.player.x -= inc / getValue(state.room, 'width');
		if (state.player.x <= edge) {
			const playerPos = state.player.y - characters.player.height / (2 * getValue(state.room, 'height'));
			for (const door of (state.room.doors || []).filter(d => d.wall == 'w')) {
				const y1 = door.location;
				const y2 = door.location + (doorSize - characters.player.height) / getValue(state.room, 'height');
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
		state.player.x += inc / getValue(state.room, 'width');
		const playerEdge = state.player.x * getValue(state.room, 'width') - characters.player.width / 2 + (1 - getValue(state.room, 'width')) / 2 + characters.player.width;
		const edge = (1 + getValue(state.room, 'width')) / 2;
		if (playerEdge >= edge) {
			const playerPos = state.player.y - characters.player.height / (2 * getValue(state.room, 'height'));
			for (const door of (state.room.doors || []).filter(d => d.wall == 'e')) {
				const y1 = door.location;
				const y2 = door.location + (doorSize - characters.player.height) / getValue(state.room, 'height');

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
		const edge = characters.player.height / (2 * getValue(state.room, 'height'));
		state.player.y -= inc / getValue(state.room, 'height');
		if (state.player.y <= edge) {
			const playerPos = state.player.x - characters.player.width / (2 * getValue(state.room, 'width'));
			for (const door of (state.room.doors || []).filter(d => d.wall == 'n')) {
				const x1 = door.location;
				const x2 = door.location + (doorSize - 0.8 * characters.player.width) / getValue(state.room, 'width');
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
		state.player.y += inc / getValue(state.room, 'height');
		const playerEdge = state.player.y * getValue(state.room, 'height') - characters.player.height / 2 + (1 - getValue(state.room, 'height')) / 2 + characters.player.height;
		const edge = (1 + getValue(state.room, 'height')) / 2;
		if (playerEdge >= edge) {
			const playerPos = state.player.x - characters.player.width / (2 * getValue(state.room, 'width'));
			for (const door of (state.room.doors || []).filter(d => d.wall == 's')) {
				const x1 = door.location;
				const x2 = door.location + (doorSize - 0.8 * characters.player.width) / getValue(state.room, 'width');
				// {
				// 	const loc = toScreen({
				// 		x: x1,
				// 		y: 1
				// 	});
				// 	ctx.fillStyle = '#f00';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
				// {
				// 	const loc = toScreen({
				// 		x: x2,
				// 		y: 1
				// 	});
				// 	ctx.fillStyle = '#f00';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
				// {
				// 	const loc = toScreen({
				// 		x: playerPos,
				// 		y: 1
				// 	});
				// 	ctx.fillStyle = '#0f0';
				// 	ctx.fillRect(loc.x, loc.y, 4, 4);
				// }
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

	// check for intersection with other character
	for (const roomCharacter of state.room.characters || []) {
		const character = characters[roomCharacter.id];
		const playerWidth = characterIntersectionLeeway * (characters.player.width / getValue(state.room, 'width')) / 2;
		const playerHeight = characterIntersectionLeeway * (characters.player.height / getValue(state.room, 'height')) / 2;
		const characterWidth = characterIntersectionLeeway * (character.width / getValue(state.room, 'width')) / 2;
		const characterHeight = characterIntersectionLeeway * (character.height / getValue(state.room, 'height')) / 2;
		if (state.player.x + playerWidth > roomCharacter.location.x - characterWidth &&
			state.player.x - playerWidth < roomCharacter.location.x + characterWidth &&
			state.player.y + playerHeight > roomCharacter.location.y - characterHeight &&
			state.player.y - playerHeight < roomCharacter.location.y + characterHeight
		) {
			state.player.x = prevPlayerLoc.x;
			state.player.y = prevPlayerLoc.y;
			// console.log(roomCharacter.location);
			// console.log(character.width);
			if (character.type == 'merchant') {
				state.isPaused = true;
				document.getElementById('toggle-pause').innerHTML = 'Resume';
				drawMerchantInteraction();
			}
		}
	}

	// go through portal
	for (const portal of state.room.portals || []) {
		// const x = (1 - getValue(state.room, 'width')) / 2 + (portal.location.x * getValue(state.room, 'width')) + (portalSize * 0.1);
		// const y = (1 - getValue(state.room, 'height')) / 2 + (portal.location.y * getValue(state.room, 'height')) + (portalSize * 0.1);
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
			setRoom(rooms.find(r => r.id == portal.roomId));
			state.player.x = state.player.y = 0.5;
		}
	}

	// pick up an item
	let i = 0;
	for (const roomItem of state.room.items || []) {
		const item = items[roomItem.id];
		// console.log('item', item);
		// console.log('state.inventory[item.id]', state.inventory[roomItem.id]);
		if (item.image.height > 0 && (item.type != 'weapon' || !state.inventory[roomItem.id])) {
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
				}, interval * numTakeItemAnimSteps);
				const item = items[roomItem.id];
				state.inventory[roomItem.id] = (state.inventory[roomItem.id] || 0) + (roomItem.value || item.value || 1);
				play(item.sounds.pickup);
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
		setRoom(throughDoor.room);
		if (!state.mappedRooms.includes(state.room.id)) {
			state.mappedRooms.push(state.room.id);
			// console.log(mappedRooms);
		}
		throughDoor = null;
		if (oppositeWall) {
			if (oppositeWall == 's') {
				state.player.y = 1 - characters.player.height / (2 * getValue(state.room, 'height'));
			} else if (oppositeWall == 'n') {
				state.player.y = characters.player.height / (2 * getValue(state.room, 'height'));;
			} else if (oppositeWall == 'e') {
				state.player.x = 1 - characters.player.width / (2 * getValue(state.room, 'width'));
			} else {
				state.player.x = characters.player.width / (2 * getValue(state.room, 'height'));;
			}

			const door = (state.room.doors || []).find(d => d.wall == oppositeWall && d.room.id == prevRoom.id);
			if (['n', 's'].includes(oppositeWall)) {
				if (door) {
					state.player.x = door.location + (characters.player.width / getValue(state.room, 'width')) / 2;
				} else {
					state.player.x = (1 - getValue(state.room, 'width') * characters.player.width) / 2;
				}
			} else {
				// console.log('state.room.doors ', state.room.doors);
				// console.log('door', door);
				// console.log('oppositeWall ', oppositeWall);
				// console.log('prevRoom', prevRoom);
				if (door) {
					state.player.y = door.location + (characters.player.height / getValue(state.room, 'height')) / 2;
				} else {
					state.player.y = (1 - getValue(state.room, 'height') * characters.player.height) / 2;
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
				ctx.lineWidth = 2 * wallWidth * mapScale * canvas.width;
				const width = getValue(room, 'width') * mapScale * canvas.width;
				const height = getValue(room, 'height') * mapScale * canvas.height;
				const x = - width / 2;
				const y = - height / 2;
				ctx.beginPath();
				ctx.rect(x + offset.x, y + offset.y, width, height);
				ctx.stroke();
				// ctx.fillStyle = mapRoomColor;
				// ctx.fillRect(x + offset.x, y + offset.y, width, height);
				const roomBackground = new Image();
				roomBackground.src = `img/rooms/${room.backgroundImage}`;
				ctx.drawImage(roomBackground, x + offset.x, y + offset.y, width, height);
			}

			for (const door of room.doors || []) {
				door.p1 = {};
				door.p2 = {};
				if (['e', 'w'].includes(door.wall)) {
					door.p1.y = (door.location - 1) * getValue(room, 'height') / 2 * mapScale * canvas.height;
					door.p2.y = door.p1.y + doorSize * mapScale * canvas.height;
					door.p1.x = door.p2.x = getValue(room, 'width') * mapScale * canvas.width / 2;
					if (door.wall == 'w') {
						door.p1.x *= -1;
						door.p2.x *= -1;
					}
				} else {
					door.p1.x = (door.location - 1) * getValue(room, 'width') / 2 * mapScale * canvas.width;
					door.p2.x = door.p1.x + doorSize * mapScale * canvas.width;
					door.p1.y = door.p2.y = getValue(room, 'height') * mapScale * canvas.height / 2;
					if (door.wall == 'n') {
						door.p1.y *= -1;
						door.p2.y *= -1;
						// console.log(door.p1);
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
				if (state.mappedRooms.includes(door.room.id)) {
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

					ctx.strokeStyle = room.wallColor || wallColor;
					ctx.lineWidth = wallWidth * mapScale * canvas.width;
					ctx.beginPath();
					ctx.moveTo(door.p1.x, door.p1.y);
					ctx.lineTo(door.oppositeDoor.p1.x, door.oppositeDoor.p1.y);
					ctx.stroke();
					ctx.beginPath();
					ctx.lineTo(door.p2.x, door.p2.y);
					ctx.lineTo(door.oppositeDoor.p2.x, door.oppositeDoor.p2.y);
					ctx.stroke();
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
		ctx.drawImage(characterFrames.player.idleFrames[0], x, y, width, height);
	}
}


function drawMerchantInteraction() {
	document.getElementById('merchant-modal-init-content').classList.remove('hidden');
	document.getElementById('merchant-modal-content').classList.add('hidden');
	document.getElementById('merchant-modal').classList.remove('hidden');
}

function drawInventory() {
	document.getElementById('inventory-modal').classList.remove('hidden');
	let html = '';
	let numLines = 0;
	const itemIds = Object.keys(state.inventory);
	const itemOrder = ['treasure', 'weapon', 'potion'];
	itemIds.sort((id1, id2) => {
		const type1 = items[id1].type;
		const type2 = items[id2].type;
		return itemOrder.indexOf(type1) > itemOrder.indexOf(type2) ? 1 : -1;
	});
	for (const itemId of itemIds) {
		numLines++;
		const item = items[itemId];
		html += '<tr>';
		html += `<td><img src="${item.image.src}"/></td>`;
		html += `<td>${item.label}</td>`;
		const type = items[itemId].type;
		if (state.inventory[itemId]) {
			let text = state.inventory[itemId];
			if (items[itemId].type == 'weapon') {
				text += '/' + items[itemId].value;
			}
			if (type == 'treasure') {
				text = `${moneySymbol} ${text}`;
			}
			html += `<td>${text}</td>`;
		}
		if (type == 'weapon') {
			html += `<td><div class="button" onClick="dropItem('${itemId}')">Drop</div></td>`;
		} else if (type == 'potion') {
			html += `<td><div class="button" onClick="quaffPotion('${itemId}')">Quaff</div></td>`;
		}
		html += '</tr>';
	}

	// for (let i = 0; i < 20; i++) {
	// 	html += '<tr>';
	// 	html += `<td>tototo</td>`;
	// 	html += `<td>tatata</td>`;
	// 	html += '</tr>';
	// }
	if (!html) {
		numLines = 1;
		html = '<tr><th>No items</th></tr>';
	}
	const spacerHeight = 280 - (numLines * 40);
	html += `<tr id="inventory-spacer" style="height: ${spacerHeight}px;"></tr>`;
	document.getElementById('inventory-table').innerHTML = html;
}

function attack() {
	const targetedCharacter = getTargetedCharacter();
	if (targetedCharacter) {
		attackMotion = targetedCharacter.location.x < state.player.x ? 'left' : 'right';
		animate(state.player);
		const weapon = items[state.player.wielding];
		setTimeout(() => {
			attackMotion = null;
		}, weapon.resetTime);
		const character = characters[targetedCharacter.id];
		const weaponValue = state.inventory[state.player.wielding] / weapon.value;
		targetedCharacter.health -= weaponValue * weapon.damage / character.resilience;

		if (weapon.sounds.hit) {
			play(weapon.sounds.hit);
		}
		if (character.sounds.injured) {
			setTimeout(() => {
				play(character.sounds.injured);
			}, 200);
		}

		if (targetedCharacter.health <= 0) {
			// die
			targetedCharacter.motion = 'dieFrames';
			animate(targetedCharacter);
			play(character.sounds.die);

			const interval = 24;
			targetedCharacter.animStep = 0;
			targetedCharacter.deathAnimIntervalId = setInterval(() => {
				targetedCharacter.animStep++;
				if (targetedCharacter.animStep >= numCharacterDieAnimSteps) {
					clearInterval(targetedCharacter.deathAnimIntervalId);
					if (state.room.characters) {
						state.room.characters = state.room.characters.filter(c => c != targetedCharacter);
					}
				}
			}, interval);
		}

		state.inventory[state.player.wielding]--;
		if (state.inventory[state.player.wielding] <= 0) {
			delete state.inventory[state.player.wielding];
			state.player.wielding = null;
			play(weapon.sounds.broken);
		}
	}
}

function getTargetedCharacter() {
	if (attackMotion || !state.player.wielding) {
		return;
	}
	const weapon = items[state.player.wielding];
	let minDist;
	let closestCharacter;
	// console.log(weapon);
	for (const roomCharacter of state.room.characters || []) {
		const character = characters[roomCharacter.id];
		if (character.type == 'enemy') {
			const dist = distance(roomCharacter);
			// console.log(dist);
			if ((!minDist || dist < minDist) && dist <= weapon.range) {
				minDist = dist;
				closestCharacter = roomCharacter;
			}
		}
	}
	return closestCharacter;
}


function onKeyUp(e) {
	// console.log('onKeyUp', e);
	if (e.code != 'Tab' && e.key != 'Alt') {
		didUserInteract = true;
	}
	if (state.didDie) {
		return;
	}

	if (e.code != 'F5') {
		setTimeout(() => {
			// console.log(roomMusic);
			play(roomMusic);
			roomMusic.addEventListener('ended', function () {
				play(roomMusic);
			});
		}, 20);
	}

	delete keysDown[e.code];
	if (Object.keys(keysDown).length == 0) {
		state.player.motion = 'idleFrames';
		animate(state.player);
	}

	if (e.key.toUpperCase() == 'M') {
		state.player.motion = 'idleFrames';
		animate(state.player);
		drawFunc = drawFunc == drawMap ? drawGame : drawMap;
		closeModals();
	} else if (e.key.toUpperCase() == 'I') {
		state.player.motion = 'idleFrames';
		animate(state.player);
		closeModals();
		if (!state.isPaused) {
			togglePause();
		}
		// drawFunc = drawFunc == drawInventory ? drawGame : drawInventory;
		drawInventory();
	} else if (e.key.toUpperCase() == 'A') {
		attack();
	} else if (e.key.toUpperCase() == 'C') {
		const weaponIds = Object.keys(state.inventory).filter(id => items[id].type == 'weapon');
		let next, didSelect;
		if (state.player.wielding) {
			for (const id of weaponIds) {
				if (next) {
					state.player.wielding = id;
					// console.log('state.player.wielding', state.player.wielding);
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
			state.player.wielding = weaponIds[0];
		}
		if (state.player.wielding && items[state.player.wielding].sounds.draw) {
			play(items[state.player.wielding].sounds.draw);
		}

		animate(state.player);
	} else if (e.key == 'Escape') {
		drawFunc = drawGame;
		closeModals();
	}
}

function onKeyDown(e) {
	// console.log('onKeyDown', e);
	if (state.didDie) {
		return;
	}

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
	if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'M', 'I', 'A', 'C'].includes(e.code)) {
		keysDown[e.code] = true;
	}
}

function animate(character) {
	// if (character.id != 'player') {
	// 	console.log('character', character);
	// }
	clearInterval(animIntervalIds[character.id]);

	animFrameNums[character.id] = 0;
	let motion = character.motion;
	// console.log('starting anim', motion);
	function f() {
		let frames;
		if (state.player.wielding && character.id == 'player' && !state.didDie) {
			if (attackMotion) {
				frames = characterFrames[character.id].attack[state.player.wielding][attackMotion];
			} else {
				if (!characterFrames[character.id].wielding[state.player.wielding][motion]) {
					// console.log(motion);
					motion = 'left';
				}
				frames = characterFrames[character.id].wielding[state.player.wielding][motion];
			}
		} else {
			frames = characterFrames[character.id][motion];
		}
		// if (character.id != 'player') {
		// 	console.log('motion', motion);
		// }
		characterImages[character.id] = frames[animFrameNums[character.id] % frames.length];
		animFrameNums[character.id]++;
		// console.log('anim', motion);
		// console.log(characterImages[character.id]);
	}

	f();
	animIntervalIds[character.id] = setInterval(f, characters[character.id].animInterval);

	if (character.id == 'player' && ['left', 'right', 'up', 'down'].includes(motion)) {
		play(characters.player.sounds.walk);
		characters.player.sounds.walk.addEventListener('ended', function () {
			if (['left', 'right', 'up', 'down'].includes(state.player.motion)) {
				play(characters.player.sounds.walk);
			}
		});
	}
}

function toScreen(loc, character) {
	character = character || {
		width: 0,
		height: 0
	};
	if (isNaN(loc.x) || isNaN(loc.y) || isNaN(character.width) || isNaN(character.height)) {
		console.error('toScreen: NaN detected!', loc, character);
	}
	const x = ((loc.x * getValue(state.room, 'width')) - character.width / 2 + (1 - getValue(state.room, 'width')) / 2) * canvas.width;
	const y = ((loc.y * getValue(state.room, 'height')) - character.height / 2 + (1 - getValue(state.room, 'height')) / 2) * canvas.height;
	return { x, y };
}

// return distnace as proportion of canvas size
function distance(roomCharacter) {
	const x1 = roomCharacter.location.x * getValue(state.room, 'width');
	const y1 = roomCharacter.location.y * getValue(state.room, 'height');
	const x2 = state.player.x * getValue(state.room, 'width');
	const y2 = state.player.y * getValue(state.room, 'height');
	const dx = x1 - x2;
	const dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}

function debug(text) {
	ctx.font = `22px ${fontFamily}`;
	ctx.fillStyle = '#00f';
	ctx.fillText(text, 8, 22);
}

function play(sound) {
	if (sound && didUserInteract) {
		try {
			sound.play();
			return true;
		} catch (e) {
			console.error(e);
		}
	}
}

function showModal(id) {
	play(clickSound);
	const modal = document.getElementById(id);
	state.isPaused = true;
	document.getElementById('toggle-pause').innerHTML = 'Resume';
	modal.classList.remove('hidden');
}

function togglePause() {
	// console.log('togglePause', state.isPaused);
	play(clickSound);
	if (state.didDie) {
		// TODO take player to init room of current level
		reset();
	} else {
		state.isPaused = !state.isPaused;
		document.getElementById('toggle-pause').innerHTML = state.isPaused ? 'Resume' : 'Pause';
	}
}

function closeModals() {
	const modals = document.getElementsByClassName('modal');
	for (let i = 0; i < modals.length; i++) {
		modals[i].classList.add('hidden');
	}
	if (state.isPaused) {
		togglePause();
	}
}

function dropItem(itemId) {
	const value = state.inventory[itemId];
	delete state.inventory[itemId];
	drawInventory();
	state.room.items.push({
		id: itemId,
		location: {
			x: state.player.x + (state.player.x > 0.16 ? -1 : 1) * 0.14,
			y: state.player.y
		},
		value,
	});
	if (state.player.wielding == itemId) {
		state.player.wielding = null;
	}
}

function quaffPotion(itemId) {
	if (items[itemId].action(state)) {
		state.inventory[itemId]--;
		if (state.inventory[itemId] <= 0) {
			delete state.inventory[itemId];
		}
		play(items[itemId].sounds.quaff);
		drawInventory();
		drawStatus();
	}
}

function setRoom(room) {
	state.room = room;
	for (id in animIntervalIds) {
		clearInterval(animIntervalIds[id]);
	}

	for (const character of room.characters || []) {
		character.motion = 'idleFrames';
		animate(character);
	}

	if (room.sounds && room.sounds.enter) {
		play(room.sounds.enter);
	}
	roomMusic && roomMusic.pause();
	roomMusic = (room.sounds && rooms[room.id].sounds.ambient) || defaultRoomMusic;
	// console.log('setRoom roomMusic ', roomMusic);
}

function showMerchantSelection(type) {
	const content = document.getElementById('merchant-modal-content');
	const contentInner = document.getElementById('merchant-modal-content-inner');
	const initContent = document.getElementById('merchant-modal-init-content');
	initContent.classList.add('hidden');

	let html = `<div id="player-treasure-amount">Your treasure: ${moneySymbol} ${state.inventory.treasure || 0}</div > `;

	html += '<div class="table-container">';
	html += '<table>';
	if (type == 'buy') {
		const merchant = state.room.characters.find(c => c.id == 'merchant');
		html += '<tr><th></th><th>Item</th><th>Value</th><th></th></tr>';
		for (const itemId of merchant.itemsForSale) {
			const item = items[itemId];
			html += '<tr>';
			html += `<td><img src="${item.image.src}"/></td>`;
			html += `<td>${item.label}</td>`;
			html += `<td>${moneySymbol} ${item.cost}</td>`;
			html += `<td><div class="button" onClick="buyItem('${itemId}')">Buy</div></td>`;
			html += '</tr>';
		}
		// for (let i = 0; i < 20; i++) {
		// 	html += '<tr>';
		// 	html += `<td>wawawa</td>`;
		// 	html += '</tr>';
		// }
	} else if (type == 'sell') {
		let numSaleableItems = 0;
		for (const itemId in state.inventory) {
			const item = items[itemId];
			if (item.type != 'treasure') {
				numSaleableItems++;
			}
		}
		if (numSaleableItems == 0) {
			html += '<tr><th>You have nothing that interests me.</th></tr>';
		} else {
			html += '<tr><th></th><th>Item</th><th>Value</th><th></th></tr>';
			for (const itemId in state.inventory) {
				const item = items[itemId];
				if (item.type != 'treasure') {
					let value = item.cost * resaleFactor;
					if (item.type == 'weapon') {
						value *= state.inventory[itemId] / item.value;
					}
					value = Math.ceil(value);
					html += '<tr>';
					html += `<td><img src="${item.image.src}"/></td>`;
					html += `<td>${item.label}</td>`;
					html += `<td>${moneySymbol} ${value}</td>`;
					html += `<td><div class="button" onClick="sellItem('${itemId}', ${value})">Sell</div></td>`;
					html += '</tr>';
				}
			}
		}
		if (numSaleableItems == 0) {
			html += '<tr><th>You have nothing that interests me.</th></tr>';
		}
	} else if (type == 'repair') {
		let numWeapons = 0;
		for (const itemId in state.inventory) {
			const type = items[itemId].type;
			if (type == 'weapon') {
				numWeapons++;
			}
		}

		if (numWeapons == 0) {
			html += '<tr><th>You don\'t appear to be carrying any weapons...</th></tr>';
		} else {
			let hasDamagedWeapon;
			for (const itemId in state.inventory) {
				const item = items[itemId];
				if (item.type == 'weapon' && state.inventory[itemId] < item.value) {
					hasDamagedWeapon = true;
					break;
				}
			}
			if (hasDamagedWeapon) {
				html += '<tr><th></th><th>Item</th><th>Condition</th><th>Cost</th><th></th></tr>';
			}
			for (const itemId in state.inventory) {
				const item = items[itemId];
				if (item.type == 'weapon' && state.inventory[itemId] < item.value) {
					html += '<tr>';
					html += `<td><img src="${item.image.src}"/></td>`;
					html += `<td>${item.label}</td > `;
					html += `<td>${state.inventory[itemId]}/${item.value}</td>`;
					html += `<td>${moneySymbol} ${item.repairCost}</td>`;
					html += `<td><div class="button" onClick="repairItem('${itemId}')">Repair</div></td>`;
					html += '</tr>';
				}
			}
			if (!hasDamagedWeapon) {
				html += '<tr><th>All your weapons are in excellent condition!<br/> There\'s nothing for me to repair here.</th></tr>';
			}
		}
	}
	html += '</table>';
	html += '</div>';
	contentInner.innerHTML = html;
	content.classList.remove('hidden');
}

function repairItem(itemId) {
	const item = items[itemId];
	if (item.repairCost > (state.inventory.treasure || 0)) {
		toast('Sorry, you can\'t afford my fee. Come back with more gold!');
	} else {
		play(characters.merchant.sounds.repair);
		state.inventory.treasure -= item.repairCost;
		state.inventory[itemId] = item.value;
		toast('There you are... good as new!');
		drawMerchantInteraction();
	}
}

function sellItem(itemId, value) {
	play(characters.merchant.sounds.sell);
	state.inventory.treasure = (state.inventory.treasure || 0) + value;
	if (items[itemId].type == 'weapon') {
		if (state.player.wielding == itemId) {
			state.player.wielding = null;
		}
		delete state.inventory[itemId];
	} else {
		state.inventory[itemId]--;
		if (state.inventory[itemId] == 0) {
			delete state.inventory[itemId];
		}
	}
	toast('Thank you! It has been a pleasure doing business.');
	drawMerchantInteraction();
}

function buyItem(itemId) {
	const item = items[itemId];
	if (item.cost > (state.inventory.treasure || 0)) {
		toast('Sorry, you can\'t afford that. Come back with more gold!');
	} else {
		if (item.type == 'weapon' && state.inventory[itemId] > 0) {
			toast('It looks like you\'re already carrying one of those.<br/> Maybe you\'d like to sell me yours first?');
		} else {
			play(characters.merchant.sounds.buy);
			state.inventory.treasure -= item.cost;
			state.inventory[itemId] = item.value;
			toast('Sold! It has been a pleasure doing business.');
			drawMerchantInteraction();
		}
	}
}

function merchantCancel() {
	const content = document.getElementById('merchant-modal-content');
	const initContent = document.getElementById('merchant-modal-init-content');
	content.classList.add('hidden');
	initContent.classList.remove('hidden');
}

function toast(message) {
	const toast = document.getElementById('toast');
	toast.innerHTML = message;
	toast.classList.remove('hidden');
	toast.style.opacity = 1;
	setTimeout(() => {
		let opacity = 1;
		const intervalId = setInterval(() => {
			toast.style.opacity = opacity;
			opacity -= 0.04;
			if (opacity <= 0) {
				toast.classList.add('hidden');
				clearInterval(intervalId);
			}
		}, 40);
	}, 2400);
}

function reset() {
	play(dreamSound);
	let opacity = 1;
	setInterval(() => {
		document.body.style.opacity = opacity;
		opacity -= 0.01;
	}, 20);
	setTimeout(() => {
		delete localStorage.state;
		delete localStorage.rooms;
		location.href = location.href;
	}, 2000);
}
