export default function (funcName) {
	switch (funcName) {
		case 'sine':
			return Math.sin;
		case 'square':
			return function (t) {
				return t == 0 ? 0 : (Math.sin(t) > 0) ? 1 : -1
			};
		case 'sawtooth':
			return function (t) {
				return t > 0 ? 2 * (t % 1) - 1 : 2 * (t % 1) + 1;
			};
		case 'triangle':
			return function (t) {
				return t > 0 ? 4 * Math.abs(t % 1 - 0.5) - 1 : 4 * Math.abs(t % 1 + 0.5) - 1;
			};
		default:
			return Math.sin;
	}
};