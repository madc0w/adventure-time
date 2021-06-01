
function getValue(object, key) {
	const val = object[key];
	if (typeof val == 'function') {
		return val(state);
	}
	return val;
}
