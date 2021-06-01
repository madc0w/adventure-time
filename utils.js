
function getValue(object, key) {
	const val = object[key];
	if (typeof val == 'function') {
		return val(state);
	}
	return val;
}

// return distnace as proportion of canvas size
function distance(roomCharacter) {
	const x1 = roomCharacter.location.x * getValue(state.room, 'width');
	const y1 = roomCharacter.location.y * getValue(state.room, 'height');
	const x2 = state.player.x * getValue(state.room, 'width');
	const y2 = state.player.y * getValue(state.room, 'height');
	const dx = x1 - x2;
	const dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}
