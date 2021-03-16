const moveFuncs = {

	random(character) {
		if (!character.vel) {
			character.vel = {
				x: 0,
				y: 0
			};
		}
		const velFactor = 0.0022;
		const maxVel = 0.012;
		character.vel.x += (Math.random() - 0.5) * velFactor;
		character.vel.x = Math.max(Math.min(character.vel.x, maxVel), -maxVel)
		character.vel.y += (Math.random() - 0.5) * velFactor;
		character.vel.y = Math.max(Math.min(character.vel.y, maxVel), -maxVel)
		character.location.x += character.vel.x;
		character.location.y += character.vel.y;
	},

};

const interactionFuncs = {
	magnetic(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		const radius1 = (character.width + character.height) / 2;
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
					'player left wielding sword_02.png',
				],
				right: [
					'player right wielding sword_02.png',
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
		strike: {
			sword_1: {
				left: [
					'player left strike sword_01.png',
				]
			},
			sword_2: {
				left: [
					'player left strike sword_02.png',
				]
			},
		}
	},
	doomScreen: {
		animInterval: 400,
		width: 0.12,
		height: 0.12,
		standing: [
			'doom screen standing 01.png',
			'doom screen standing 02.png',
			'doom screen standing 03.png',
			'doom screen standing 04.png',
			'doom screen standing 03.png',
			'doom screen standing 02.png',
		],
		move: moveFuncs.random,
		interact: interactionFuncs.magnetic,
	},
	zlakik: {
		width: 0.1,
		height: 0.06,
		standing: [
			'zlakik 01.png'
		],
		move: moveFuncs.random,
		interact: interactionFuncs.magnetic,
	}
};
