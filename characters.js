const moveFuncs = {

	random(character) {
		if (!character.vel) {
			character.vel = {
				x: 0,
				y: 0
			};
		}
		const velFactor = character.deltaSpeed || 0.0008;
		const maxVel = character.maxSpeed || 0.004;
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

	followSameType(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		const character2 = characters[roomCharacter2.id];
		if (character.id == character2.id) {
			const character1X = roomCharacter.location.x * getValue(state.room, 'width');
			const character1Y = roomCharacter.location.y * getValue(state.room, 'height');
			const character2X = roomCharacter2.location.x * getValue(state.room, 'width');
			const character2Y = roomCharacter2.location.y * getValue(state.room, 'height');
			const dx = character2X - character1X;
			const dy = character2Y - character1Y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist > 0) {
				const factor = (character.followFactor || 0.05) * (character.speed || 0.004) / dist;
				roomCharacter.location.x += factor * dx;
				roomCharacter.location.y += factor * dy;
			}
		}
	},

	circlePlayer(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		const character2 = characters[roomCharacter2.id];
		if (characters.player == character2) {
			const characterX = roomCharacter.location.x * getValue(state.room, 'width');
			const characterY = roomCharacter.location.y * getValue(state.room, 'height');
			const playerX = roomCharacter2.x * getValue(state.room, 'width');
			const playerY = roomCharacter2.y * getValue(state.room, 'height');
			const dx = playerX - characterX;
			const dy = playerY - characterY;
			roomCharacter.rotation = Math.atan2(dy, dx);
			const dist = Math.sqrt(dx * dx + dy * dy);
			// console.log(dist, dx, dy);
			const factor = (character.speed || 0.004) / dist;
			if (roomCharacter.motion == 'attackFrames' && dist > 0.04) {
				roomCharacter.location.x += factor * dx;
				roomCharacter.location.y += factor * dy;
			} else if (dist < character.targetDist) {
				roomCharacter.location.x -= 2 * factor * dx;
				roomCharacter.location.y -= 2 * factor * dy;
			} else if (dist > character.targetDist * 2) {
				roomCharacter.location.x += 2 * factor * dx;
				roomCharacter.location.y += 2 * factor * dy;
			}

			// console.log(dx, dy);
			roomCharacter.location.x += factor * dy;
			roomCharacter.location.y -= factor * dx;
		}
	},

	moveTowardPlayer(roomCharacter, roomCharacter2) {
		const character = characters[roomCharacter.id];
		const character2 = characters[roomCharacter2.id];
		if (characters.player == character2) {
			const x1 = roomCharacter.location.x * getValue(state.room, 'width');
			const y1 = roomCharacter.location.y * getValue(state.room, 'height');
			const x2 = roomCharacter2.x * getValue(state.room, 'width');
			const y2 = roomCharacter2.y * getValue(state.room, 'height');
			// console.log(x1, y1, x2, y2);
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
			const roomWidth = getValue(state.room, 'width');
			const roomHeight = getValue(state.room, 'height');
			x2 = (roomCharacter2.x - (1 - roomWidth) / 2) / roomWidth;
			y2 = (roomCharacter2.y - (1 - roomHeight) / 2) / roomHeight;
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
		id: 'player',
		animInterval: 400,
		width: 0.05,
		height: 0.1,
		idleFrames: [
			'player standing 01.png',
			'player standing 02.png',
		],
		up: [
			'player up 01.png',
			'player up 02.png',
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
		dieFrames: [
			'player dead 01.png',
			'player dead 02.png',
			'player dead 03.png',
			'player dead 04.png',
			'player dead 03.png',
			'player dead 02.png',
		],
		wielding: {
			enchantedSword: {
				left: [
					'player left wielding enchanted sword 01.png',
					'player left wielding enchanted sword 02.png',
				],
				right: [
					'player right wielding enchanted sword 01.png',
					'player right wielding enchanted sword 02.png',
				],
				idleFrames: [
					'player standing wielding enchanted sword.png',
				],
				up: [
					'player up wielding 01.png',
					'player up wielding 02.png',
				],
				down: [
					'player down wielding enchanted sword 01.png',
					'player down wielding enchanted sword 02.png',
				],
			},
			venomDagger: {
				left: [
					'player left wielding venom dagger 01.png',
					'player left wielding venom dagger 02.png',
				],
				right: [
					'player right wielding venom dagger 01.png',
					'player right wielding venom dagger 02.png',
				],
				idleFrames: [
					'player standing wielding venom dagger.png',
				],
				up: [
					'player up wielding 01.png',
					'player up wielding 02.png',
				],
				down: [
					'player down wielding venom dagger 01.png',
					'player down wielding venom dagger 02.png',
				],
			},
			electrosmasher: {
				left: [
					'player left wielding electrosmasher 01.png',
					'player left wielding electrosmasher 02.png',
				],
				right: [
					'player right wielding electrosmasher 01.png',
					'player right wielding electrosmasher 02.png',
				],
				idleFrames: [
					'player standing wielding electrosmasher.png',
				],
				up: [
					'player up wielding 01.png',
					'player up wielding 02.png',
				],
				down: [
					'player down wielding electrosmasher 01.png',
					'player down wielding electrosmasher 02.png',
				],
			},
			bow: {
				left: [
					'player left wielding bow 01.png',
					'player left wielding bow 02.png',
				],
				right: [
					'player right wielding bow 01.png',
					'player right wielding bow 02.png',
				],
				idleFrames: [
					'player standing wielding bow.png',
				],
				up: [
					'player up wielding 01.png',
					'player up wielding 02.png',
				],
				down: [
					'player down wielding bow 01.png',
					'player down wielding bow 02.png',
				],
			},
		},
		attack: {
			enchantedSword: {
				left: [
					'player left strike enchanted sword.png',
				],
				right: [
					'player right strike enchanted sword.png',
				]
			},
			venomDagger: {
				left: [
					'player left strike venom dagger.png',
				],
				right: [
					'player right strike venom dagger.png',
				]
			},
			electrosmasher: {
				left: [
					'player left strike electrosmasher.png',
				],
				right: [
					'player right strike electrosmasher.png',
				]
			},
			bow: {
				// left: [
				// 	'player left strike bow.png',
				// ],
				// right: [
				// 	'player right strike bow.png',
				// ]
			},
		},
		sounds: {
			walk: 'player walk.mp3',
			die: 'player die.mp3',
		}
	},
	gilgamin: {
		id: 'gilgamin',
		type: 'supporting',
		animInterval: 140,
		width: 0.2,
		height: 0.2,
		idleFrames: [
			'gilgamin.png'
		],

	},
	doomScreen: {
		id: 'doomScreen',
		type: 'enemy',
		animInterval: 140,
		width: 0.18,
		height: 0.12,
		idleFrames: [
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
		sounds: {
			injured: 'doomscreen injured.mp3',
			attack: 'doomscreen attack.mp3',
			die: 'doomscreen die.mp3',
		},
		resilience: 2.4,
		attackMetrics: {
			prob: 0.012,
			prepTime: 600,
			range: 0.12, // proportion of canvas
			strength: 0.2,
			resetTime: 600,
		},
		targetDist: 0.08,
		speed: 0.012,
	},
	zlakik: {
		id: 'zlakik',
		type: 'enemy',
		animInterval: 120,
		width: 0.1,
		height: 0.06,
		idleFrames: [
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
		sounds: {
			injured: 'zlakik injured.mp3',
			attack: 'zlakik attack.mp3',
			die: 'zlakik die.mp3',
		},
		resilience: 1.4,
		attackMetrics: {
			prob: 0.004,
			prepTime: 400,
			range: 0.32, // proportion of canvas
			strength: 0.08,
			resetTime: 600,
		},
		targetDist: 0.2,
		speed: 0.006,
	},
	megabug: {
		id: 'megabug',
		type: 'enemy',
		animInterval: 100,
		width: 0.1,
		height: 0.1,
		idleFrames: [
			'megabug v2 01.png',
			'megabug v2 02.png',
			'megabug v2 03.png',
			'megabug v2 02.png',
		],
		dieFrames: [
			'megabug v2 die 01.png',
			'megabug v2 die 02.png'
		],
		attackFrames: [
			'megabug v2 attack 01.png',
			'megabug v2 attack 02.png',
			'megabug v2 attack 01.png',
		],
		attackPrepFrames: [
			'megabug v2 01.png',
		],
		move: [
			moveFuncs.random,
		],
		interact: [
			// interactionFuncs.moveTowardPlayer,
			interactionFuncs.followSameType,
		],
		sounds: {
			injured: 'megabug injured.mp3',
			attack: 'megabug attack.mp3',
			// die: 'zlakik die.mp3',
		},
		resilience: 1.4,
		attackMetrics: {
			prob: 0.2,
			prepTime: 0,
			range: 0.1, // proportion of canvas
			strength: 0.012,
			resetTime: 200,
		},
		targetDist: 0.08,
		speed: 0.012,
		deltaSpeed: 0.0012,
		maxSpeed: 0.12,
		followFactor: 0.048,
	},
	merchant: {
		type: 'merchant',
		animInterval: 280,
		width: 0.4,
		height: 0.4,
		idleFrames: [
			'merchant 01.png',
			'merchant 02.png',
			'merchant 03.png',
			'merchant 02.png',
		],
		sounds: {
			repair: 'merchant repair.mp3',
			sell: 'cash register.mp3',
			buy: 'cash register.mp3',
		}
	}
};
