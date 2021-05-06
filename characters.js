const moveFuncs = {

	random(character) {
		if (!character.vel) {
			character.vel = {
				x: 0,
				y: 0
			};
		}
		const velFactor = 0.0008;
		const maxVel = 0.004;
		character.vel.x += (Math.random() - 0.5) * velFactor;
		character.vel.x = Math.max(Math.min(character.vel.x, maxVel), -maxVel)
		character.vel.y += (Math.random() - 0.5) * velFactor;
		character.vel.y = Math.max(Math.min(character.vel.y, maxVel), -maxVel)
		character.location.x += character.vel.x;
		character.location.y += character.vel.y;
	},

	moveAround(roomCharacter) {
		// const character = characters[roomCharacter.id];
		const motion = new Date().getSeconds() % 4;
		if (motion == 0) {
			roomCharacter.location.y += 0.02;
		} else if (motion == 1) {
			roomCharacter.location.y -= 0.02;
		} else if (motion == 2) {
			roomCharacter.location.x += 0.02;
		} else if (motion == 3) {
			roomCharacter.location.x -= 0.02;
		}
	},
};

const interactionFuncs = {

	circlePlayer(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		const character2 = characters[roomCharacter2.id];
		if (characters.player == character2) {
			const x1 = roomCharacter.location.x * state.room.width;
			const y1 = roomCharacter.location.y * state.room.height;
			const x2 = roomCharacter2.x * state.room.width;
			const y2 = roomCharacter2.y * state.room.height;
			const dx = x2 - x1;
			const dy = y2 - y1;
			roomCharacter.rotation = Math.atan2(dy, dx);
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist > 0) {
				// console.log(dx, dy);
				const factor = (character.speed || 0.004) / dist;
				roomCharacter.location.x += factor * dy;
				roomCharacter.location.y += -factor * dx;
			}
		}
	},

	moveTowardPlayer(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		const character2 = characters[roomCharacter2.id];
		if (characters.player == character2) {
			const x1 = roomCharacter.location.x * state.room.width;
			const y1 = roomCharacter.location.y * state.room.height;
			const x2 = roomCharacter2.x * state.room.width;
			const y2 = roomCharacter2.y * state.room.height;
			const dx = x1 - x2;
			const dy = y1 - y2;
			const dist = Math.sqrt(dx * dx + dy * dy);
			// console.log(dx, dy, dist);
			const targetDist = character.targetDist || 0.06;
			const factor = (character.speed || 0.04) * (dist > targetDist ? -dist / targetDist : targetDist / dist);
			// console.log(factor);
			// const d = Math.sqrt((factor * dx) * (factor * dx) + (factor * dy) * (factor * dy));
			// if (Math.abs(factor) > 0.1) {
			roomCharacter.location.x += factor * dx;
			roomCharacter.location.y += factor * dy;
			// console.log(roomCharacter.location);
			// }
		}
	},

	magnetic(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		// const radius1 = (character.width + character.height) / 2;
		const x1 = roomCharacter.location.x + character.width / 2;
		const y1 = roomCharacter.location.y + character.height / 2;
		// if (isNaN(roomCharacter.location.y)) {
		// 	console.log('roomCharacter', roomCharacter);
		// 	console.log('character', character);
		// }
		const character2 = characters[roomCharacter2.id] || characters.player;
		let x2, y2;
		if (characters.player == character2) {
			x2 = (roomCharacter2.x - (1 - state.room.width) / 2) / state.room.width;
			y2 = (roomCharacter2.y - (1 - state.room.height) / 2) / state.room.height;
		} else {
			x2 = roomCharacter2.location.x + character2.width / 2;
			y2 = roomCharacter2.location.y + character2.height / 2;
		}
		const radius2 = (character2.width + character2.height) / 2;
		const dx = x1 - x2;
		const dy = y1 - y2;
		// console.log(y1, y2, dy);
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (!roomCharacter2.vel) {
			roomCharacter2.vel = {
				x: 0,
				y: 0
			};
		}
		if (characters.player == character2) {
			roomCharacter.vel.x += 0.0001 * dx / (radius2 - dist);
			roomCharacter.vel.y += 0.0001 * dy / (radius2 - dist);
		} else if (dist < 0.4) {
			// console.log('inersection', characters.player == character2);
			roomCharacter.vel.x += 0.0001 * dx / dist;
			roomCharacter.vel.y += 0.0001 * dy / dist;
			// console.log(roomCharacter.vel);
		}
	}
};

characters = {

	player: {
		animInterval: 400,
		width: 0.05,
		height: 0.1,
		standing: [
			'player standing 01.png',
			'player standing 02.png',
		],
		up: [
			'player up.png',
		],
		down: [
			'player down 01.png',
			'player down 02.png',
		],
		left: [
			'player left 01.png',
			'player left 02.png',
		],
		right: [
			'player right 01.png',
			'player right 02.png',
		],
		wielding: {
			sword_1: {
				left: [
					'player left wielding sword_01.png',
				],
				right: [
					'player right wielding sword_01.png',
				],
				standing: [
					'player standing wielding sword_01.png',
				],
				up: [
					'player standing wielding sword_01.png',
				],
				down: [
					'player standing wielding sword_01.png',
				],
			},
			sword_2: {
				left: [
					'player left wielding sword_02 01.png',
					'player left wielding sword_02 02.png',
				],
				right: [
					'player right wielding sword_02 01.png',
					'player right wielding sword_02 02.png',
				],
				standing: [
					'player standing wielding sword_02.png',
				],
				up: [
					'player standing wielding sword_02.png',
				],
				down: [
					'player standing wielding sword_02.png',
				],
			}
		},
		attack: {
			sword_1: {
				left: [
					'player left strike sword_01.png',
				],
				right: [
					'player right strike sword_01.png',
				]
			},
			sword_2: {
				left: [
					'player left strike sword_02.png',
				],
				right: [
					'player right strike sword_02.png',
				]
			},
		}
	},
	doomScreen: {
		type: 'enemy',
		animInterval: 140,
		width: 0.18,
		height: 0.12,
		standing: [
			// 'test.png',
			// 'doom screen standing 01.png',
			'doom screen standing 02.png',
			'doom screen standing 03.png',
			'doom screen standing 04.png',
			'doom screen standing 05.png',
			'doom screen standing 06.png',
			'doom screen standing 05.png',
			'doom screen standing 04.png',
			'doom screen standing 03.png',
			'doom screen standing 02.png',
		],
		dieFrames: [
			'doom screen dead 01.png',
			'doom screen dead 02.png',
		],
		attackFrames: [
			'doom screen attack 01.png',
		],
		attackPrepFrames: [
			'doom screen attack-prep 01.png',
		],
		move: [
			moveFuncs.random,
		],
		interact: [
			interactionFuncs.moveTowardPlayer,
		],
		resilience: 2.4,
		attackMetrics: {
			prob: 0.012,
			prepTime: 400,
			range: 0.4,
			strength: 0.02,
			resetTime: 600,
		},
		targetDist: 0.08,
		speed: 0.012,
	},
	zlakik: {
		type: 'enemy',
		animInterval: 120,
		width: 0.1,
		height: 0.06,
		standing: [
			'zlakik 01.png',
			'zlakik 02.png',
			'zlakik 03.png',
			'zlakik 02.png',
		],
		dieFrames: [
			'zlakik 01.png'
		],
		attackFrames: [
			'zlakik attack 01.png'
		],
		attackPrepFrames: [
			'zlakik 01.png'
		],
		// move: [
		// 	moveFuncs.random,
		// ],
		interact: [
			interactionFuncs.circlePlayer,
		],
		resilience: 1.4,
		attackMetrics: {
			prob: 0.012,
			prepTime: 400,
			range: 0.4,
			strength: 0.02,
			resetTime: 600,
		},
		targetDist: 0.08,
		speed: 0.008,
	}
};
