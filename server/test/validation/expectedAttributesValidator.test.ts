import * as assert from 'assert';
import { KeyValuePair, ArrayNode, ObjectNode, Tree, ArrayItem } from '../../src/syntaxTree';
import { Validator, ValidationMessage, ValidationSeverity } from '../../src/validation/validators'
import { ExpectedAttributesValidator } from '../../src/validation/expectedAttributesValidator'
import { StringToken, Token, LeftBracketToken, RightBracketToken } from '../../src/tokens';

function nodeWithAttributes(...attributes: KeyValuePair[]): ObjectNode {
	const node = new ObjectNode();
	attributes.forEach((attribute) => {
		node.addAttribute(attribute);
	});
	return node;
}

function nodeWithBrackets(leftBracket: LeftBracketToken, rightBracket: RightBracketToken): ObjectNode {
	const node = new ObjectNode();
	node.setLeftBracket(leftBracket);
	node.setRightBracket(rightBracket);
	return node;
}

function arrayNodeWithValues(...values: (Token|ObjectNode)[]): ArrayNode {
	const arrayNode = new ArrayNode();
	values.forEach((attribute) => {
		const arrayItem = new ArrayItem();
		arrayItem.setValue(attribute);
		arrayNode.addItem(arrayItem);
	});
	return arrayNode;
}

function keyValue(key: StringToken, value: Token | ObjectNode | ArrayNode | null = null): KeyValuePair {
	const keyValuePair = new KeyValuePair();
	keyValuePair.setKey(key);
	if (value !== null) {
		keyValuePair.setValue(value);
	}
	return keyValuePair;
}

describe('ExpectedAttributesValidator', () => {
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

	it('map requires "values"', () => {
		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"map"', 8))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			13,
			'Attribute "values" is missing'));
	});

	it('validate record nested fields', () => {
		const childNode = nodeWithAttributes(
			keyValue(new StringToken('"type"', 40), new StringToken('"record"', 48)),
			keyValue(new StringToken('"name"', 50)),
		);

		const children = arrayNodeWithValues(childNode);

		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"record"', 8)),
			keyValue(new StringToken('"name"', 20)),
			keyValue(new StringToken('"fields"', 30), children),

		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			56,
			'Attribute "fields" is missing'));
	});

	const fieldTypes: [StringToken | ObjectNode, string][] = [
		[new StringToken('"string"', 51), '"string"'],
		[nodeWithAttributes(
			keyValue(new StringToken('"type"', 51), new StringToken('"string"', 58))
		), '{"type": "string"}']];
	fieldTypes.forEach(([typeValue, description]) => {
		it('validate name on a field with type ' + description, () => {
			const childNode = nodeWithBrackets(new LeftBracketToken('{', 42), new RightBracketToken('}', 60));
			childNode.addAttribute(keyValue(new StringToken('"type"', 43), typeValue))

			const children = arrayNodeWithValues(childNode);

			const node = nodeWithAttributes(
				keyValue(new StringToken('"type"', 1), new StringToken('"record"', 8)),
				keyValue(new StringToken('"name"', 20)),
				keyValue(new StringToken('"fields"', 30), children),
			);
			const tree = new Tree(node, []);
			const highlights = nodeFieldsValidator.validate(tree);
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				42,
				61,
				'Attribute "name" is missing'));
		});
	});

	it('type defined inline validate inside', () => {
		const typeNode = nodeWithAttributes(
			keyValue(new StringToken('"type"', 43), new StringToken('"array"', 51)))

		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), typeNode),
			keyValue(new StringToken('"name"', 20))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			43,
			58,
			'Attribute "items" is missing'));
	});

	[['"array"', '"items"'], ['"map"', '"values"']].forEach(([type, attribute]) => {
		it('validate ' + type + ' complex ' + attribute, () => {
			const typeNode = nodeWithAttributes(
				keyValue(new StringToken('"type"', 43), new StringToken('"record"', 51)),
				keyValue(new StringToken('"name"', 63), new StringToken('"record"', 71))
				);

			const node = nodeWithAttributes(
				keyValue(new StringToken('"type"', 1), new StringToken(type, 8)),
				keyValue(new StringToken(attribute, 20), typeNode)
			);
			const tree = new Tree(node, []);
			const highlights = nodeFieldsValidator.validate(tree);
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				43,
				59,
				'Attribute "fields" is missing'));
		});
	});

	it('validate complex type inside a union', () => {
		const typeNode = nodeWithAttributes(
			keyValue(new StringToken('"type"', 53), new StringToken('"array"', 61)))

		const types = arrayNodeWithValues(new StringToken('null', 43), typeNode);

		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), types),
			keyValue(new StringToken('"name"', 80))
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			53,
			68,
			'Attribute "items" is missing'));
	});
});
