
function getValue(object, key) {
	const val = object[key];
	if (typeof val == 'function') {
		return val(state);
	}
	if (isNaN(val)) {
		throw new Error('getValue returns NaN');
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

// source & dest are assumed to be parallel in structure
function assignFunctions(source, dest) {
	for (const key in source) {
		const sourceVal = source[key];
		const destVal = dest[key];
		if (typeof sourceVal == 'function') {
			dest[key] = sourceVal;
		} else if (Array.isArray(sourceVal)) {
			for (let i = 0; i < sourceVal.length; i++) {
				if (sourceVal[i] && destVal && destVal[i] && JSON.stringify(sourceVal[i]) == JSON.stringify(destVal[i])) {
					assignFunctions(sourceVal[i], destVal[i]);
				}
			}
		} else if (destVal && typeof sourceVal == 'object') {
			assignFunctions(sourceVal, destVal);
		}
	}
}

function formatTime(ms) {
	const hours = Math.floor(ms / (1000 * 60 * 60));
	const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
	const secs = Math.floor(ms % (1000 * 60) / 1000);
	return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
