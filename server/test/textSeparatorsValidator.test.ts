import * as assert from 'assert';
import { Tree } from '../src/syntaxTree';
import { LeftBracketToken, StringToken, RightBracketToken, ColonToken, LeftSquareBracketToken, RightSquareBracketToken } from '../src/tokens';
import { TextSeparatorsValidator } from '../src/validation/textSeparatorsValidator'
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';
import { objectNode, keyValuePair, arrayNode, arrayItem } from './syntaxTreeUtils';

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

	it('validate returns error when closing bracket is missing', () => {
		const node = objectNode(
			new LeftBracketToken('{', 0),
			null,
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), new StringToken('"string"', 9), null));

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			0,
			17,
			'Missing closing bracket "}"'));
	});

	it('validate returns error for inside object', () => {
		const childNode = objectNode(
			new LeftBracketToken('{', 9),
			new RightBracketToken('}', 26),
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"type"', 18), null)
		);

		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 30),
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), childNode, null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			10,
			24,
			'Missing ":" between a key and a value'));
	});

	it('validate returns error for inside array item missing comma', () => {
		const childNode = arrayNode(
			new LeftSquareBracketToken('[', 9),
			new RightSquareBracketToken(']', 30),
			arrayItem(new StringToken('null', 10), null),
			arrayItem(new StringToken('"string"', 18), null),
		);

		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 32),
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), childNode, null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			10,
			14,
			'Missing "," between array items'));
	});

	it('validate returns error for inside array missing closing bracket', () => {
		const childNode = arrayNode(
			new LeftSquareBracketToken('[', 9),
			null
		);

		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 32),
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), childNode, null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			9,
			10,
			'Missing closing bracket "]"'));
	});
});