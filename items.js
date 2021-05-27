items = {
	treasure: {
		image: 'treasure-05.png',
		label: 'Treasure',
		value: 10,
		size: 0.1,
		sounds: {
			pickup: 'treasure pickup 2.mp3',
		},
	},
	sword_1: {
		type: 'weapon',
		image: 'sword 01.png',
		label: 'Enchanted Sword',
		// value: 0.2,
		size: 0.15,
		range: 80, // pixels
		damage: 0.32,
		value: 24, // num uses of weapon before it breaks
		resetTime: 480,
		sounds: {
			hit: 'sword 01 hit.mp3',
			draw: 'sword 01 draw.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
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
		value: 40, // num uses of weapon before it breaks
		sounds: {
			hit: 'sword 02 hit.mp3',
			draw: 'sword 02 draw.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		},
	},
	healing_potion_1: {
		type: 'potion',
		image: 'healing potion 01.png',
		label: 'Healing Potion',
		size: 0.06,
		sounds: {
			quaff: 'quaff potion.mp3',
			pickup: 'pickup potion.mp3',
		},
		action: state => {
			if (state.player.health < 1) {
				state.player.health = Math.min(1, state.player.health + 0.12);
				return true;
			}
		}
	}
};
