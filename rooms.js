defaultRoomMusic = 'holy grail theme.mp3';

rooms = [
	{
		id: 0,
		width: 0.8,
		height: 0.9,
		backgroundImage: 'room_01.jpg',
		wallColor: '#3f2f0c',
		doors: [
			{
				roomId: 1,
				wall: 'w',
				location: 0,
			}, {
				roomId: 2,
				wall: 'e',
				location: 0.2,
			}, {
				roomId: 3,
				wall: 'n',
				location: 0.4,
			}, {
				roomId: 4,
				wall: 's',
				location: 0.4,
			}
		],
		items: [
			// {
			// 	id: 'treasure',
			// 	location: {
			// 		x: 0.2,
			// 		y: 0.4
			// 	}
			// },
			// {
			// 	id: 'sword_1',
			// 	location: {
			// 		x: 0.8,
			// 		y: 0.5
			// 	}
			// },
			{
				id: 'venomDagger',
				location: {
					x: 0.7,
					y: 0.8
				}
			},
			{
				id: 'venomDagger',
				location: {
					x: 0.2,
					y: 0.3
				}
			},
		],
		characters: [
			// {
			// 	id: 'zlakik',
			// 	location: {
			// 		x: 0.4,
			// 		y: 0.4
			// 	}
			// },
			// {
			// id: 'doomScreen',
			// location: {
			// 	x: 0.2,
			// 	y: 0.2
			// }
			// 	// }, {
			// 	id: 'doomScreen',
			// 	location: {
			// 		x: 0.6,
			// 		y: 0.2
			// 	}
		]
	}, {
		id: 1,
		width: 0.6,
		height: 0.7,
		backgroundImage: 'room_02.jpg',
		// wallColor: '#3f2',
		doors: [
		],
		characters: [
			{
				id: 'doomScreen',
				location: {
					x: 0.2,
					y: 0.2
				}
				// }, {
				// 	id: 'doomScreen',
				// 	location: {
				// 		x: 0.6,
				// 		y: 0.2
				// 	}
			},
		],
		sounds: {
			// ambient: 'silence.mp3',
			ambient: 'eerie room.mp3',
		}
	}, {
		id: 2,
		width: 0.6,
		height: 0.7,
		backgroundImage: 'outside_01.jpg',
		// wallColor: '#3f2',
		doors: [
		],
		items: [
			{
				id: 'treasure',
				location: {
					x: 0.1,
					y: 0.7
				}
			},
			{
				id: 'treasure',
				location: {
					x: 0.4,
					y: 0.2
				}
			}
		],
		characters: [
			{
				id: 'merchant',
				location: {
					x: 0.5,
					y: 0.0
				},
				itemsForSale: [
					'enchantedSword', 'venomDagger', 'healing_potion_1', 'electrosmasher',
				],
			},
		],
		sounds: {
			enter: 'door open 3.mp3',
			ambient: 'merchant music.mp3',
		}
	}, {
		id: 3,
		width: 0.9,
		height: 0.9,
		backgroundImage: 'room_02.jpg',
		// wallColor: '#3f2',
		doors: [
		],
		characters: [
			{
				id: 'doomScreen',
				location: {
					x: 0.2,
					y: 0.2
				}
			}, {
				id: 'zlakik',
				location: {
					x: 0.4,
					y: 0.4
				}
			},
		],
		items: [
			{
				id: 'healing_potion_1',
				location: {
					x: 0.5,
					y: 0.8
				}
			}, {
				id: 'healing_potion_1',
				location: {
					x: 0.5,
					y: 0.4
				}
			},
		]
	}, {
		id: 4,
		width: 0.6,
		height: 0.7,
		backgroundImage: 'room_02.jpg',
		// wallColor: '#3f2',
		doors: [
			{
				roomId: 5,
				wall: 'e',
				location: 0.2,
			},
		],
		characters: [
			{
				id: 'zlakik',
				location: {
					x: 0.4,
					y: 0.4
				}
			},
		]
	}, {
		id: 5,
		width: 0.6,
		height: 0.7,
		backgroundImage: 'room_02.jpg',
		// wallColor: '#3f2',
		doors: [
			{
				roomId: 6,
				wall: 'e',
				location: 0.5,
				isOneWay: true,
			}
		],
		items: [
			{
				id: 'enchantedSword',
				location: {
					x: 0.4,
					y: 0.5
				}
			}
		]
	}, {
		id: 6,
		width: 1,
		height: 0.2,
		backgroundImage: 'room_02.jpg',
		portals: [
			{
				location: {
					x: 0.8,
					y: 0.5
				},
				roomId: 0
			}
		]
	},
];
