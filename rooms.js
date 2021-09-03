defaultRoomBackground = 'granite stones texture.jpg';
defaultWallBackground = 'pavers.jpg';
// defaultRoomMusic = 'holy grail theme.mp3';

rooms = [
    {
        id: 0,
        level: 1,
        width: 0.9,
        height: 0.6,

        walls: [
            {
                location: {
                    x: 0.76,
                    y: 0.7,
                },
                width: 0.24,
                height: 0.04,
            },
            {
                location: {
                    x: 0.76,
                    y: 0.7,
                },
                width: 0.04,
                height: 0.16,
            }
        ],

        doors: [
            {
                // isOneWay: true,
                roomId: 1,
                wall: 's',
                location: 0.2,
            },
            {
                // isOneWay: true,
                roomId: 2,
                wall: 'e',
                location: 0.74,
            },
            {
                // isOneWay: true,
                roomId: 3,
                wall: 'n',
                location: 0.5,
                key: 'blueKey'
            }
        ],

        items: [
            {
                id: 'blueKey',
                location: {
                    x: 0.89,
                    y: 0.84
                }
            }

        ]
    }, {
        id: 1,
        width: 0.9,
        height: 0.6,

        portals: [
            {
                location: {
                    x: 0.8,
                    y: 0.5
                },
                destination: {
                    roomId: 0,
                    x: 0.86,
                    y: 0.84
                }
            }
        ],
        items: [
        ]
    }, {
        id: 2,
        width: 0.9,
        height: 0.6,
        items: [
        ],
        doors: [
            // {
            //     isOneWay: true,
            //     roomId: 0,
            //     wall: 'w',
            //     location: 0.2,
            // },
        ],
        portals: [
            {
                location: {
                    x: 0.8,
                    y: 0.5
                },
                destination: {
                    roomId: 0,
                    x: 0.5,
                    y: 0.5
                }
            }
        ],
    },
    {
        id: 3,
        width: 0.9,
        height: 0.6,
    }
];
