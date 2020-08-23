import * as assert from 'assert';
import { KeyValuePair, ArrayNode, Node, Tree, ArrayItem } from '../src/syntaxtree';
import { ExpectedAttributesValidator, Validator, ValidationMessage, ValidationSeverity } from '../src/validation/validators'
import { StringToken, Token, LeftBracketToken, RightBracketToken } from '../src/parsing';

function nodeWithAttributes(...attributes: KeyValuePair[]): Node {
	const node = new Node();
	attributes.forEach((attribute) => {
		node.addChild(attribute);
	});
	return node;
}

function nodeWithBrackets(leftBracket: LeftBracketToken, rightBracket: RightBracketToken): Node {
	const node = new Node();
	node.setLeftBracket(leftBracket);
	node.setRightBracket(rightBracket);
	return node;
}

function keyValue(key: StringToken, value: Token | ArrayNode | null = null): KeyValuePair {
	const keyValuePair = new KeyValuePair();
	keyValuePair.setKey(key);
	if (value !== null) {
		keyValuePair.setValue(value);
	}
	return keyValuePair;
}

describe('AttributeValidator', () => {
	const nodeFieldsValidator: Validator = new ExpectedAttributesValidator();

	var acceptedTypes = ['"string"', '"int"', '"long"']; // TODO: check if other primitive types can be here
	acceptedTypes.forEach((type) => {
		it('node on highest level with only ' + type + ' type is correct', () => {
			const node = nodeWithAttributes(
				keyValue(new StringToken('"type"', 1), new StringToken(type, 8)));
			const tree = new Tree(node, []);
			const highlights = nodeFieldsValidator.validate(tree);
			assert.equal(highlights.length, 0);
		});
	});

	it('top level node requires "name"', () => {
		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"record"', 8)),
			keyValue(new StringToken('"fields"', 20))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			16,
			'Attribute "name" is missing'));
	});

	it('top level node requires "fields"', () => {
		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"record"', 8)),
			keyValue(new StringToken('"name"', 20))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			16,
			'Attribute "fields" is missing'));
	});

	it('top level node both "name" and "fields" are missing, two errors', () => {
		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"record"', 8))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 2);
	});

	it('top level node is empty, attribute type error', () => {
		const node = nodeWithBrackets(new LeftBracketToken('{', 0), new RightBracketToken('}', 1));
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			0,
			2,
			'Attribute "type" is missing'));
	});

	[['"name"', '"symbols"'], ['"symbols"', '"name"']].forEach(([missing, toSet]) => {
		it('enum requires ' + missing, () => {
			const node = nodeWithAttributes(
				keyValue(new StringToken('"type"', 1), new StringToken('"enum"', 8)),
				keyValue(new StringToken(toSet, 20))
			);
			const tree = new Tree(node, []);
			const highlights = nodeFieldsValidator.validate(tree);
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				1,
				14,
				'Attribute ' + missing + ' is missing'));
		});
	});

	[['"name"', '"size"'], ['"size"', '"name"']].forEach(([missing, toSet]) => {
		it('fixed requires ' + missing, () => {
			const node = nodeWithAttributes(
				keyValue(new StringToken('"type"', 1), new StringToken('"fixed"', 8)),
				keyValue(new StringToken(toSet, 20))
			);
			const tree = new Tree(node, []);
			const highlights = nodeFieldsValidator.validate(tree);
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				1,
				15,
				'Attribute ' + missing + ' is missing'));
		});
	});

	it('array requires "items"', () => {
		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"array"', 8))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			15,
			'Attribute "items" is missing'));
	});
});
