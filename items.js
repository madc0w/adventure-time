items = {
	treasure: {
		type: 'treasure',
		image: 'treasure-05.png',
		label: 'Treasure',
		value: 10,
		size: 0.1,
		sounds: {
			pickup: 'treasure pickup 2.mp3',
		},
	},
	superTreasure: {
		type: 'treasure',
		image: 'treasure-06.png',
		label: 'King\'s Treasure',
		value: 40,
		size: 0.1,
		sounds: {
			pickup: 'treasure pickup 2.mp3',
		},
	},
	enchantedSword: {
		type: 'weapon',
		image: 'enchanted sword.png',
		label: 'Enchanted Sword',
		// value: 0.2,
		size: 0.15,
		range: 0.2, // proportion of canvas
		damage: 0.32,
		value: 24, // num uses of weapon before it breaks
		resetTime: 480,
		cost: 22,
		repairCost: 14,
		sounds: {
			hit: 'sword 01 hit.mp3',
			draw: 'sword 01 draw.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		}
	},
	venomDagger: {
		type: 'weapon',
		image: 'venom dagger.png',
		label: 'Venom Dagger',
		// value: 0.05,
		size: 0.09,
		range: 0.12, // proportion of canvas
		damage: 0.2,
		resetTime: 300,
		value: 40, // num uses of weapon before it breaks
		cost: 12,
		repairCost: 7,
		sounds: {
			hit: 'sword 02 hit.mp3',
			draw: 'sword 02 draw.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		},
	},
	electrosmasher: {
		type: 'weapon',
		image: 'electrosmasher.png',
		label: 'Electrosmahser',
		size: 0.1,
		range: 0.16, // proportion of canvas
		damage: 0.5,
		resetTime: 600,
		value: 20, // num uses of weapon before it breaks
		cost: 32,
		repairCost: 20,
		sounds: {
			hit: 'zap.mp3',
			draw: 'thunderclap.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		},
	},
	healingPotion1: {
		type: 'potion',
		image: 'healing potion 01.png',
		label: 'Healing Potion',
		size: 0.06,
		cost: 12,
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
	},
	invisibilityPotion: {
		type: 'potion',
		image: 'invisibility potion.png',
		label: 'Invisibility Potion',
		size: 0.06,
		cost: 18,
		duration: 2000,
		sounds: {
			quaff: 'quaff potion.mp3',
			pickup: 'pickup potion.mp3',
		},
		action: state => {
			if (!state.player.isInvisible) {
				state.player.isInvisible = true;
				state.player.invisibilityStart = state.t;
				return true;
			}
		}
	},
	blueKey: {
		type: 'key',
		image: 'key 01.png',
		label: 'Blue Key',
		size: 0.04,
		color: '#2774f9',
		sounds: {
			pickup: 'key pickup.mp3',
		},
	}
};
