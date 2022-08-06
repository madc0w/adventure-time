'use strict';

const slowdown = 0;
const characterIntersectionLeeway = 0.88;
const resaleFactor = 0.7;
const moneySymbol = '&#10086;';
const wallColor = '#3f2f0c';
const backgroundColor = '#c1e5be';
const doorSize = 0.15;
const doorThreshold = 0.04;
const doorwaySize = {
	width: 0.012,
	height: 0.024,
};
const wallWidth = 0.02;
const moveIncrement = 0.008;
const itemTakeDistance = 0.1;
const numTakeItemAnimSteps = 12;
const numCharacterDieAnimSteps = 148;
const projectileSizeFactor = 1.2;

const mapBackgroundColor = '#e2e2b1';
const mapPassageColor = '#ccd';
const mapMargin = 0.02;
const mapScale = 0.24;

const portalSize = 0.12;
const portalAnimInterval = 60;
const numPortalFrames = 38;
const roomWallColor = '#222';

const fontFamily = 'Lato';
// const fontFamily = 'Jura';

let drawFunc = drawGame;
const doorImages = {};
const characterFrames = {};
const keysDown = {};
const animIntervalIds = {};
const animFrameNums = {};
const characterImages = {};
const portalFrames = [];
const debugPoints = [];
let state,
	throughDoor,
	canvas,
	ctx,
	statusCanvas,
	statusCtx,
	portalImage,
	attackMotion,
	clickSound,
	roomMusic,
	dreamSound,
	lockedDoorSound,
	didUserInteract,
	initRooms,
	initCharacters,
	levelUpSound,
	isAiming,
	rockScrapeSound,
	isPulling,
	portalSound;

function load() {
	canvas = document.getElementById('game-canvas');
	statusCanvas = document.getElementById('status-canvas');
	canvas.width = Math.min(innerWidth * 0.86 - 28, innerHeight * 0.8 - 68);
	canvas.height = canvas.width;
	statusCanvas.width = canvas.width;
	statusCanvas.height = innerHeight * 0.14;
	ctx = canvas.getContext('2d');
	statusCtx = statusCanvas.getContext('2d');
	initRooms = JSON.parse(JSON.stringify(rooms));
	initCharacters = JSON.parse(JSON.stringify(characters));

	portalSound = new Audio('sounds/portal.mp3');
	levelUpSound = new Audio('sounds/level up.mp3');
	dreamSound = new Audio('sounds/dream.mp3');
	clickSound = new Audio('sounds/click.mp3');
	lockedDoorSound = new Audio('sounds/locked door.mp3');
	rockScrapeSound = new Audio('sounds/rock scrape.mp3');
	if (window.defaultRoomMusic) {
		window.defaultRoomMusic = new Audio(`sounds/${window.defaultRoomMusic}`);
	}

	initState();
	if (localStorage.state) {
		state = JSON.parse(localStorage.state);
		if (state.room) {
			state.room = rooms.find((r) => r.id == state.room.id);
			state.room.doors = rooms[state.room.id].doors;
			assignFunctions(
				rooms.find((r) => r.id == state.room.id),
				state.room
			);
			if (localStorage.rooms) {
				const savedRooms = JSON.parse(localStorage.rooms);
				for (const savedRoom of savedRooms) {
					const room = rooms.find((r) => r.id == savedRoom.id);
					assignFunctions(room, savedRoom);
					room.items = savedRoom.items;
					room.characters = savedRoom.characters;
					room.walls = savedRoom.walls;

					// console.log('savedRoom.width', savedRoom.width);
					// console.log('room.width', room.width);
				}
			}
			// for (const sound in state.room.sounds) {
			// 	console.log('state.room.sounds ', sound);
			// }
		}
		setPaused(false);
	}

	setInterval(saveState, 1000);

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
					for (const direction in characters[characterId][key][weaponName] ||
						{}) {
						characterFrames[characterId][key][weaponName][direction] = [];
						for (const fileName of characters[characterId][key][weaponName][
							direction
						] || []) {
							const img = new Image();
							img.src = `img/charactes/${fileName}`;
							characterFrames[characterId][key][weaponName][direction].push(
								img
							);
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

	{
		const img = new Image();
		img.src = `img/rooms/door vertical.png`;
		doorImages.vertical = img;
	}
	{
		const img = new Image();
		img.src = `img/rooms/door horizontal.png`;
		doorImages.horizontal = img;
	}

	characterImages.player = characterFrames.player.idleFrames[0];

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	document.addEventListener('mousedown', (e) => {
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
			door.room = rooms.find((r) => r.id == door.roomId);
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
				w: 'e',
			}[door.wall];
			const location = door.location;

			if (door.isOneWay) {
				// TODO add a special hidden door for map
			} else {
				if (!door.room.doors) {
					door.room.doors = [];
				}
				// console.log(door.room.doors.find(d => d.room == room));
				if (!door.room.doors.find((d) => d.room == room)) {
					const oppositeDoor = {
						room,
						wall,
						location,
						oppositeDoor: door,
						key: door.key,
					};
					door.room.doors.push(oppositeDoor);
					door.oppositeDoor = oppositeDoor;
				}
			}
		}
	}
	// console.log(rooms);

	if (localStorage.state && state.room) {
		setRoom(state.room);
		if (state.isGameOver) {
			document.getElementById('toggle-pause').innerHTML = 'Play Again';
			state.player.motion = 'dieFrames';
			animate(state.player);
		}
	} else {
		setRoom(rooms[0]);
		state.t = 0;
	}
	if (!state.mappedRooms) {
		state.mappedRooms = [rooms[0].id];
	}

	let lastFrameCount = state.t;
	setInterval(() => {
		// console.log('FPS', state.t - lastFrameCount);
		lastFrameCount = state.t;
	}, 1000);

	showLevel();

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

		for (const point of debugPoints) {
			ctx.fillStyle = point.color || '#f00';
			ctx.beginPath();
			ctx.arc(point.p.x, point.p.y, 6, 0, 2 * Math.PI);
			ctx.fill();
		}

		state.t++;
	}
	setTimeout(() => {
		requestAnimationFrame(draw);
	}, slowdown);
}

function drawStatus() {
	statusCtx.fillStyle = backgroundColor;
	statusCtx.fillRect(0, 0, statusCanvas.width, statusCanvas.height);
	const fontSize = 0.2 * statusCanvas.height;
	statusCtx.font = `${fontSize}px ${fontFamily}`;
	statusCtx.fillStyle = '#000';
	statusCtx.fillText(
		'Health',
		0.02 * statusCanvas.width,
		0.24 * statusCanvas.height
	);
	statusCtx.fillText(
		'Weapons',
		0.02 * statusCanvas.width,
		0.58 * statusCanvas.height
	);

	statusCtx.fillStyle = '#444';
	statusCtx.fillRect(
		0.24 * statusCanvas.width - 4,
		0.14 * statusCanvas.height - 4,
		0.6 * statusCanvas.width + 8,
		0.1 * statusCanvas.height + 8
	);
	statusCtx.fillStyle = '#b44';
	statusCtx.fillRect(
		0.24 * statusCanvas.width,
		0.14 * statusCanvas.height,
		0.6 * state.player.health * statusCanvas.width,
		0.1 * statusCanvas.height
	);

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
	const roomWidth = getValue(state.room, 'width');
	const roomHeight = getValue(state.room, 'height');
	{
		// room background
		const roomBackground = new Image();
		roomBackground.src = `img/rooms/${
			state.room.backgroundImage || defaultRoomBackground
		}`;
		const x = ((1 - roomWidth) * canvas.width) / 2;
		const y = ((1 - roomHeight) * canvas.height) / 2;
		ctx.drawImage(
			roomBackground,
			x,
			y,
			roomWidth * canvas.width,
			roomHeight * canvas.height
		);
	}
	{
		// wall
		ctx.strokeStyle = state.room.wallColor || wallColor;
		ctx.lineWidth = canvas.width * wallWidth;
		ctx.beginPath();
		const x = ((1 - roomWidth) * canvas.width) / 2;
		const y = ((1 - roomHeight) * canvas.height) / 2;
		ctx.rect(x, y, roomWidth * canvas.width, roomHeight * canvas.height);
		ctx.stroke();
	}
	// room walls
	for (const wall of state.room.walls || []) {
		const x = (1 - roomWidth) / 2 + wall.location.x * roomWidth;
		const y = (1 - roomHeight) / 2 + wall.location.y * roomHeight;
		const width = roomWidth * wall.width;
		const height = roomHeight * wall.height;
		if (wall.background) {
			const image = new Image();
			image.src = `img/rooms/${wall.background}`;
			ctx.drawImage(
				image,
				x * canvas.width,
				y * canvas.height,
				width * canvas.width,
				height * canvas.height
			);
		} else {
			ctx.fillStyle = wall.color || roomWallColor;
			ctx.beginPath();
			ctx.rect(
				x * canvas.width,
				y * canvas.height,
				width * canvas.width,
				height * canvas.height
			);
			ctx.fill();
		}
	}

	// portals
	for (const portal of state.room.portals || []) {
		const loc = toScreen(portal.location, {
			width: portalSize,
			height: portalSize,
		});
		portalImage &&
			ctx.drawImage(
				portalImage,
				loc.x,
				loc.y,
				portalSize * canvas.width,
				portalSize * canvas.height
			);
	}

	// items
	for (const roomItem of state.room.items || []) {
		const item = items[roomItem.id];
		let size = item.size;
		if (item.image.height != 0) {
			const loc = toScreen(roomItem.location, {
				width: (size * item.image.width) / item.image.height,
				height: size,
			});
			if (roomItem.animStep) {
				size -= (roomItem.animStep * item.size) / 16;
				loc.x += ((item.size - size) * canvas.width) / 2;
				loc.y += ((item.size - size) * canvas.height) / 2;
				ctx.globalAlpha =
					(numTakeItemAnimSteps - roomItem.animStep) / numTakeItemAnimSteps;
			}
			// console.log(item.image.width / item.image.height);
			if (size > 0) {
				ctx.drawImage(
					item.image,
					loc.x,
					loc.y,
					((size * item.image.width) / item.image.height) * canvas.width,
					size * canvas.height
				);
			}
			ctx.globalAlpha = 1;
		}
		// let x = ((1 - getValue(state.room, 'width')) / 2 + (roomItem.location.x * getValue(state.room, 'width'))) * canvas.width;
		// let y = ((1 - getValue(state.room, 'height')) / 2 + (roomItem.location.y * getValue(state.room, 'height'))) * canvas.height;
	}
	{
		// characters
		for (const roomCharacter of state.room.characters || []) {
			const character = characters[roomCharacter.id];

			if (!state.isGameOver) {
				if (
					roomCharacter.motion != 'attackFrames' &&
					character.attackMetrics &&
					Math.random() < character.attackMetrics.prob &&
					distance(roomCharacter) < character.attackMetrics.range &&
					roomCharacter.motion != 'dieFrames'
				) {
					roomCharacter.motion = 'attackPrepFrames';
					animate(roomCharacter);
					setTimeout(() => {
						if (
							distance(roomCharacter) < character.attackMetrics.range &&
							roomCharacter.motion != 'dieFrames'
						) {
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
				// console.log('3 roomCharacter.location', roomCharacter.location);

				for (const roomCharacter2 of interactingCharacters) {
					if (roomCharacter != roomCharacter2) {
						for (const interact of character.interact || []) {
							interact(roomCharacter, roomCharacter2);
						}
					}
				}

				// console.log('4 roomCharacter.location', roomCharacter.location);
				if (
					roomCharacter.location.x < 0 ||
					roomCharacter.location.x > 1 - character.width / roomWidth
				) {
					if (roomCharacter.vel) {
						roomCharacter.vel.x *= -1;
					}
					// roomCharacter.velInversionTime.x = now;
				}
				if (
					roomCharacter.location.y < 0 ||
					roomCharacter.location.y > 1 - character.height / roomHeight
				) {
					if (roomCharacter.vel) {
						roomCharacter.vel.y *= -1;
					}
				}

				roomCharacter.location.y = Math.min(
					1 -
						character.height / roomHeight +
						character.height / (2 * roomHeight),
					roomCharacter.location.y
				);
				roomCharacter.location.y = Math.max(
					character.height / (2 * roomHeight),
					roomCharacter.location.y
				);
				roomCharacter.location.x = Math.min(
					1 - character.width / roomWidth + character.width / (2 * roomWidth),
					roomCharacter.location.x
				);
				roomCharacter.location.x = Math.max(
					character.width / (2 * roomWidth),
					roomCharacter.location.x
				);

				const playerWidth =
					(characterIntersectionLeeway *
						(characters.player.width / roomWidth)) /
					2;
				const playerHeight =
					(characterIntersectionLeeway *
						(characters.player.height / roomHeight)) /
					2;
				const characterWidth =
					(characterIntersectionLeeway * (character.width / roomWidth)) / 2;
				const characterHeight =
					(characterIntersectionLeeway * (character.height / roomHeight)) / 2;
				if (
					state.player.x + playerWidth >
						roomCharacter.location.x - characterWidth &&
					state.player.x - playerWidth <
						roomCharacter.location.x + characterWidth &&
					state.player.y + playerHeight >
						roomCharacter.location.y - characterHeight &&
					state.player.y - playerHeight <
						roomCharacter.location.y + characterHeight
				) {
					roomCharacter.location.x = prevCharacterLoc.x;
					roomCharacter.location.y = prevCharacterLoc.y;
				}

				// check for intersection with room walls
				{
					const left =
						roomCharacter.location.x - character.width / roomWidth / 2;
					const right =
						roomCharacter.location.x + character.width / roomWidth / 2;
					const top =
						roomCharacter.location.y - character.height / roomHeight / 2;
					const bottom =
						roomCharacter.location.y + character.height / roomHeight / 2;
					const prevLeft = prevCharacterLoc.x - character.width / roomWidth / 2;
					const prevRight =
						prevCharacterLoc.x + character.width / roomWidth / 2;
					const prevTop =
						prevCharacterLoc.y - character.height / roomHeight / 2;
					const prevBottom =
						prevCharacterLoc.y + character.height / roomHeight / 2;
					const characterCorners = [
						{
							// id: 'top-left',
							x: left,
							y: top,
							prevX: prevLeft,
							prevY: prevTop,
						},
						{
							// id: 'top-right',
							x: right,
							y: top,
							prevX: prevRight,
							prevY: prevTop,
						},
						{
							// id: 'bottom-left',
							x: left,
							y: bottom,
							prevX: prevLeft,
							prevY: prevBottom,
						},
						{
							// id: 'bottom-right',
							x: right,
							y: bottom,
							prevX: prevRight,
							prevY: prevBottom,
						},
					];
					for (const wall of state.room.walls || []) {
						let isXCollision, isYCollision;
						for (const corner of characterCorners) {
							if (
								corner.x > wall.location.x &&
								corner.x < wall.location.x + wall.width &&
								corner.y > wall.location.y &&
								corner.y < wall.location.y + wall.height
							) {
								if (
									corner.prevX > wall.location.x &&
									corner.prevX < wall.location.x + wall.width
								) {
									isYCollision = true;
									// console.log(state.t, 'y intersect');
								} else if (
									corner.prevY > wall.location.y &&
									corner.prevY < wall.location.y + wall.height
								) {
									isXCollision = true;
									// console.log(state.t, 'x intersect');
									// } else if (!isXCollision && !isYCollision) {
									// 	console.log(state.t, 'intersecting... but prev point is outside both X & Y wall range');
									// 	if (Math.abs(corner.prevX - wall.location.x) > Math.abs(corner.prevY - wall.location.y)) {
									// 		isXCollision = true;
									// 	} else {
									// 		isYCollision = true;
									// 	}
								}
							}
						}

						// now check for corners on opposite sides of the wall!
						if (
							left < wall.location.x &&
							right > wall.location.x + wall.width &&
							((top < wall.location.y + wall.height && top > wall.location.y) ||
								(bottom < wall.location.y + wall.height &&
									bottom > wall.location.y))
						) {
							// console.log(state.t, 'y intersect: opposite sides ');
							isYCollision = true;
						} else if (
							top < wall.location.y &&
							bottom > wall.location.y + wall.height &&
							((left < wall.location.x + wall.width &&
								left > wall.location.x) ||
								(right < wall.location.x + wall.width &&
									right > wall.location.x))
						) {
							// console.log(state.t, 'x intersect: opposite sides ');
							isXCollision = true;
						}

						// // just stick to the wall.  not so good.
						// if (isYCollision || isXCollision) {
						// 	roomCharacter.location.x = prevCharacterLoc.x;
						// 	roomCharacter.location.y = prevCharacterLoc.y;
						// }

						if (isYCollision) {
							// console.log('isYCollision');
							roomCharacter.location.y =
								wall.location.y - character.height / roomHeight / 2;
							if (prevCharacterLoc.y > wall.location.y + wall.height) {
								// console.log('prevCharacterLoc.y > wall.location.y + wall.height', prevCharacterLoc.y, wall.location.y, wall.height);
								roomCharacter.location.y +=
									wall.height + character.height / roomHeight;
							}
						}
						if (isXCollision) {
							// console.log('isXCollision');
							roomCharacter.location.x =
								wall.location.x - character.width / roomWidth / 2;
							if (prevCharacterLoc.x > wall.location.x + wall.width) {
								// console.log('prevCharacterLoc.x > wall.location.x + wall.width', prevCharacterLoc.x, wall.location.x, wall.width);
								roomCharacter.location.x +=
									wall.width + character.width / roomWidth;
							}
						}
					}

					// double check
					{
						const left =
							roomCharacter.location.x - character.width / roomWidth / 2;
						const right =
							roomCharacter.location.x + character.width / roomWidth / 2;
						const top =
							roomCharacter.location.y - character.height / roomHeight / 2;
						const bottom =
							roomCharacter.location.y + character.height / roomHeight / 2;
						const characterCorners = [
							{
								id: 'top-left',
								x: left,
								y: top,
							},
							{
								id: 'top-right',
								x: right,
								y: top,
							},
							{
								id: 'bottom-left',
								x: left,
								y: bottom,
							},
							{
								id: 'bottom-right',
								x: right,
								y: bottom,
							},
						];

						outer: for (const wall of state.room.walls || []) {
							for (const corner of characterCorners) {
								const isXCollision =
									corner.x > wall.location.x &&
									corner.x < wall.location.x + wall.width;
								const isYCollision =
									corner.y > wall.location.y &&
									corner.y < wall.location.y + wall.height;
								if (isXCollision && isYCollision) {
									// console.error(state.t, 'still intersecting!', corner);
									if (
										Math.abs(corner.prevX - wall.location.x) >
										Math.abs(corner.prevY - wall.location.y)
									) {
										roomCharacter.location.x = prevCharacterLoc.x;
									} else {
										roomCharacter.location.y = prevCharacterLoc.y;
									}

									break outer;
								}
							}
						}
					}
				}
			}

			let size = 1;
			if (roomCharacter.animStep) {
				if (!roomCharacter.baseLoc) {
					roomCharacter.baseLoc = {
						x: roomCharacter.location.x,
						y: roomCharacter.location.y,
					};
				}
				// console.log('roomCharacter.baseLoc', roomCharacter.baseLoc);
				roomCharacter.location.x =
					roomCharacter.baseLoc.x +
					(character.width * roomCharacter.animStep) /
						(2 * numCharacterDieAnimSteps * roomWidth);
				roomCharacter.location.y =
					roomCharacter.baseLoc.y +
					(character.height * roomCharacter.animStep) /
						(2 * numCharacterDieAnimSteps * roomHeight);
				ctx.globalAlpha =
					(numCharacterDieAnimSteps - roomCharacter.animStep) /
					numCharacterDieAnimSteps;
				size = 1 - roomCharacter.animStep / numCharacterDieAnimSteps;
				// console.log('size ', size);
			}

			let imageLoc;
			// console.log(characterImages[roomCharacter.id]);
			const imageId = makeImageId(roomCharacter);
			if (roomCharacter.rotation) {
				// debug(roomCharacter.rotation);
				imageLoc = toScreen(
					{
						x: roomCharacter.location.x + character.width / 2,
						y: roomCharacter.location.y + character.height / 2,
					},
					character
				);
				ctx.save();
				ctx.translate(imageLoc.x, imageLoc.y);
				ctx.rotate(roomCharacter.rotation);
				ctx.drawImage(
					characterImages[imageId],
					(-character.width * canvas.width) / 2,
					(-character.height * canvas.height) / 2,
					size * character.width * canvas.width,
					size * character.height * canvas.height
				);
				ctx.restore();
			} else {
				// console.log('roomCharacter.location', roomCharacter.location);
				// console.log(`drawing characterImages[${imageId}]`, characterImages[imageId]);
				imageLoc = toScreen(roomCharacter.location, character);
				ctx.drawImage(
					characterImages[imageId],
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
					ctx.moveTo(
						imageLoc.x + (character.width * canvas.width) / 2,
						imageLoc.y - canvas.width * r
					);
					ctx.arc(
						imageLoc.x + (character.width * canvas.width) / 2,
						imageLoc.y - canvas.width * healthIndicatorRadius,
						canvas.width * r,
						0,
						2 * Math.PI,
						false
					);
					ctx.fill();
				}

				// health circle
				ctx.fillStyle = '#444';
				ctx.beginPath();
				ctx.arc(
					imageLoc.x + (character.width * canvas.width) / 2,
					imageLoc.y - canvas.width * healthIndicatorRadius,
					canvas.width * healthIndicatorRadius,
					0,
					2 * Math.PI
				);
				ctx.fill();

				ctx.fillStyle = '#f00';
				ctx.beginPath();
				ctx.moveTo(
					imageLoc.x + (character.width * canvas.width) / 2,
					imageLoc.y - canvas.width * healthIndicatorRadius
				);
				ctx.arc(
					imageLoc.x + (character.width * canvas.width) / 2,
					imageLoc.y - canvas.width * healthIndicatorRadius,
					0.8 * canvas.width * healthIndicatorRadius,
					0,
					roomCharacter.health * Math.PI * 2,
					false
				);
				ctx.lineTo(
					imageLoc.x + (character.width * canvas.width) / 2,
					imageLoc.y - canvas.width * healthIndicatorRadius
				);
				ctx.fill();
			}

			// ctx.fillStyle = '#f00';
			// ctx.fillRect(imageLoc.x, imageLoc.y, 4, 4);
		}
	}
	{
		// doors
		for (const door of state.room.doors || []) {
			ctx.fillStyle = (door.key && items[door.key].color) || '#ccc';
			// ctx.fillStyle = backgroundColor;
			let x, y, width, height;
			if (door.wall == 'w') {
				x = ((1 - roomWidth - wallWidth) / 2) * canvas.width - 1;
				y = ((1 - roomHeight) / 2 + door.location * roomHeight) * canvas.height;
				width = wallWidth * canvas.width + 1;
				height = doorSize * canvas.height;
			} else if (door.wall == 'e') {
				x = ((1 + roomWidth - wallWidth) / 2) * canvas.width;
				y = ((1 - roomHeight) / 2 + door.location * roomHeight) * canvas.height;
				width = wallWidth * canvas.width + 1;
				height = doorSize * canvas.height;
			} else if (door.wall == 'n') {
				// console.log('ctx.fillStyle ', ctx.fillStyle);
				x = ((1 - roomWidth) / 2 + door.location * roomWidth) * canvas.width;
				y = ((1 - roomHeight - wallWidth) * canvas.height) / 2 - 1;
				height = wallWidth * canvas.height + 1;
				width = doorSize * canvas.width;
			} else if (door.wall == 's') {
				x = ((1 - roomWidth) / 2 + door.location * roomWidth) * canvas.width;
				y = ((1 + roomHeight - wallWidth) / 2) * canvas.height;
				height = wallWidth * canvas.height;
				width = doorSize * canvas.width;
			}
			ctx.fillRect(x, y, width, height);

			let doorImage;
			if (['n', 's'].includes(door.wall)) {
				doorImage = doorImages.horizontal;
			} else {
				doorImage = doorImages.vertical;
			}
			ctx.drawImage(doorImage, x, y, width, height);

			ctx.fillStyle = state.room.wallColor || wallColor;
			if (['e', 'w'].includes(door.wall)) {
				x += (door.wall == 'w' ? 1 : -1) * wallWidth * canvas.width;
				ctx.fillRect(
					x,
					y - doorwaySize.width * canvas.height,
					doorwaySize.height * canvas.width,
					doorwaySize.width * canvas.width
				);
				ctx.fillRect(
					x,
					y + doorSize * canvas.height,
					doorwaySize.height * canvas.width,
					doorwaySize.width * canvas.width
				);
			} else {
				y += (door.wall == 'n' ? 1 : -1) * wallWidth * canvas.height;
				ctx.fillRect(
					x - doorwaySize.width * canvas.width,
					y,
					doorwaySize.width * canvas.width,
					doorwaySize.height * canvas.width
				);
				ctx.fillRect(
					x + doorSize * canvas.width,
					y,
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
			const duration = state.t - state.player.invisibilityStart;
			if (duration > items.invisibilityPotion.duration) {
				state.player.isInvisible = false;
			} else if (duration >= 0.88 * items.invisibilityPotion.duration) {
				ctx.globalAlpha =
					0.45 +
					0.25 *
						Math.sin((duration - 0.8 * items.invisibilityPotion.duration) / 8);
			} else {
				ctx.globalAlpha = 0.5;
			}
		}
		ctx.drawImage(
			characterImages.player,
			loc.x,
			loc.y,
			characters.player.width * canvas.width,
			characters.player.height * canvas.height
		);
		ctx.globalAlpha = 1;

		// ctx.fillStyle = '#f00';
		// ctx.fillRect(loc.x, loc.y, 4, 4);
	}

	if (
		keysDown.A &&
		state.player.wielding &&
		items[state.player.wielding].projectile &&
		state.player.motion == 'idleFrames'
	) {
		// !(keysDown.ArrowDown || keysDown.ArrowUp || keysDown.ArrowLeft || keysDown.ArrowRight)
		aim();
	}

	if (state.isGameOver) {
		const text = 'GAME OVER';
		const lineHeight = Math.floor(0.16 * canvas.height);
		ctx.font = `${lineHeight + 4}px ${fontFamily}`;
		ctx.fillStyle = '#444';
		{
			const x = (canvas.width - ctx.measureText(text).width) / 2;
			ctx.fillText(text, x, 0.4 * canvas.height + 2);
		}

		ctx.font = `${lineHeight}px ${fontFamily}`;
		ctx.fillStyle = '#f00';
		{
			const x = (canvas.width - ctx.measureText(text).width) / 2;
			ctx.fillText(text, x, 0.4 * canvas.height);
		}

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

	if (
		keysDown.ArrowLeft ||
		keysDown.ArrowRight ||
		keysDown.ArrowUp ||
		keysDown.ArrowDown
	) {
		if (isAiming) {
			const direction = keysDown.ArrowLeft || keysDown.ArrowDown ? -1 : 1;
			state.aimAngle += (direction * Math.PI) / 32;
		} else {
			if (keysDown.P) {
				for (const wall of state.room.walls || []) {
					if (wall.isMovable) {
						const margin = 0.06;
						const top = state.player.y - characters.player.height / 2;
						const bottom = state.player.y + characters.player.height / 2;
						const left = state.player.x - characters.player.width / 2;
						const right = state.player.x + characters.player.width / 2;
						// console.log('(state.player.y + characters.player.height / 2)', (state.player.y + characters.player.height / 2));
						// console.log('wall.location.y', wall.location.y);
						// console.log('keysDown.ArrowUp', keysDown.ArrowUp);
						// console.log(wall.location.y < (state.player.y + characters.player.height / 2) + margin);
						// console.log((state.player.y + characters.player.height / 2) + margin);
						// console.log(wall.location.y);
						// console.log(wall.location.y > (state.player.y + characters.player.height / 2) - margin);
						// console.log(left > wall.location.x && left < wall.location.x + wall.width);
						// console.log(right > wall.location.x && right < wall.location.x + wall.width);
						let testLoc = {
							x: wall.location.x,
							y: wall.location.y,
						};
						let isMove;
						if (
							keysDown.ArrowLeft &&
							wall.location.x <
								state.player.x + characters.player.width / 2 + margin &&
							wall.location.x >
								state.player.x + characters.player.width / 2 - margin &&
							((top > wall.location.y && top < wall.location.y + wall.height) ||
								(bottom > wall.location.y &&
									bottom < wall.location.y + wall.height))
						) {
							// console.log('pull left');
							isMove = true;
							testLoc.x -= moveIncrement / roomWidth;
							testLoc.x = Math.max(characters.player.width + margin, testLoc.x);
						} else if (
							keysDown.ArrowRight &&
							wall.location.x + wall.width <
								state.player.x - characters.player.width / 2 + margin &&
							wall.location.x + wall.width >
								state.player.x - characters.player.width / 2 - margin &&
							((top > wall.location.y && top < wall.location.y + wall.height) ||
								(bottom > wall.location.y &&
									bottom < wall.location.y + wall.height))
						) {
							// console.log('pull right');
							isMove = true;
							testLoc.x += moveIncrement / roomWidth;
							testLoc.x = Math.min(
								1 - characters.player.width - margin - wall.width,
								testLoc.x
							);
						} else if (
							keysDown.ArrowUp &&
							wall.location.y <
								state.player.y + characters.player.height / 2 + margin &&
							wall.location.y >
								state.player.y + characters.player.height / 2 - margin &&
							((left > wall.location.x &&
								left < wall.location.x + wall.width) ||
								(right > wall.location.x &&
									right < wall.location.x + wall.width))
						) {
							// console.log('pull up');
							isMove = true;
							testLoc.y -= moveIncrement / roomHeight;
							testLoc.y = Math.max(
								characters.player.height + margin,
								testLoc.y
							);
						} else if (
							keysDown.ArrowDown &&
							wall.location.y + wall.height <
								state.player.y - characters.player.height / 2 + margin &&
							wall.location.y + wall.height >
								state.player.y - characters.player.height / 2 - margin &&
							((left > wall.location.x &&
								left < wall.location.x + wall.width) ||
								(right > wall.location.x &&
									right < wall.location.x + wall.width))
						) {
							// console.log('pull down');
							isMove = true;
							testLoc.y += moveIncrement / roomHeight;
							testLoc.y = Math.min(
								1 - characters.player.height - margin - wall.height,
								testLoc.y
							);
						}
						// console.log('isMove', isMove);
						if (isMove && testBounds(wall, testLoc, wall.width, wall.height)) {
							// console.log('wall.location', wall.location);
							// console.log('testLoc', testLoc);
							wall.location = testLoc;
							play(rockScrapeSound);
						}
					}
				}
			}

			if (keysDown.ArrowLeft) {
				const edge = characters.player.width / (2 * roomWidth);
				state.player.x -= inc / roomWidth;
				if (state.player.x <= edge) {
					const playerPos =
						state.player.y - characters.player.height / (2 * roomHeight);
					for (const door of (state.room.doors || []).filter(
						(d) => d.wall == 'w'
					)) {
						const y1 = door.location;
						const y2 =
							door.location +
							(doorSize - characters.player.height) / roomHeight;
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
				state.player.x += inc / roomWidth;
				const playerEdge =
					state.player.x * roomWidth -
					characters.player.width / 2 +
					(1 - roomWidth) / 2 +
					characters.player.width;
				const edge = (1 + roomWidth) / 2;
				if (playerEdge >= edge) {
					const playerPos =
						state.player.y - characters.player.height / (2 * roomHeight);
					for (const door of (state.room.doors || []).filter(
						(d) => d.wall == 'e'
					)) {
						const y1 = door.location;
						const y2 =
							door.location +
							(doorSize - characters.player.height) / roomHeight;
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
				const edge = characters.player.height / (2 * roomHeight);
				state.player.y -= inc / roomHeight;
				if (state.player.y <= edge) {
					const playerPos =
						state.player.x - characters.player.width / (2 * roomWidth);
					for (const door of (state.room.doors || []).filter(
						(d) => d.wall == 'n'
					)) {
						const x1 = door.location;
						const x2 =
							door.location +
							(doorSize - 0.8 * characters.player.width) / roomWidth;
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
				state.player.y += inc / roomHeight;
				const playerEdge =
					state.player.y * roomHeight -
					characters.player.height / 2 +
					(1 - roomHeight) / 2 +
					characters.player.height;
				const edge = (1 + roomHeight) / 2;
				if (playerEdge >= edge) {
					const playerPos =
						state.player.x - characters.player.width / (2 * roomWidth);
					for (const door of (state.room.doors || []).filter(
						(d) => d.wall == 's'
					)) {
						const x1 = door.location;
						const x2 =
							door.location +
							(doorSize - 0.8 * characters.player.width) / roomWidth;
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
		}
	}

	if (throughDoor && throughDoor.key && !state.inventory[throughDoor.key]) {
		throughDoor = null;
		state.player.x = prevPlayerLoc.x;
		state.player.y = prevPlayerLoc.y;
		toast('Ye must be the holder of the key, lest the other side ye see!');
		play(lockedDoorSound);
	}

	// check for intersection with other character
	{
		const playerWidth =
			(characterIntersectionLeeway * (characters.player.width / roomWidth)) / 2;
		const playerHeight =
			(characterIntersectionLeeway * (characters.player.height / roomHeight)) /
			2;
		for (const roomCharacter of state.room.characters || []) {
			const character = characters[roomCharacter.id];
			const characterWidth =
				(characterIntersectionLeeway * (character.width / roomWidth)) / 2;
			const characterHeight =
				(characterIntersectionLeeway * (character.height / roomHeight)) / 2;
			if (
				state.player.x + playerWidth >
					roomCharacter.location.x - characterWidth &&
				state.player.x - playerWidth <
					roomCharacter.location.x + characterWidth &&
				state.player.y + playerHeight >
					roomCharacter.location.y - characterHeight &&
				state.player.y - playerHeight <
					roomCharacter.location.y + characterHeight
			) {
				state.player.x = prevPlayerLoc.x;
				state.player.y = prevPlayerLoc.y;
				// console.log(roomCharacter.location);
				// console.log(character.width);
				if (character.type == 'merchant') {
					setPaused(true);
					drawMerchantInteraction();
				}
			}
		}
	}

	// check for intersection with room walls
	{
		const left = state.player.x - characters.player.width / roomWidth / 2;
		const right = state.player.x + characters.player.width / roomWidth / 2;
		const top = state.player.y - characters.player.height / roomHeight / 2;
		const bottom = state.player.y + characters.player.height / roomHeight / 2;
		const prevLeft = prevPlayerLoc.x - characters.player.width / roomWidth / 2;
		const prevRight = prevPlayerLoc.x + characters.player.width / roomWidth / 2;
		const prevTop = prevPlayerLoc.y - characters.player.height / roomHeight / 2;
		const prevBottom =
			prevPlayerLoc.y + characters.player.height / roomHeight / 2;
		const playerCorners = [
			{
				id: 'top-left',
				x: left,
				y: top,
				prevX: prevLeft,
				prevY: prevTop,
			},
			{
				id: 'top-right',
				x: right,
				y: top,
				prevX: prevRight,
				prevY: prevTop,
			},
			{
				id: 'bottom-left',
				x: left,
				y: bottom,
				prevX: prevLeft,
				prevY: prevBottom,
			},
			{
				id: 'bottom-right',
				x: right,
				y: bottom,
				prevX: prevRight,
				prevY: prevBottom,
			},
		];
		{
			let isYCollision, isXCollision, wall;
			outer: for (wall of state.room.walls || []) {
				for (const corner of playerCorners) {
					if (
						corner.x > wall.location.x &&
						corner.x < wall.location.x + wall.width &&
						corner.y > wall.location.y &&
						corner.y < wall.location.y + wall.height
					) {
						if (
							corner.prevX > wall.location.x &&
							corner.prevX < wall.location.x + wall.width
						) {
							isYCollision = true;
							break outer;
						} else if (
							corner.prevY > wall.location.y &&
							corner.prevY < wall.location.y + wall.height
						) {
							isXCollision = true;
							break outer;
						}
					}
				}

				// now check for corners on opposite sides of the wall!
				if (
					playerCorners[0].x < wall.location.x &&
					playerCorners[1].x > wall.location.x + wall.width &&
					((playerCorners[0].y < wall.location.y + wall.height &&
						playerCorners[0].y > wall.location.y) ||
						(playerCorners[2].y < wall.location.y + wall.height &&
							playerCorners[2].y > wall.location.y))
				) {
					// console.log(state.t, 'player y intersect: opposite sides ');
					isYCollision = true;
					break outer;
				} else if (
					playerCorners[0].y < wall.location.y &&
					playerCorners[2].y > wall.location.y + wall.height &&
					((playerCorners[0].x < wall.location.x + wall.width &&
						playerCorners[0].x > wall.location.x) ||
						(playerCorners[1].x < wall.location.x + wall.width &&
							playerCorners[1].x > wall.location.x))
				) {
					// console.log(state.t, 'player x intersect: opposite sides');
					isXCollision = true;
					break outer;
				}
			}

			if (wall && wall.isMovable) {
				let isMove, isBlocked;
				const prevWallLocation = {
					x: wall.location.x,
					y: wall.location.y,
				};

				if (isYCollision && state.player.y != prevPlayerLoc.y) {
					// console.log('state.player.y ', state.player.y);
					// console.log('prevPlayerLoc.y', prevPlayerLoc.y);
					// console.log('state.player.y < prevPlayerLoc.y', state.player.y < prevPlayerLoc.y);
					wall.location.y +=
						((state.player.y < prevPlayerLoc.y ? -1 : 1) * moveIncrement) /
						roomHeight;
					if (
						wall.location.y < wallWidth / 2 ||
						wall.location.y + wall.height > 1 - wallWidth / 2
					) {
						isBlocked = true;
						wall.location.y = prevWallLocation.y;
					} else {
						isMove = true;
					}
				}
				if (isXCollision && state.player.x != prevPlayerLoc.x) {
					wall.location.x +=
						((state.player.x < prevPlayerLoc.x ? -1 : 1) * moveIncrement) /
						roomWidth;
					if (
						wall.location.x < wallWidth / 2 ||
						wall.location.x + wall.width > 1 - wallWidth / 2
					) {
						isBlocked = true;
						wall.location.x = prevWallLocation.x;
					} else {
						isMove = true;
					}
				}

				const left = wall.location.x;
				const right = wall.location.x + wall.width;
				const top = wall.location.y;
				const bottom = wall.location.y + wall.height;
				const wallCorners = [
					{
						// id: 'top-left',
						x: left,
						y: top,
					},
					{
						// id: 'top-right',
						x: right,
						y: top,
					},
					{
						// id: 'bottom-left',
						x: left,
						y: bottom,
					},
					{
						// id: 'bottom-right',
						x: right,
						y: bottom,
					},
				];
				outer: for (const _wall of state.room.walls || []) {
					if (_wall != wall) {
						for (const corner of wallCorners) {
							// console.log('corner', corner);
							if (
								corner.x >= _wall.location.x &&
								corner.x <= _wall.location.x + _wall.width &&
								corner.y >= _wall.location.y &&
								corner.y <= _wall.location.y + _wall.height
							) {
								isMove = false;
								isBlocked = true;
								wall.location.x = prevWallLocation.x;
								wall.location.y = prevWallLocation.y;
								break outer;
							}
						}

						// now check for corners on opposite sides of the wall!
						if (
							(wallCorners[0].x <= _wall.location.x &&
								wallCorners[1].x >= _wall.location.x + _wall.width &&
								((wallCorners[0].y <= _wall.location.y + _wall.height &&
									wallCorners[0].y >= _wall.location.y) ||
									(wallCorners[2].y <= _wall.location.y + _wall.height &&
										wallCorners[2].y >= _wall.location.y))) ||
							(wallCorners[0].y <= _wall.location.y &&
								wallCorners[2].y >= _wall.location.y + _wall.height &&
								((wallCorners[0].x <= _wall.location.x + _wall.width &&
									wallCorners[0].x >= _wall.location.x) ||
									(wallCorners[1].x <= _wall.location.x + _wall.width &&
										wallCorners[1].x >= _wall.location.x)))
						) {
							// console.log(state.t, 'player y intersect: opposite sides ');
							isMove = false;
							isBlocked = true;
							wall.location.x = prevWallLocation.x;
							wall.location.y = prevWallLocation.y;
							break outer;
						}
					}
				}

				if (isMove) {
					play(rockScrapeSound);
				} else if (isBlocked) {
					state.player.x = prevPlayerLoc.x;
					state.player.y = prevPlayerLoc.y;
				}
			} else {
				if (isYCollision) {
					state.player.y = prevPlayerLoc.y;
				}
				if (isXCollision) {
					state.player.x = prevPlayerLoc.x;
				}
			}
		}
	}

	// go through portal
	for (const portal of state.room.portals || []) {
		// const x = (1 - roomWidth) / 2 + (portal.location.x * roomWidth) + (portalSize * 0.1);
		// const y = (1 - roomHeight) / 2 + (portal.location.y * roomHeight) + (portalSize * 0.1);
		// ctx.strokeStyle = '#000';
		// ctx.lineWidth = 2;
		// ctx.beginPath();
		// ctx.rect(x * canvas.width, y * canvas.height, portalSize * 0.8 * canvas.width, portalSize * 0.8 * canvas.height);
		// ctx.stroke();

		// ctx.fillStyle = '#f00';
		// ctx.fillRect(state.player.x * canvas.width, state.player.y * canvas.height, 2, 2);
		if (
			state.player.x > portal.location.x - portalSize / 2 &&
			state.player.x < portal.location.x + portalSize / 2 &&
			state.player.y > portal.location.y - portalSize / 2 &&
			state.player.y < portal.location.y + portalSize / 2
		) {
			setRoom(rooms.find((r) => r.id == portal.destination.roomId));
			state.player.x = portal.destination.x || 0.5;
			state.player.y = portal.destination.y || 0.5;
			play(portalSound);
		}
	}

	// pick up an item
	let i = 0;
	for (const roomItem of state.room.items || []) {
		const item = items[roomItem.id];
		// console.log('item', item);
		// console.log('state.inventory[item.id]', state.inventory[roomItem.id]);
		if (
			item.image.height > 0 &&
			(item.type != 'weapon' || !state.inventory[roomItem.id])
		) {
			const dist = distance(roomItem);
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
				const itemId = item.type == 'treasure' ? item.type : roomItem.id;
				state.inventory[itemId] =
					(state.inventory[itemId] || 0) + (roomItem.value || item.value || 1);
				play(item.sounds.pickup);
				// console.log('rooms[0].items.length', rooms[0].items.length);
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
			w: 'e',
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
				state.player.y = 1 - characters.player.height / (2 * roomHeight);
			} else if (oppositeWall == 'n') {
				state.player.y = characters.player.height / (2 * roomHeight);
			} else if (oppositeWall == 'e') {
				state.player.x = 1 - characters.player.width / (2 * roomWidth);
			} else {
				state.player.x = characters.player.width / (2 * roomHeight);
			}

			const door = (state.room.doors || []).find(
				(d) => d.wall == oppositeWall && d.room.id == prevRoom.id
			);
			if (['n', 's'].includes(oppositeWall)) {
				if (door) {
					state.player.x =
						door.location + characters.player.width / roomWidth / 2;
				} else {
					state.player.x = (1 - roomWidth * characters.player.width) / 2;
				}
			} else {
				// console.log('state.room.doors ', state.room.doors);
				// console.log('door', door);
				// console.log('oppositeWall ', oppositeWall);
				// console.log('prevRoom', prevRoom);
				if (door) {
					state.player.y =
						door.location + characters.player.height / roomHeight / 2;
				} else {
					state.player.y = (1 - roomHeight * characters.player.height) / 2;
				}
			}
		}
		// console.log('oppositeWall', oppositeWall);
		// console.log('x', state.player.x);
		// console.log('y', state.player.y);
	}

	// projectiles
	for (const projectile of state.projectiles || []) {
		// console.log('projectile', items[projectile.id]);
		const item = items[projectile.id];
		const size = item.size;
		const imageLoc = toScreen({
			x: projectile.loc.x,
			y: projectile.loc.y,
			// }, {
			// 	width: size * item.image.width / item.image.height,
			// 	height: size * canvas.height
		});
		ctx.save();
		ctx.translate(imageLoc.x, imageLoc.y);
		ctx.rotate(projectile.angle);
		const width =
			(((size * item.image.width) / item.image.height) * canvas.width) /
			projectileSizeFactor;
		const height = (size * canvas.height) / projectileSizeFactor;
		ctx.drawImage(
			item.image,
			projectile.loc.x,
			projectile.loc.y,
			width,
			height
		);
		ctx.restore();
		projectile.loc.x += Math.cos(projectile.angle) * item.speed;
		projectile.loc.y += Math.sin(projectile.angle) * item.speed;

		const tip = {
			x:
				imageLoc.x +
				Math.cos(projectile.angle) * width +
				(Math.cos(projectile.angle + Math.PI / 2) * height) / 2,
			y:
				imageLoc.y +
				Math.sin(projectile.angle) * width +
				(Math.sin(projectile.angle + Math.PI / 2) * height) / 2,
		};
		// const end = {
		// 	x: imageLoc.x + Math.cos(projectile.angle + Math.PI / 2) * height / 2,
		// 	y: imageLoc.y + Math.sin(projectile.angle + Math.PI / 2) * height / 2,
		// };

		let isWallHit;
		if (
			tip.x > canvas.width * (1 - (1 - roomWidth) / 2) ||
			tip.x < (canvas.width * (1 - roomWidth)) / 2 ||
			tip.y > canvas.height * (1 - (1 - roomHeight) / 2) ||
			tip.y < (canvas.height * (1 - roomHeight)) / 2
		) {
			isWallHit = true;
		}
		if (!isWallHit) {
			for (const wall of state.room.walls || []) {
				const x =
					((1 - roomWidth) / 2 + wall.location.x * roomWidth) * canvas.width;
				const y =
					((1 - roomHeight) / 2 + wall.location.y * roomHeight) * canvas.height;
				const width = roomWidth * wall.width * canvas.width;
				const height = roomHeight * wall.height * canvas.height;

				if (tip.x > x && tip.x < x + width && tip.y > y && tip.y < y + height) {
					isWallHit = true;
					break;
				}
			}
		}

		if (isWallHit) {
			play(item.sounds.hitWall);
			state.projectiles.splice(state.projectiles.indexOf(projectile), 1);
		}

		for (const roomCharacter of state.room.characters || []) {
			const character = characters[roomCharacter.id];
			if (character.type == 'enemy') {
				const left = roomCharacter.location.x - character.width / roomWidth / 2;
				const top =
					roomCharacter.location.y - character.height / roomHeight / 2;
				const right =
					roomCharacter.location.x + character.width / roomWidth / 2;
				const bottom =
					roomCharacter.location.y + character.height / roomHeight / 2;
				const upperLeft = toScreen({
					x: left,
					y: top,
				});
				const lowerRight = toScreen({
					x: right,
					y: bottom,
				});
				if (
					tip.x > upperLeft.x &&
					tip.x < lowerRight.x &&
					tip.y > upperLeft.y &&
					tip.y < lowerRight.y
				) {
					injur(roomCharacter, item.damage / character.resilience);
					state.projectiles.splice(state.projectiles.indexOf(projectile), 1);
					play(character.sounds.injured);
				}

				// ctx.fillStyle = '#f00';
				// ctx.beginPath();
				// ctx.arc(upperLeft.x, upperLeft.y, 4, 0, Math.PI * 2);
				// ctx.fill();
				// ctx.fillStyle = '#f00';
				// ctx.beginPath();
				// ctx.arc(lowerRight.x, lowerRight.y, 4, 0, Math.PI * 2);
				// ctx.fill();
			}
		}
		// ctx.fillStyle = '#f00';
		// ctx.beginPath();
		// ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
		// ctx.fill();

		// ctx.beginPath();
		// ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
		// ctx.fill();
	}
}

function drawMap() {
	{
		// map background
		ctx.fillStyle = mapBackgroundColor;
		ctx.fillRect(
			canvas.width * mapMargin,
			canvas.height * mapMargin,
			canvas.width * (1 - 2 * mapMargin),
			canvas.height * (1 - 2 * mapMargin)
		);
	}
	const mapped = [];

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
			const x = -width / 2;
			const y = -height / 2;
			ctx.beginPath();
			ctx.rect(x + offset.x, y + offset.y, width, height);
			ctx.stroke();
			// ctx.fillStyle = mapRoomColor;
			// ctx.fillRect(x + offset.x, y + offset.y, width, height);
			const roomBackground = new Image();
			roomBackground.src = `img/rooms/${
				room.backgroundImage || defaultRoomBackground
			}`;
			ctx.drawImage(roomBackground, x + offset.x, y + offset.y, width, height);
		}

		for (const door of room.doors || []) {
			door.p1 = {};
			door.p2 = {};
			if (['e', 'w'].includes(door.wall)) {
				door.p1.y =
					(((door.location - 1) * getValue(room, 'height')) / 2) *
					mapScale *
					canvas.height;
				door.p2.y = door.p1.y + doorSize * mapScale * canvas.height;
				door.p1.x = door.p2.x =
					(getValue(room, 'width') * mapScale * canvas.width) / 2;
				if (door.wall == 'w') {
					door.p1.x *= -1;
					door.p2.x *= -1;
				}
			} else {
				door.p1.x =
					(((door.location - 1) * getValue(room, 'width')) / 2) *
					mapScale *
					canvas.width;
				door.p2.x = door.p1.x + doorSize * mapScale * canvas.width;
				door.p1.y = door.p2.y =
					(getValue(room, 'height') * mapScale * canvas.height) / 2;
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
				let x = offset.x,
					y = offset.y;
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
					x,
					y,
				});
			}
		}
	}

	drawRoom(state.room, {
		x: canvas.width / 2,
		y: canvas.height / 2,
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
	document
		.getElementById('merchant-modal-init-content')
		.classList.remove('hidden');
	document.getElementById('merchant-modal-content').classList.add('hidden');
	document.getElementById('merchant-modal').classList.remove('hidden');
}

function drawInventory() {
	document.getElementById('inventory-modal').classList.remove('hidden');
	let html = '';
	let numLines = 0;
	const itemIds = Object.keys(state.inventory);
	const itemOrder = ['treasure', 'weapon', 'projectile', 'key', 'potion'];
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
	const spacerHeight = 280 - numLines * 40;
	html += `<tr id="inventory-spacer" style="height: ${spacerHeight}px;"></tr>`;
	document.getElementById('inventory-table').innerHTML = html;
}

function aim() {
	const weapon = items[state.player.wielding];
	const projectile = items[weapon.projectile];
	if (state.inventory[weapon.projectile]) {
		isAiming = true;
		state.aimAngle = state.aimAngle || 0;

		// aim circle
		const loc = toScreen(state.player);
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.arc(
			loc.x,
			loc.y,
			8 + (canvas.height * characters.player.height) / 2,
			0,
			2 * Math.PI
		);
		ctx.stroke();

		ctx.strokeStyle = '#444';
		ctx.lineWidth = 16;
		ctx.beginPath();
		ctx.arc(
			loc.x,
			loc.y,
			2 + (canvas.height * characters.player.height) / 2,
			state.aimAngle - Math.PI / 24,
			state.aimAngle + Math.PI / 24
		);
		ctx.stroke();
	} else {
		toast(
			`You\'re all out of ${projectile.label}!<br/> Try a different weapon.`
		);
	}
}

function attack() {
	const weapon = items[state.player.wielding];
	if (!state.isPaused && weapon) {
		const projectile = weapon.projectile;
		if (projectile) {
			if (state.inventory[projectile] > 0) {
				state.inventory[projectile]--;
				state.projectiles = state.projectiles || [];
				let angle;
				if (isAiming) {
					angle = state.aimAngle;
				} else {
					// set angle = direction of player motion
					const motionKeys = Object.keys(keysDown)
						.filter((k) => k.startsWith('Arrow'))
						.sort()
						.join();
					angle = {
						ArrowRight: 0,
						'ArrowDown,ArrowRight': 0.25,
						ArrowDown: 0.5,
						'ArrowDown,ArrowLeft': 0.75,
						ArrowLeft: 1,
						'ArrowLeft,ArrowUp': 1.25,
						ArrowUp: 1.5,
						'ArrowRight,ArrowUp': 1.75,
					}[motionKeys];
					if (isNaN(angle)) {
						console.error('angle is NaN', motionKeys);
					} else {
						angle *= Math.PI;
					}
				}
				play(items[projectile].sounds.launch);
				// console.log('angle', angle);
				console.log('state.player', state.player);
				state.projectiles.push({
					id: projectile,
					loc: {
						x: state.player.x,
						y: state.player.y,
					},
					angle,
				});
			} else {
				toast(
					`You\'re all out of ${items[projectile].label}!<br/> Try a different weapon.`
				);
			}
		} else {
			const targetedCharacter = getTargetedCharacter();
			if (targetedCharacter) {
				attackMotion =
					targetedCharacter.location.x < state.player.x ? 'left' : 'right';
				animate(state.player);
				setTimeout(() => {
					attackMotion = null;
				}, weapon.resetTime);
				const character = characters[targetedCharacter.id];
				const weaponValue =
					state.inventory[state.player.wielding] / weapon.value;

				if (weapon.sounds.hit) {
					play(weapon.sounds.hit);
				}
				if (character.sounds.injured) {
					setTimeout(() => {
						play(character.sounds.injured);
					}, 200);
				}

				injur(
					targetedCharacter,
					(weaponValue * weapon.damage) / character.resilience
				);
				state.inventory[state.player.wielding]--;
				if (state.inventory[state.player.wielding] <= 0) {
					delete state.inventory[state.player.wielding];
					state.player.wielding = null;
					play(weapon.sounds.broken);
				}
			}
		}
	}
}

function injur(character, injuryValue) {
	character.health -= injuryValue;
	if (character.health <= 0) {
		// die
		character.motion = 'dieFrames';
		animate(character);
		play(characters[character.id].sounds.die);

		const interval = 24;
		character.animStep = 0;
		const room = state.room;
		character.deathAnimIntervalId = setInterval(() => {
			character.animStep++;
			if (character.animStep >= numCharacterDieAnimSteps) {
				clearInterval(character.deathAnimIntervalId);
				if (room.characters) {
					room.characters = room.characters.filter((c) => c != character);
				}
			}
		}, interval);
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
	if (state.didDie && !['Enter', 'Escape'].includes(e.code)) {
		return;
	}

	if (roomMusic && e.code != 'F5') {
		setTimeout(() => {
			// console.log(roomMusic);
			play(roomMusic);
			roomMusic.addEventListener('ended', function () {
				play(roomMusic);
			});
		}, 20);
	}

	let key = e.key;
	if (key.length == 1) {
		key = key.toUpperCase();
	}
	delete keysDown[key];
	if (Object.keys(keysDown).length == 0) {
		state.player.motion = 'idleFrames';
		animate(state.player);
	}

	if (key == 'M') {
		state.player.motion = 'idleFrames';
		animate(state.player);
		drawFunc = drawFunc == drawMap ? drawGame : drawMap;
		closeModals();
	} else if (key == 'H') {
		showModal('instructions-modal');
	} else if (key == 'I') {
		state.player.motion = 'idleFrames';
		animate(state.player);
		closeModals();
		if (!state.isPaused) {
			togglePause();
		}
		// drawFunc = drawFunc == drawInventory ? drawGame : drawInventory;
		drawInventory();
	} else if (key == 'P') {
		isPulling = false;
	} else if (['A', ' '].includes(key)) {
		attack();
		isAiming = false;
	} else if (key == 'C') {
		const weaponIds = Object.keys(state.inventory).filter(
			(id) => items[id].type == 'weapon'
		);
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
	} else if (['Enter', 'Escape'].includes(key)) {
		drawFunc = drawGame;
		closeModals();
	}
}

function onKeyDown(e) {
	// console.log('onKeyDown', e);
	if (state.didDie) {
		return;
	}

	let key = e.key;
	if (key.length == 1) {
		key = key.toUpperCase();
	}
	if (!keysDown[key]) {
		const motion = {
			ArrowLeft: 'left',
			ArrowRight: 'right',
			ArrowUp: 'up',
			ArrowDown: 'down',
		}[key];
		if (motion && !isAiming) {
			state.player.motion = motion;
			animate(state.player);
		}
	}

	if (
		[
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Escape',
			'Enter',
			'M',
			'I',
			'A',
			'C',
			'P',
		].includes(key)
	) {
		keysDown[key] = true;
	}
}

function makeImageId(character) {
	let imageId = character.id;
	if (character.id != 'player') {
		const id =
			character.imageId || state.room.characters.indexOf(character) + 1;
		imageId += `-${state.room.id}-${id}`;
		character.imageId = id;
	}
	return imageId;
}

function animate(character) {
	// if (character.id == 'player') {
	// 	console.log('character', character);
	// }

	const imageId = makeImageId(character);
	clearInterval(animIntervalIds[imageId]);

	animFrameNums[imageId] = 0;
	let motion = character.motion;
	// console.log('starting anim', motion);
	function f() {
		let frames;
		if (state.player.wielding && character.id == 'player' && !state.didDie) {
			if (attackMotion) {
				frames =
					characterFrames[character.id].attack[state.player.wielding][
						attackMotion
					];
			} else {
				if (
					!characterFrames[character.id].wielding[state.player.wielding][motion]
				) {
					// console.log(motion);
					motion = 'left';
				}
				frames =
					characterFrames[character.id].wielding[state.player.wielding][motion];
			}
		} else {
			frames = characterFrames[character.id][motion];
		}
		// if (character.id == 'player') {
		// 	console.log('frames', frames);
		// }
		characterImages[imageId] = frames[animFrameNums[imageId]];
		animFrameNums[imageId]++;
		animFrameNums[imageId] %= frames.length;
		// console.log('anim', motion);
		// if (character.id != 'player') {
		// 	console.log(`change frame: characterImages[${imageId}]`, characterImages[imageId]);
		// }
	}

	f();
	animIntervalIds[imageId] = setInterval(
		f,
		characters[character.id].animInterval
	);

	if (
		character.id == 'player' &&
		['left', 'right', 'up', 'down'].includes(motion)
	) {
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
		height: 0,
	};
	if (
		isNaN(loc.x) ||
		isNaN(loc.y) ||
		isNaN(character.width) ||
		isNaN(character.height)
	) {
		console.error('toScreen loc', loc);
		console.error('toScreen character', character);
		throw new Error('toScreen: NaN detected!');
	}
	const x =
		(loc.x * getValue(state.room, 'width') -
			character.width / 2 +
			(1 - getValue(state.room, 'width')) / 2) *
		canvas.width;
	const y =
		(loc.y * getValue(state.room, 'height') -
			character.height / 2 +
			(1 - getValue(state.room, 'height')) / 2) *
		canvas.height;
	return { x, y };
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
	closeModals();
	play(clickSound);
	const modal = document.getElementById(id);
	setPaused(true);
	modal.classList.remove('hidden');
}

function setPaused(isPaused) {
	const now = new Date().getTime();
	if (isPaused) {
		state.lastPausedTime = now;
		document.getElementById('toggle-pause').innerHTML = state.didDie
			? 'Play Again'
			: 'Resume';
	} else if (state.isPaused && state.lastPausedTime) {
		state.pausedTime += now - state.lastPausedTime;
	}
	state.isPaused = isPaused;
}

function togglePause() {
	// console.log('togglePause', state.isPaused);
	play(clickSound);
	if (state.didDie) {
		for (const room of rooms) {
			if (room.level == state.level) {
				const levelTimes = state.levelTimes;
				initState();
				state.levelTimes = levelTimes;
				// take player to init room of current level
				const initRoom = initRooms.find((r) => r.id == room.id);
				setRoom(initRoom, true);
				saveState();
				delete localStorage.rooms;
				location.href = location.href;
			}
		}
		reset();
	} else {
		setPaused(!state.isPaused);
		document.getElementById('toggle-pause').innerHTML = state.isPaused
			? 'Resume'
			: 'Pause';
	}
}

function closeModals() {
	const modals = document.getElementsByClassName('modal');
	for (let i = 0; i < modals.length; i++) {
		modals[i].classList.add('hidden');
	}
	if (state.isPaused) {
		if (state.didDie) {
			setPaused(false);
		} else {
			togglePause();
		}
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
			y: state.player.y,
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

function setRoom(room, isGameOver) {
	console.log('room', room.id);
	state.room = room;
	// for (const id in animIntervalIds) {
	// 	clearInterval(animIntervalIds[id]);
	// }

	for (const character of room.characters || []) {
		character.motion = 'idleFrames';
		animate(character);
	}

	if (room.sounds && room.sounds.enter) {
		play(room.sounds.enter);
	}
	roomMusic && roomMusic.pause();
	roomMusic =
		(room.sounds && rooms[room.id].sounds.ambient) || window.defaultRoomMusic;
	// console.log('setRoom roomMusic ', roomMusic);
	if (room.level) {
		const now = new Date().getTime();
		if (room.level != state.level) {
			if (room.level > 1) {
				play(levelUpSound);
			}
			state.level = room.level;
			state.levelTimes = state.levelTimes || {};
			state.levelTimes[state.level] = state.levelTimes[state.level] || {};
			state.levelTimes[state.level].start = now;
			if (state.level > 1 && !isGameOver) {
				state.levelTimes[state.level - 1].end = now;
				const completionTime =
					now - state.levelTimes[state.level - 1].start - state.pausedTime;
				const best = state.levelTimes[state.level - 1].best;
				if (!best || completionTime < best) {
					state.levelTimes[state.level - 1].best = completionTime;
				}
			}
			state.pausedTime = 0;
		}
		showLevel();
	}
}

function showMerchantSelection(type) {
	const content = document.getElementById('merchant-modal-content');
	const contentInner = document.getElementById('merchant-modal-content-inner');
	const initContent = document.getElementById('merchant-modal-init-content');
	initContent.classList.add('hidden');

	let html = `<div id="player-treasure-amount">Your treasure: ${moneySymbol} ${
		state.inventory.treasure || 0
	}</div > `;

	html += '<div class="table-container">';
	html += '<table>';
	if (type == 'buy') {
		const merchant = state.room.characters.find((c) => c.id == 'merchant');
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
				if (item.cost) {
					let value = item.cost * resaleFactor;
					if (item.type == 'weapon') {
						value *= state.inventory[itemId] / item.value;
					} else if (item.type == 'projectile') {
						value = (state.inventory[itemId] * item.cost) / item.value;
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
	} else if (type == 'repair') {
		let numWeapons = 0;
		for (const itemId in state.inventory) {
			const type = items[itemId].type;
			if (type == 'weapon') {
				numWeapons++;
			}
		}

		if (numWeapons == 0) {
			html +=
				"<tr><th>You don't appear to be carrying any weapons...</th></tr>";
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
				html +=
					'<tr><th></th><th>Item</th><th>Condition</th><th>Cost</th><th></th></tr>';
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
				html +=
					"<tr><th>All your weapons are in excellent condition!<br/> There's nothing for me to repair here.</th></tr>";
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
		toast("Sorry, you can't afford my fee. Come back with more money!");
	} else {
		play(characters.merchant.sounds.repair);
		state.inventory.treasure -= item.repairCost;
		state.inventory[itemId] = item.value;
		toast('There you are... good as new!');
		showMerchantSelection('repair');
	}
}

function sellItem(itemId, value) {
	play(characters.merchant.sounds.sell);
	let saleValue = value;
	if (items[itemId].type == 'projectile') {
		saleValue = items[itemId].cost / items[itemId].value;
	}
	state.inventory.treasure = (state.inventory.treasure || 0) + saleValue;

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
	showMerchantSelection('sell');
}

function buyItem(itemId) {
	const item = items[itemId];
	if (item.cost > (state.inventory.treasure || 0)) {
		toast("Sorry, you can't afford that. Come back with more money!");
	} else {
		if (item.type == 'weapon' && state.inventory[itemId] > 0) {
			toast(
				"It looks like you're already carrying one of those.<br/> Maybe you'd like to sell me yours first?"
			);
		} else {
			play(characters.merchant.sounds.buy);
			state.inventory.treasure -= item.cost;
			state.inventory[itemId] =
				(state.inventory[itemId] || 0) + (item.value || 1);
			toast('Sold! It has been a pleasure doing business.');
			showMerchantSelection('buy');
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

function reset(isResetTimes) {
	play(dreamSound);
	let opacity = 1;
	setInterval(() => {
		document.body.style.opacity = opacity;
		opacity -= 0.01;
	}, 20);
	setTimeout(() => {
		const levelTimes = state.levelTimes;
		initState();
		if (!isResetTimes) {
			state.levelTimes = levelTimes;
		}
		saveState();
		delete localStorage.rooms;
		location.href = location.href;
	}, 2000);
}

function saveState() {
	function serialize(key, value) {
		// if (typeof value == 'function') {
		// 	return '__function';
		// }
		// console.log('key value', key, value);
		return key == 'doors' ? [] : value;
	}
	localStorage.state = JSON.stringify(state, serialize);
	localStorage.rooms = JSON.stringify(rooms, serialize);
}

function showLevel() {
	const levelDiv = document.getElementById('level');
	levelDiv.innerHTML = state.level;
}

function showLevelSelectionModal() {
	const table = document.getElementById('level-selection-table');
	let html = '<tr><th>Level</th><th>Best Time</th></tr>';
	let maxLevel = 0;
	for (const level in state.levelTimes) {
		if (state.levelTimes[level].best) {
			maxLevel = Math.max(maxLevel, level);
			const best = formatTime(state.levelTimes[level].best);
			html += `<tr><td>${level}</td><td>${best}</td></tr>`;
		}
	}
	const currentTime =
		new Date() - state.levelTimes[state.level - 1].start - state.pausedTime;
	html += `<tr><td>${maxLevel + 1}</td><td>${formatTime(
		currentTime
	)} ... still in progress</td></tr>`;
	table.innerHTML = html;
	showModal('level-selection-modal');
}

function initState(room) {
	room = room || rooms[0];
	state = {
		player: {
			id: 'player',
			x: 0.5,
			y: 0.5,
			health: 1,
			motion: 'idleFrames',
		},
		inventory: {},
		room,
		t: 0,
		pausedTime: 0,
	};
}

function drawPoint(loc, color) {
	const p = toScreen(loc);
	debugPoints.push({ p, color });
}

function testBounds(currWall, testLoc, width, height) {
	if (
		!(
			testLoc.x < 0 ||
			testLoc.y < 0 ||
			testLoc.x + width >= state.room.width ||
			testLoc.y + height >= state.room.height
		)
	) {
		const left = testLoc.x;
		const right = testLoc.x + currWall.width;
		const top = testLoc.y;
		const bottom = testLoc.y + currWall.height;
		const corners = [
			{
				// id: 'top-left',
				x: left,
				y: top,
			},
			{
				// id: 'top-right',
				x: right,
				y: top,
			},
			{
				// id: 'bottom-left',
				x: left,
				y: bottom,
			},
			{
				// id: 'bottom-right',
				x: right,
				y: bottom,
			},
		];

		for (const wall of state.room.walls) {
			if (wall != currWall) {
				for (const corner of corners) {
					if (
						corner.x >= wall.location.x &&
						corner.x <= wall.location.x + wall.width &&
						corner.y >= wall.location.y &&
						corner.y <= wall.location.y + wall.height
					) {
						return false;
					}
				}

				// now check for corners on opposite sides of the wall!
				if (
					(corners[0].x <= wall.location.x &&
						corners[1].x >= wall.location.x + wall.width &&
						((corners[0].y <= wall.location.y + wall.height &&
							corners[0].y >= wall.location.y) ||
							(corners[2].y <= wall.location.y + wall.height &&
								corners[2].y >= wall.location.y))) ||
					(corners[0].y <= wall.location.y &&
						corners[2].y >= wall.location.y + wall.height &&
						((corners[0].x <= wall.location.x + wall.width &&
							corners[0].x >= wall.location.x) ||
							(corners[1].x <= wall.location.x + wall.width &&
								corners[1].x >= wall.location.x)))
				) {
					// console.log(state.t, 'player y intersect: opposite sides ');
					return false;
				}
			}
		}
	}

	return true;
}
