defaultRoomBackground = 'granite stones texture.jpg';
// defaultRoomMusic = 'holy grail theme.mp3';


rooms = [
	{
		id: 0,
		level: 1,
		width: 0.9,
		height: 0.9,
		// backgroundImage: 'room_01.jpg',
		wallColor: '#3f2f0c',

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
				id: 'invisibilityPotion',
				location: {
					x: 0.2,
					y: 0.8
				}
			}
		],

		characters: [
			{
				// 	id: 'doomScreen',
				// 	location: {
				// 		x: 0.2,
				// 		y: 0.2
				// 	}
				// }, {
				id: 'zlakik',
				location: {
					x: 0.4,
					y: 0.4
				}
			},
		],

	}
];
