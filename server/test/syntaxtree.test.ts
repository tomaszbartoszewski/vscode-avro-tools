import { KeyValuePair, ArrayItem, ObjectNode, ArrayNode } from '../src/syntaxTree';
import { StringToken, ColonToken, Token, CommaToken, LeftBracketToken, RightBracketToken, LeftSquareBracketToken, RightSquareBracketToken } from '../src/tokens';
import * as assert from 'assert';

function keyValuePair(key: StringToken | null, colon: ColonToken | null, value: Token | null, comma: CommaToken | null): KeyValuePair {
	const keyValuePair = new KeyValuePair();
	if (key !== null) {
		keyValuePair.setKey(key);
	}
	if (colon !== null) {
		keyValuePair.setColon(colon);
	}
	if (value !== null) {
		keyValuePair.setValue(value);
	}
	if (comma !== null) {
		keyValuePair.setComma(comma);
	}
	return keyValuePair;
}

function arrayItem(value: Token | null, comma: CommaToken | null): ArrayItem {
	const arrayItem = new ArrayItem();
	if (value !== null) {
		arrayItem.setValue(value);
	}
	if (comma !== null) {
		arrayItem.setComma(comma);
	}
	return arrayItem;
}

function objectNode(leftBracket: LeftBracketToken | null, rightBracket: RightBracketToken | null, ...children: KeyValuePair[]): ObjectNode {
	const objectNode = new ObjectNode();
	if (leftBracket !== null) {
		objectNode.setLeftBracket(leftBracket);
	}
	if (rightBracket !== null) {
		objectNode.setRightBracket(rightBracket);
	}
	children.forEach((keyValuePair) => {
		objectNode.addChild(keyValuePair);
	});
	return objectNode;
}

function arrayNode(leftBracket: LeftSquareBracketToken | null, rightBracket: RightSquareBracketToken | null, ...children: ArrayItem[]): ArrayNode {
	const objectNode = new ArrayNode();
	if (leftBracket !== null) {
		objectNode.setLeftBracket(leftBracket);
	}
	if (rightBracket !== null) {
		objectNode.setRightBracket(rightBracket);
	}
	children.forEach((keyValuePair) => {
		objectNode.addChild(keyValuePair);
	});
	return objectNode;
}

describe('SyntaxTree', () => {
	[
		[keyValuePair(new StringToken('', 2), null, null, null), 2],
		[keyValuePair(null, new ColonToken(':', 3), null, null), 3],
		[keyValuePair(null, null, new StringToken('', 5), null), 5],
		[keyValuePair(null, null, null, new CommaToken(',', 9)), 9],
		[keyValuePair(new StringToken('', 1), new ColonToken(':', 3), new StringToken('', 5), new CommaToken(',', 9)), 1],
		[keyValuePair(null, null, null, null), 0]
	].forEach(([keyValuePair, startPosition]: [KeyValuePair, number]) =>
		it('Get start position for KeyValuePair ' + JSON.stringify(keyValuePair), () => {
			assert.equal(keyValuePair.getStartPosition(), startPosition);
		})
	);

	[
		[keyValuePair(new StringToken('test', 2), null, null, null), 6],
		[keyValuePair(null, new ColonToken(':', 3), null, null), 4],
		[keyValuePair(null, null, new StringToken('test', 5), null), 9],
		[keyValuePair(null, null, null, new CommaToken(',', 9)), 10],
		[keyValuePair(new StringToken('', 1), new ColonToken(':', 3), new StringToken('', 5), new CommaToken(',', 9)), 10],
		[keyValuePair(null, null, null, null), 0]
	].forEach(([keyValuePair, endPosition]: [KeyValuePair, number]) =>
		it('Get end position for KeyValuePair ' + JSON.stringify(keyValuePair), () => {
			assert.equal(keyValuePair.getEndPosition(), endPosition);
		})
	);

	[
		[arrayItem(new StringToken('', 2), null), 2],
		[arrayItem(null, new CommaToken(',', 5)), 5],
		[arrayItem(new StringToken('', 2), new CommaToken(',', 5)), 2],
		[arrayItem(null, null), 0]
	].forEach(([arrayItem, startPosition]: [ArrayItem, number]) => {
		it('Get start position for ArrayItem ' + JSON.stringify(arrayItem), () => {
			assert.equal(arrayItem.getStartPosition(), startPosition);
		})
	});

	[
		[arrayItem(new StringToken('test', 2), null), 6],
		[arrayItem(null, new CommaToken(',', 5)), 6],
		[arrayItem(new StringToken('test', 2), new CommaToken(',', 5)), 6],
		[arrayItem(null, null), 0]
	].forEach(([arrayItem, endPosition]: [ArrayItem, number]) => {
		it('Get end position for ArrayItem ' + JSON.stringify(arrayItem), () => {
			assert.equal(arrayItem.getEndPosition(), endPosition);
		})
	});

	[
		[objectNode(new LeftBracketToken('{', 1), null), 1],
		[objectNode(null, new RightBracketToken('}', 2)), 2],
		[objectNode(null, null, keyValuePair(new StringToken('', 5), null, null, null)), 5],
		[objectNode(null, null, keyValuePair(new StringToken('', 5), null, null, null), keyValuePair(new StringToken('', 10), null, null, null)), 5],
		[objectNode(null, null), 0]
	].forEach(([objectNode, startPosition]: [ObjectNode, number]) => {
		it('Get start position for ObjectNode ' + JSON.stringify(objectNode), () => {
			assert.equal(objectNode.getStartPosition(), startPosition)
		})
	});

	[
		[objectNode(new LeftBracketToken('{', 1), null), 2],
		[objectNode(null, new RightBracketToken('}', 2)), 3],
		[objectNode(null, null, keyValuePair(new StringToken('test', 5), null, null, null)), 9],
		[objectNode(null, null, keyValuePair(new StringToken('', 5), null, null, null), keyValuePair(new StringToken('test', 10), null, null, null)), 14],
		[objectNode(null, null), 0]
	].forEach(([objectNode, endPosition]: [ObjectNode, number]) => {
		it('Get end position for ObjectNode ' + JSON.stringify(objectNode), () => {
			assert.equal(objectNode.getEndPosition(), endPosition)
		})
	});

	[
		[arrayNode(new LeftBracketToken('[', 1), null), 1],
		[arrayNode(null, new RightBracketToken(']', 2)), 2],
		[arrayNode(null, null, arrayItem(new StringToken('', 5), null)), 5],
		[arrayNode(null, null, arrayItem(new StringToken('', 5), null), arrayItem(new StringToken('', 10), null)), 5],
		[arrayNode(null, null), 0]
	].forEach(([arrayNode, startPosition]: [ArrayNode, number]) => {
		it('Get start position for ArrayNode ' + JSON.stringify(objectNode), () => {
			assert.equal(arrayNode.getStartPosition(), startPosition)
		})
	});

	[
		[arrayNode(new LeftBracketToken('[', 1), null), 2],
		[arrayNode(null, new RightBracketToken(']', 2)), 3],
		[arrayNode(null, null, arrayItem(new StringToken('test', 5), null)), 9],
		[arrayNode(null, null, arrayItem(new StringToken('', 5), null), arrayItem(new StringToken('test', 10), null)), 14],
		[arrayNode(null, null), 0]
	].forEach(([arrayNode, endPosition]: [ArrayNode, number]) => {
		it('Get end position for ArrayNode ' + JSON.stringify(objectNode), () => {
			assert.equal(arrayNode.getEndPosition(), endPosition)
		})
	});
});