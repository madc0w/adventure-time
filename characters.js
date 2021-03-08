const moveFuncs = {

	random(character) {
		if (!character.vel) {
			character.vel = {
				x: 0,
				y: 0
			};
		}
		const velFactor = 0.0022;
		const maxVal = 0.02;
		character.vel.x += (Math.random() - 0.5) * velFactor;
		character.vel.x = Math.max(Math.min(character.vel.x, maxVal), -maxVal)
		character.vel.y += (Math.random() - 0.5) * velFactor;
		character.vel.y = Math.max(Math.min(character.vel.y, maxVal), -maxVal)
		character.location.x += character.vel.x;
		character.location.y += character.vel.y;
	}

};

characters = {

	player: {
		animInterval: 400,
		width: 0.05,
		height: 0.1,
		standing: [
			'player standing.png',
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
	},
	doomScreen: {
		animInterval: 120,
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
		move: moveFuncs.random
	}
};
