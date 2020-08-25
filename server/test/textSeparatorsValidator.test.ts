import * as assert from 'assert';
import { Tree, ObjectNode, ArrayNode } from '../src/syntaxTree';
import { LeftBracketToken, StringToken, RightBracketToken, ColonToken, LeftSquareBracketToken, RightSquareBracketToken, CommaToken } from '../src/tokens';
import { TextSeparatorsValidator } from '../src/validation/textSeparatorsValidator'
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';
import { objectNode, keyValuePair, arrayNode, arrayItem } from './syntaxTreeUtils';

function validObjectNodeWithType(type: ObjectNode | ArrayNode): ObjectNode {
	return objectNode(
		new LeftBracketToken('{', 0),
		new RightBracketToken('}', 1000),
		keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), type, null)
	)
}

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

		const node = validObjectNodeWithType(childNode);

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
			arrayItem(new StringToken('"string"', 18), null)
		);

		const node = validObjectNodeWithType(childNode);

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

		const node = validObjectNodeWithType(childNode);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			9,
			10,
			'Missing closing bracket "]"'));
	});

	[
		objectNode(new LeftBracketToken('{', 0), null),
		arrayNode(new LeftSquareBracketToken('[', 0), null),
	].forEach((insideObject) => {
		it('validate complex items inside array ' + JSON.stringify(insideObject), () => {
			const childNode = arrayNode(
				new LeftSquareBracketToken('[', 9),
				new LeftSquareBracketToken('[', 20),
				arrayItem(insideObject, null)
			);
	
			const node = validObjectNodeWithType(childNode);
	
			const highlights = validator.validate(new Tree(node, []));
	
			assert.equal(highlights.length, 1);
		});
	});

	it('validate with all correct separators', () => {
		const childNode = arrayNode(
			new LeftSquareBracketToken('[', 9),
			new RightSquareBracketToken(']', 30),
			arrayItem(new StringToken('null', 10), new CommaToken(',', 14)),
			arrayItem(new StringToken('"string"', 18), null)
		);

		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 32),
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), childNode, new CommaToken(',', 31)),
			keyValuePair(new StringToken('"name"', 35), new ColonToken(':', 41), new StringToken('"test"', 42), null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 0);
	});

	it('validate returns error for inside array item comma after last item', () => {
		const childNode = arrayNode(
			new LeftSquareBracketToken('[', 9),
			new RightSquareBracketToken(']', 30),
			arrayItem(new StringToken('null', 10), new CommaToken(',', 14)),
			arrayItem(new StringToken('"string"', 18), new CommaToken(',', 26))
		);

		const node = validObjectNodeWithType(childNode);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			26,
			27,
			'Last array item followed by ","'));
	});

	it('validate returns error when colon is missing', () => {
		const node = objectNode(
			new LeftBracketToken('{', 0),
			new RightBracketToken('}', 18),
			keyValuePair(new StringToken('"type"', 1), new ColonToken(':', 7), new StringToken('"string"', 9), new CommaToken(',', 17)));

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			17,
			18,
			'Last attribute followed by ","'));
	});
});