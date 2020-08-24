import * as assert from 'assert';
import { Tree } from '../src/syntaxTree';
import { LeftBracketToken, StringToken, RightBracketToken, ColonToken } from '../src/tokens';
import { TextSeparatorsValidator } from '../src/validation/textSeparatorsValidator'
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';
import { objectNode, keyValuePair } from './syntaxTreeUtils';

describe('TextSeparatorsValidator', () => {
	const validator = new TextSeparatorsValidator();
	it('validate returns error when colon is missing', () => {
		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 18),
			keyValuePair(new StringToken('"type"', 1), null, new StringToken('"string"', 9), null));

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			17,
			'Missing ":" between a key and a value'));
	});

	it('validate returns error when comma is missing when there is another attribute', () => {
		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 18),
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), new StringToken('"string"', 9), null),
			keyValuePair(new StringToken('"name"', 21), new ColonToken(':', 27), new StringToken('"test"', 29), null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			17,
			'Missing "," between attributes'));
	});
});