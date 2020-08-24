import { StringToken, ColonToken, Token, CommaToken, LeftBracketToken, RightBracketToken, LeftSquareBracketToken, RightSquareBracketToken } from '../src/tokens';
import { KeyValuePair, ArrayItem, ObjectNode, ArrayNode } from '../src/syntaxTree';

export function keyValuePair(key: StringToken | null, colon: ColonToken | null, value: Token | ObjectNode | ArrayNode | null, comma: CommaToken | null): KeyValuePair {
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

export function arrayItem(value: Token | ObjectNode | ArrayNode | null, comma: CommaToken | null): ArrayItem {
	const arrayItem = new ArrayItem();
	if (value !== null) {
		arrayItem.setValue(value);
	}
	if (comma !== null) {
		arrayItem.setComma(comma);
	}
	return arrayItem;
}

export function objectNode(leftBracket: LeftBracketToken | null, rightBracket: RightBracketToken | null, ...children: KeyValuePair[]): ObjectNode {
	const objectNode = new ObjectNode();
	if (leftBracket !== null) {
		objectNode.setLeftBracket(leftBracket);
	}
	if (rightBracket !== null) {
		objectNode.setRightBracket(rightBracket);
	}
	children.forEach((keyValuePair) => {
		objectNode.addAttribute(keyValuePair);
	});
	return objectNode;
}

export function arrayNode(leftBracket: LeftSquareBracketToken | null, rightBracket: RightSquareBracketToken | null, ...children: ArrayItem[]): ArrayNode {
	const objectNode = new ArrayNode();
	if (leftBracket !== null) {
		objectNode.setLeftBracket(leftBracket);
	}
	if (rightBracket !== null) {
		objectNode.setRightBracket(rightBracket);
	}
	children.forEach((keyValuePair) => {
		objectNode.addItem(keyValuePair);
	});
	return objectNode;
}