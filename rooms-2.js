defaultRoomBackground = 'granite stones texture.jpg';
defaultWallBackground = 'pavers.jpg';
// defaultRoomMusic = 'holy grail theme.mp3';


rooms = [
    {
        id: 0,
        level: 1,
        width: 0.9,
        height: 0.6,
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
            }, {
                id: 'enchantedSword',
                location: {
                    x: 0.4,
                    y: 0.5
                }
            }, {
                id: 'bow',
                location: {
                    x: 0.8,
                    y: 0.5
                }
            }, {
                id: 'arrow',
                location: {
                    x: 0.8,
                    y: 0.6
                }
            }
        ],

        walls: [
            // {
            // 	// background: '20210613_144502.jpg',
            // 	location: {
            // 		x: 0.3,
            // 		y: 0.24,
            // 	},
            // 	width: 0.24,
            // 	height: 0.14,
            // 	// }, {
            // 	// 	// background: '20210613_144502.jpg',
            // 	// 	location: {
            // 	// 		x: 0.6,
            // 	// 		y: 0.16,
            // 	// 	},
            // 	// 	width: 0.3,
            // 	// 	height: 0.4,
            // }, 
            {
                location: {
                    x: 0.3,
                    y: 0.4,
                },
                width: 0.24,
                height: 0.04,
            }, {
                isMovable: true,
                background: 'rock.png',
                location: {
                    x: 0.4,
                    y: 0.5,
                },
                width: 0.16,
                height: 0.16,
            }
        ],

        characters: [
            // {
            // 	id: 'megabug',
            // 	location: {
            // 		x: 0.1,
            // 		y: 0.4
            // 	}
            // }
            // }, {
            // 	id: 'megabug',
            // 	location: {
            // 		x: 0.4,
            // 		y: 0.4
            // 	}
            // }, {
            // 	id: 'megabug',
            // 	location: {
            // 		x: 0.4,
            // 		y: 0.4
            // 	}
            // }, {
            // 	id: 'megabug',
            // 	location: {
            // 		x: 0.4,
            // 		y: 0.4
            // 	}
            // }, {
            // 	id: 'megabug',
            // 	location: {
            // 		x: 0.4,
            // 		y: 0.4
            // 	}
            // }, {
            // 	id: 'megabug',
            // 	location: {
            // 		x: 0.4,
            // 		y: 0.4
            // 	}
        ],

    }
];
