items = {
	copperCoin: {
		type: 'treasure',
		image: 'copper coin.png',
		label: 'Copper Coin',
		value: 0.01,
		size: 0.04,
		sounds: {
			pickup: 'treasure pickup 2.mp3',
		},
	},
	goldCoin: {
		type: 'treasure',
		image: 'gold coin.png',
		label: 'Gold Coin',
		value: 0.1,
		size: 0.04,
		sounds: {
			pickup: 'treasure pickup 2.mp3',
		},
	},
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
		label: "King's Treasure",
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
		repairCost: 8,
		sounds: {
			hit: 'sword 01 hit.mp3',
			draw: 'sword 01 draw.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		},
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
		repairCost: 5,
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
		label: 'Electrosmasher',
		size: 0.1,
		range: 0.16, // proportion of canvas
		damage: 0.5,
		resetTime: 600,
		value: 20, // num uses of weapon before it breaks
		cost: 32,
		repairCost: 12,
		sounds: {
			hit: 'zap.mp3',
			draw: 'thunderclap.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		},
	},
	bow: {
		type: 'weapon',
		projectile: 'arrow',
		image: 'bow.png',
		label: 'Bow',
		size: 0.1,
		resetTime: 600,
		value: 20, // num uses of weapon before it breaks
		cost: 32,
		repairCost: 12,
		sounds: {
			draw: 'wield bow.mp3',
			pickup: 'sword pickup.mp3',
			broken: 'broken weapon.mp3',
		},
	},
	arrow: {
		type: 'projectile',
		label: 'Arrows',
		image: 'arrow.png',
		size: 0.03,
		damage: 0.3,
		speed: 0.01,
		cost: 20,
		value: 20, // num arrows
		sounds: {
			hitWall: 'arrow hit wall.mp3',
			pickup: 'pickup arrows.mp3',
			launch: 'arrow launch.mp3',
		},
	},
	flameThrower: {
		type: 'weapon',
		projectile: 'fireball',
		image: 'flamethrower.png',
		label: 'Flamethrower',
		size: 0.1,
		resetTime: 400,
		value: 12, // num uses of weapon before it breaks
		cost: 48,
		repairCost: 20,
		sounds: {
			draw: 'wield flamethrower.mp3',
			pickup: 'flamethrower pickup.mp3',
			broken: 'broken weapon.mp3',
		},
	},
	fireball: {
		type: 'projectile',
		label: 'Fireballs',
		image: 'fireball.png',
		size: 0.04,
		damage: 0.44,
		speed: 0.016,
		cost: 32,
		value: 20, // num fireballs
		sounds: {
			hitWall: 'fireball hit wall.mp3',
			pickup: 'pickup fireballs.mp3',
			launch: 'fireball launch.mp3',
		},
	},
	voidball: {
		type: 'projectile',
		label: 'Voidballs',
		image: 'voidball.png',
		size: 0.06,
		damage: 0.44,
		speed: 0.032,
		sounds: {
			hitWall: 'voidball hit wall.mp3',
			launch: 'voidball launch.mp3',
			hitPlayer: 'voidball hit player.mp3',
		},
	},
	bugDart: {
		type: 'projectile',
		label: 'Bug Darts',
		image: 'bug dart.png',
		size: 0.02,
		damage: 0.06,
		speed: 0.02,
		sounds: {
			hitWall: 'bug dart hit wall.mp3',
			launch: 'bug dart launch.mp3',
			hitPlayer: 'voidball hit player.mp3',
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
		action: (state) => {
			if (state.player.health < 1) {
				state.player.health = Math.min(1, state.player.health + 0.2);
				return true;
			}
		},
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
		action: (state) => {
			if (!state.player.isInvisible) {
				state.player.isInvisible = true;
				state.player.invisibilityStart = state.t;
				return true;
			}
		},
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
	},
	redKey: {
		type: 'key',
		image: 'key 02.png',
		label: 'Red Key',
		size: 0.04,
		color: '#fc1000',
		sounds: {
			pickup: 'key pickup.mp3',
		},
	},
};
