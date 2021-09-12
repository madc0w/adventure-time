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

        walls: [
        ],

        doors: [
            {
                // isOneWay: true,
                roomId: 3,
                wall: 's',
                location: 0.2,
                key: 'redKey'
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
                key: 'blueKey'
            },
            {
                // isOneWay: true,
                roomId: 5,
                wall: 'e',
                location: 0.5,
            }
        ],

        items: [
        ]
    }, {
        id: 1,
        width: 0.9,
        height: 0.6,

        doors: [
            {
                // isOneWay: true,
                roomId: 2,
                wall: 's',
                location: 0.2,
            }
        ],

        portals: [
            {
                location: {
                    x: 0.58,
                    y: 0.84
                },
                destination: {
                    roomId: 0,
                    x: 0.86,
                    y: 0.84
                }
            }
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
                height: 0.24,
            }
        ],

        items: [
            {
                id: 'redKey',
                location: {
                    x: 0.89,
                    y: 0.84
                }
            },
        ]
    }, {
        id: 2,
        width: 0.9,
        height: 0.6,
        items: [
        ],
        doors: [
        ],
        portals: [
            {
                location: {
                    x: 0.8,
                    y: 0.5
                },
                destination: {
                    roomId: 1,
                    x: 0.7,
                    y: 0.82
                }
            }
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
                    x: 0.4,
                    y: 0.6
                }
            },
        ]
    },
    {
        id: 4,
        level: 2,
        width: 0.9,
        height: 0.6,
    },
    {
        id: 5,
        width: .96,
        height: .96,
        walls: [
            {
                location: {
                    x: 0.02,
                    y: 0.02,
                },
                ...movingBlock
            },
            {
                location: {
                    x: 0.2,
                    y: 0.02,
                },
                ...movingBlock
            },
            {
                location: {
                    x: 0.02,
                    y: 0.2,
                },
                ...movingBlock
            },
            {
                location: {
                    x: 0.2,
                    y: 0.2,
                },
                ...movingBlock,
                width: 0.24,
            },
        ]
    },
];
