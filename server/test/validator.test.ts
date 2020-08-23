import * as assert from 'assert';
import { KeyValuePair, ArrayNode, Node, Tree } from '../src/syntaxtree';
import { ExpectedAttributesValidator, Validator, ValidationMessage, ValidationSeverity } from '../src/validation/validators'
import { StringToken, Token } from '../src/parsing';

// interface ValidatorInterface {
// 	validate(item: any):  Generator<number, string, boolean>;
// }
// class NameValidator implements ValidatorInterface {
// 	*validate(item: any): Generator<number, string, boolean> {
// 		let i = 0;
// 		while (true) {
// 			if (yield i++) {
// 				break;
// 			}
// 		}
// 		return "done!";
// 	}
// }

// class OtherNameValidator implements ValidatorInterface {
// 	*validate(item: any): Generator<number, string, boolean> {
// 		let i = 1;
// 		while (true) {
// 			if (yield i+=2) {
// 				break;
// 			}
// 		}
// 		return "done!";
// 	}
// }

// function* counter(): Generator<number, string, boolean> {
// 	let i = 0;
// 	while (true) {
// 		if (yield i++) {
// 			break;
// 		}
// 	}
// 	return "done!";
// }

// describe('Validator', () => {
// 	it('should return empty array', () => {
// 		const x: ValidatorInterface = new OtherNameValidator();
// 		var iter = x.validate(null);
// 		// var iter = counter();
// 		var curr = iter.next();
// 		while (!curr.done) {
// 		console.log(curr.value);
// 		curr = iter.next(curr.value === 5);
// 		}
// 		console.log(curr.value.toUpperCase());
// 	});
// });

function nodeWithAttributes(...attributes: KeyValuePair[]): Node {
	const node = new Node();
	attributes.forEach((attribute) => {
		node.addChild(attribute);
	});
	return node;
}

function keyValue(key: StringToken, value: Token | ArrayNode): KeyValuePair {
	const keyValuePair = new KeyValuePair();
	keyValuePair.setKey(key);
	keyValuePair.setValue(value);
	return keyValuePair;
}

describe('AttributeValidator', () => {
	const nodeFieldsValidator: Validator = new ExpectedAttributesValidator();
	// it('types different than node do not return', () => {
	// 	const treeElements: TreeElement[] = [new KeyValuePair(), new ArrayNode(), new ArrayItem()]
	// 	const node = new Node();
	// 	node.addChild()
	// 	// const nodeFieldsValidator: Validator = new NodeFieldsValidator();
	// 	treeElements.forEach((element) => {
	// 		const iter = nodeFieldsValidator.validate(element, false);
	// 		let curr = iter.next();
	// 		assert.equal(curr.done, true);
	// 	});
	// });
	var acceptedTypes = ['"string"', '"int"', '"long"']; // TODO: check if other primitive types can be here
	acceptedTypes.forEach((type) => {
		it('node on highest level with only type is correct', () => {
			const node = nodeWithAttributes(
				keyValue(new StringToken('"type"', 1), new StringToken(type, 8)));
			const tree = new Tree(node, []);
			const highlights = nodeFieldsValidator.validate(tree);
			assert.equal(highlights.length, 0);
		});
	});
	it('top level node requires name', () => {
		const node = nodeWithAttributes(
			keyValue(new StringToken('"type"', 1), new StringToken('"record"', 8)),
			keyValue(new StringToken('"fields"', 20), new ArrayNode())
		);
		const tree = new Tree(node, []);
		const highlights = nodeFieldsValidator.validate(tree);
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			16,
			"Attribute name is missing"));
	});

// 	var needNameTypes = ['"string"', '"int"', '"long"', '"null"', '"boolean"',
// '"float"', '"double"', '"bytes"'
// ]; // TODO: check if other primitive types can be here
// 	acceptedTypes.forEach((type) => {
// 		it('node inside needs name field', () => {
// 			const node = new Node();
// 			const keyValuePair = new KeyValuePair();
// 			keyValuePair.setKey(new TokenInfo(Token.String, '"type"', 1));
// 			keyValuePair.setValue(new TokenInfo(Token.String, type, 8));
// 			node.addChild(keyValuePair);
// 			const iter = nodeFieldsValidator.validate(node, true);
// 			let curr = iter.next();
// 			assert.equal(curr.done, true);
// 		});
// 	});
});
