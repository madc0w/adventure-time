defaultRoomBackground = 'granite stones texture.jpg';
// defaultWallBackground = 'pavers.jpg';
// defaultRoomMusic = 'holy grail theme.mp3';

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
		walls: [],
		doors: [
			{
				// isOneWay: true,
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
				// isOneWay: true,
				roomId: 4,
				wall: 'n',
				location: 0.5,
				key: 'blueKey',
			},
			{
				// isOneWay: true,
				roomId: 5,
				wall: 'e',
				location: 0.5,
			},
		],
		// items: [
		// 	{
		// 		id: 'enchantedSword',
		// 		location: {
		// 			x: 0.9,
		// 			y: 0.9,
		// 		},
		// 	},
		// ],
	},
	{
		id: 1,
		width: 0.9,
		height: 0.6,

		doors: [
			{
				// isOneWay: true,
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
		items: [],
		doors: [],
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
		width: 0.9,
		height: 0.6,
		items: [
			{
				id: 'superTreasure',
				location: {
					x: 0.5,
					y: 0.2,
				},
			},
		],
	},
	{
		id: 5,
		width: 0.96,
		height: 0.96,
		doors: [
			{
				// isOneWay: true,
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
					y: 0.0,
				},
				itemsForSale: [
					'enchantedSword',
					'venomDagger',
					'healingPotion1',
					'electrosmasher',
					'arrow',
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
];
