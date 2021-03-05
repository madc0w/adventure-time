let id = 0;

rooms = [
	{
		id: id++,
		width: 0.7,
		height: 0.9,
		backgroundImage: 'room_01.jpg',
		wallColor: '#3f2f0c',
		doors: [
			{
				roomId: 1,
				wall: 'w',
				location: 0,
			},
			{
				roomId: 2,
				wall: 'e',
				location: 0.2,
			},
			{
				roomId: 3,
				wall: 'n',
				location: 0.4,
			},
			{
				roomId: 4,
				wall: 's',
				location: 0.4,
			}
		]
	}, {
		id: id++,
		width: 0.6,
		height: 0.7,
		backgroundImage: 'room_02.jpg',
		wallColor: '#3f2',
		doors: [
			{
				roomId: 0,
				wall: 'e',
				location: 0.2,
			},
		]
	},
];
