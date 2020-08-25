import * as assert from 'assert';
import { Tree } from '../src/syntaxTree';
import { StringToken, LeftSquareBracketToken } from '../src/tokens';
import { AttributeDuplicatesValidator } from '../src/validation/attributeDuplicatesValidator'
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';
import { objectNode, keyValuePair, arrayNode, arrayItem, validObjectNodeWithType } from './syntaxTreeUtils';

describe('AttributeDuplicatesValidator', () => {
	const validator = new AttributeDuplicatesValidator();
	it('validate returns error when type is defined twice', () => {
		const node = objectNode(
			null,
			null,
			keyValuePair(new StringToken('"type"', 1), null, new StringToken('"string"', 9), null),
			keyValuePair(new StringToken('"type"', 18), null, new StringToken('"int"', 25), null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			18,
			30,
			'Attribute "type" already exists'));
	});

	it('validate returns error for inside object', () => {
		const childNode = objectNode(
			null,
			null,
			keyValuePair(new StringToken('"name"', 10), null, new StringToken('"test"', 18), null),
			keyValuePair(new StringToken('"name"', 26), null, new StringToken('"no"', 33), null)
		);

		const node = validObjectNodeWithType(childNode);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			26,
			37,
			'Attribute "name" already exists'));
	});

	it('validate returns error for object inside array', () => {
		const insideObject = objectNode(
			null,
			null,
			keyValuePair(new StringToken('"name"', 10), null, new StringToken('"test"', 18), null),
			keyValuePair(new StringToken('"name"', 26), null, new StringToken('"no"', 33), null)
		);
		
		const childNode = arrayNode(
			new LeftSquareBracketToken('[', 9),
			new LeftSquareBracketToken('[', 20),
			arrayItem(insideObject, null)
		);

		const node = validObjectNodeWithType(childNode);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			26,
			37,
			'Attribute "name" already exists'));
	});

	it('validate returns error when type is defined three times', () => {
		const node = objectNode(
			null,
			null,
			keyValuePair(new StringToken('"type"', 1), null, new StringToken('"string"', 9), null),
			keyValuePair(new StringToken('"type"', 18), null, new StringToken('"int"', 25), null),
			keyValuePair(new StringToken('"type"', 30), null, new StringToken('"long"', 37), null)
		);

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 2);
	});
});