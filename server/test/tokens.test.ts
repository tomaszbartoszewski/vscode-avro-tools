import { StringToken } from '../src/tokens';
import * as assert from 'assert';

describe('Tokens', () => {
	it('Get start position returns position', () => {
		const expected = 5;
		const token = new StringToken('"type"', expected);
		assert.equal(expected, token.getStartPosition());
	});

	it('Get end position returns position plus value length', () => {
		const token = new StringToken('"type"', 5);
		assert.equal(11, token.getEndPosition());
	});
});