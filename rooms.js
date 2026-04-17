defaultRoomBackground = 'granite stones texture.jpg';

const movingBlock = {
	isMovable: true,
	width: 0.16,
	height: 0.16,
	background: '20210613_144554.jpg',
};

rooms = [
	{
		id: 0,
		level: 1,
		width: 0.9,
		height: 0.6,
		walls: [
			{
				location: {
					x: 0.6,
					y: 0.69,
				},
				width: 0.4,
				height: 0.04,
			},
			{
				location: {
					x: 0.6,
					y: 0.29,
				},
				width: 0.4,
				height: 0.04,
			},
		],
		doors: [
			{
				roomId: 3,
				wall: 's',
				location: 0.2,
				key: 'redKey',
			},
			{
				isOneWay: true,
				roomId: 1,
				wall: 'w',
				location: 0.44,
			},
			{
				roomId: 4,
				wall: 'n',
				location: 0.5,
				key: 'blueKey',
			},
			{
				roomId: 5,
				wall: 'e',
				location: 0.5,
			},
		],
	},
	{
		id: 1,
		width: 0.9,
		height: 0.6,
		walls: [
			{
				location: {
					x: 0.4,
					y: 0.68,
				},
				width: 0.6,
				height: 0.06,
			},
			{
				location: {
					x: 0.4,
					y: 0.7,
				},
				width: 0.04,
				height: 0.16,
			},
		],
		doors: [
			{
				roomId: 2,
				wall: 's',
				location: 0.2,
			},
		],
		portals: [
			{
				location: {
					x: 0.58,
					y: 0.84,
				},
				destination: {
					roomId: 0,
					x: 0.86,
					y: 0.84,
				},
			},
		],
		characters: [
			{
				id: 'megabug',
				location: {
					x: 0.1,
					y: 0.4,
				},
			},
			{
				id: 'megabug',
				location: {
					x: 0.4,
					y: 0.4,
				},
			},
		],
		items: [
			{
				id: 'enchantedSword',
				location: {
					x: 0.1,
					y: 0.14,
				},
			},
			{
				id: 'invisibilityPotion',
				location: {
					x: 0.2,
					y: 0.8,
				},
			},
			{
				id: 'redKey',
				location: {
					x: 0.89,
					y: 0.84,
				},
			},
		],
	},
	{
		id: 2,
		width: 0.9,
		height: 0.6,
		portals: [
			{
				location: {
					x: 0.8,
					y: 0.5,
				},
				destination: {
					roomId: 1,
					x: 0.7,
					y: 0.82,
				},
			},
		],
		items: [
			{
				id: 'venomDagger',
				location: {
					x: 0.7,
					y: 0.8,
				},
			},
			{
				id: 'bow',
				location: {
					x: 0.2,
					y: 0.3,
				},
			},
			{
				id: 'arrow',
				location: {
					x: 0.4,
					y: 0.3,
				},
			},
			{
				id: 'superTreasure',
				location: {
					x: 0.1,
					y: 0.1,
				},
			},
		],
	},
	{
		id: 3,
		width: 0.9,
		height: 0.6,
		items: [
			{
				id: 'blueKey',
				location: {
					x: 0.42,
					y: 0.6,
				},
			},
			{
				id: 'treasure',
				location: {
					x: 0.1,
					y: 0.7,
				},
			},
			{
				id: 'treasure',
				location: {
					x: 0.4,
					y: 0.2,
				},
			},
		],
	},
	{
		id: 4,
		level: 2,
		width: 0.27,
		height: 0.6,
		doors: [
			{
				roomId: 7,
				wall: 'n',
				location: 0.3,
			},
		],
		items: [
			{
				id: 'superTreasure',
				location: {
					x: 0.08,
					y: 0.15,
				},
			},
		],
	},
	{
		id: 5,
		width: 0.96,
		height: 0.96,
		walls: [
			{
				location: {
					x: 0.4,
					y: 0.02,
				},
				...movingBlock,
			},
			{
				location: {
					x: 0.6,
					y: 0.02,
				},
				...movingBlock,
			},
			{
				location: {
					x: 0.02,
					y: 0.2,
				},
				...movingBlock,
			},
			{
				location: {
					x: 0.2,
					y: 0.2,
				},
				...movingBlock,
				width: 0.24,
			},
		],
		doors: [
			{
				roomId: 6,
				wall: 'e',
				location: 0.2,
			},
		],
		characters: [
			{
				id: 'doomScreen',
				location: {
					x: 0.1,
					y: 0.04,
				},
			},
		],
		items: [
			{
				id: 'treasure',
				location: {
					x: 0.2,
					y: 0.06,
				},
			},
			{
				id: 'treasure',
				location: {
					x: 0.24,
					y: 0.08,
				},
			},
			{
				id: 'electrosmasher',
				location: {
					x: 0.8,
					y: 0.8,
				},
			},
		],
	},
	{
		id: 6,
		width: 0.8,
		height: 0.7,
		characters: [
			{
				id: 'merchant',
				location: {
					x: 0.5,
					y: 0,
				},
				itemsForSale: [
					'enchantedSword',
					'venomDagger',
					'healingPotion1',
					'electrosmasher',
					'bow',
					'arrow',
					'flameThrower',
					'fireball',
				],
			},
		],
		items: [
			{
				id: 'healingPotion1',
				location: {
					x: 0.9,
					y: 0.8,
				},
			},
		],
	},
	{
		id: 7,
		width: 0.9,
		height: 0.6,
		doors: [
			{
				roomId: 8,
				wall: 'e',
				location: 0.15,
			},
			{
				isOneWay: true,
				roomId: 9,
				wall: 'n',
				location: 0.77,
				key: 'blueKey',
			},
		],
		characters: [
			{
				id: 'zlakik',
				location: {
					x: 0.17,
					y: 0.32,
				},
			},
			{
				id: 'zlakik',
				location: {
					x: 0.64,
					y: 0.24,
				},
			},
			{
				id: 'zlakik',
				location: {
					x: 0.58,
					y: 0.54,
				},
			},
			{
				id: 'zlakik',
				location: {
					x: 0.28,
					y: 0.47,
				},
			},
		],
		items: [
			{
				id: 'healingPotion1',
				location: {
					x: 0.07,
					y: 0.06,
				},
			},
			{
				id: 'treasure',
				location: {
					x: 0.21,
					y: 0.05,
				},
			},
			{
				id: 'healingPotion1',
				location: {
					x: 0.12,
					y: 0.11,
				},
			},
		],
	},
	{
		id: 8,
		width: 0.52,
		height: 0.6,
		items: [
			{
				id: 'treasure',
				location: {
					x: 0.43,
					y: 0.5,
				},
			},
			{
				id: 'healingPotion1',
				location: {
					x: 0.35,
					y: 0.06,
				},
			},
			{
				id: 'healingPotion1',
				location: {
					x: 0.4,
					y: 0.13,
				},
			},
			{
				id: 'blueKey',
				location: {
					x: 0.14,
					y: 0.5,
				},
			},
		],
	},
	{
		id: 9,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 10,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.73,
				},
				destination: {
					roomId: 11,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.19,
				},
			},
		],
	},
	{
		id: 10,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 11,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 19,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.24,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.12,
				},
			},
		],
	},
	{
		id: 11,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 12,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 13,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.35,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.21,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
		],
	},
	{
		id: 12,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 10,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 9,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.33,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.2,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.47,
				},
			},
		],
	},
	{
		id: 13,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 14,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 15,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.43,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.32,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.2,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.56,
				},
			},
		],
	},
	{
		id: 14,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 19,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 15,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.44,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.31,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.2,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.57,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.7,
				},
			},
		],
	},
	{
		id: 15,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 9,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 8,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.34,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.47,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.21,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.6,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.74,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.88,
				},
			},
		],
	},
	{
		id: 16,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 19,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 14,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.42,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.31,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.19,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.88,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.08,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.88,
					y: 0.19,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.88,
					y: 0.31,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.88,
					y: 0.42,
				},
			},
		],
	},
	{
		id: 17,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 16,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 23,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'copperCoin',
				location: {
					x: 0.87,
					y: 0.07,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.28,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.39,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.87,
					y: 0.18,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.18,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.07,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.87,
					y: 0.29,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.87,
					y: 0.4,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.83,
					y: 0.5,
				},
			},
		],
	},
	{
		id: 18,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 14,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 17,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'goldCoin',
				location: {
					x: 0.87,
					y: 0.45,
				},
			},
		],
	},
	{
		id: 19,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 20,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 18,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'goldCoin',
				location: {
					x: 0.89,
					y: 0.4,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.89,
					y: 0.53,
				},
			},
		],
	},
	{
		id: 20,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 21,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 22,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'goldCoin',
				location: {
					x: 0.86,
					y: 0.41,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.86,
					y: 0.53,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.86,
					y: 0.65,
				},
			},
		],
	},
	{
		id: 21,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 22,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 19,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'goldCoin',
				location: {
					x: 0.84,
					y: 0.4,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.88,
					y: 0.52,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.84,
					y: 0.63,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.8,
					y: 0.52,
				},
			},
		],
	},
	{
		id: 22,
		width: 0.9,
		height: 0.35,
		portals: [
			{
				location: {
					x: 0.09,
					y: 0.25,
				},
				destination: {
					roomId: 9,
					x: 0.5,
					y: 0.5,
				},
			},
			{
				location: {
					x: 0.09,
					y: 0.75,
				},
				destination: {
					roomId: 16,
					x: 0.5,
					y: 0.5,
				},
			},
		],
		items: [
			{
				id: 'goldCoin',
				location: {
					x: 0.82,
					y: 0.41,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.68,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.87,
					y: 0.69,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.87,
					y: 0.55,
				},
			},
			{
				id: 'copperCoin',
				location: {
					x: 0.79,
					y: 0.55,
				},
			},
		],
	},
	{
		id: 23,
		level: 3,
		width: 0.9,
		height: 0.8,
		doors: [
			{
				roomId: 24,
				wall: 'n',
				location: 0.2,
			},
		],
		items: [
			{
				id: 'superTreasure',
				location: {
					x: 0.5,
					y: 0.1,
				},
			},
			{
				id: 'flameThrower',
				location: {
					x: 0.87,
					y: 0.75,
				},
			},
			{
				id: 'fireball',
				location: {
					x: 0.79,
					y: 0.86,
				},
			},
		],
	},
	{
		id: 24,
		width: 0.75,
		height: 0.6,
		characters: [
			{
				id: 'voidWraith',
				location: {
					x: 0.18,
					y: 0.22,
				},
			},
			{
				id: 'voidWraith',
				location: {
					x: 0.85,
					y: 0.22,
				},
			},
		],
	},
];
