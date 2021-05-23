items = {
	treasure: {
		image: 'treasure-05.png',
		label: 'Treasure',
		value: 10,
		size: 0.1,
	},
	sword_1: {
		type: 'weapon',
		image: 'sword 01.png',
		label: 'Enchanted Sword',
		// value: 0.2,
		size: 0.15,
		range: 80, // pixels
		damage: 0.32,
		resetTime: 480,
		sounds: {
			hit: 'sword 01 hit.mp3',
			draw: 'sword 01 draw.mp3',
		}
	},
	sword_2: {
		type: 'weapon',
		image: 'sword 02.png',
		label: 'Venom Dagger',
		// value: 0.05,
		size: 0.09,
		range: 64, // pixels
		damage: 0.2,
		resetTime: 300,
		sounds: {
			hit: 'sword 02 hit.mp3',
			draw: 'sword 02 draw.mp3',
		},
	},
};
