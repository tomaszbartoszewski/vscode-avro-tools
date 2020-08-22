import { TokenInfo, Token } from './parsing';

export class Tree {
	node: Node;
	outside: TokenInfo[];

	constructor(node: Node, outside: TokenInfo[]) {
		this.node = node;
		this.outside = outside;
	}
}

export class Node {
	leftBracket: TokenInfo | null;
	children: KeyValuePair[];
	rightBracket: TokenInfo | null;

	constructor() {
		this.leftBracket = null;
		this.children = [];
		this.rightBracket = null;
	}

	setLeftBracket(leftBracket: TokenInfo) {
		this.leftBracket = leftBracket;
	}

	addChild(keyValuePair: KeyValuePair) {
		this.children.push(keyValuePair);
	}

	setRightBracket(rightBracket: TokenInfo) {
		this.rightBracket = rightBracket;
	}
}

export class KeyValuePair {
	key: TokenInfo | null;
	colon: TokenInfo | null;
	value: TokenInfo | Node | ArrayNode | null;
	comma: TokenInfo | null;

	constructor() {
		this.key = null;
		this.colon = null;
		this.value = null;
		this.comma = null;
	}

	setKey(key: TokenInfo) {
		this.key = key;
	}

	setColon(colon: TokenInfo) {
		this.colon = colon;
	}

	setValue(value: TokenInfo | Node | ArrayNode) {
		this.value = value;
	}

	setComma(value: TokenInfo) {
		this.comma = value;
	}
}

export class ArrayNode {
	leftBracket: TokenInfo | null;
	children: ArrayItem[];
	rightBracket: TokenInfo | null;

	constructor() {
		this.leftBracket = null;
		this.children = [];
		this.rightBracket = null;
	}

	setLeftBracket(leftBracket: TokenInfo) {
		this.leftBracket = leftBracket;
	}

	addChild(arrayItem: ArrayItem) {
		this.children.push(arrayItem);
	}

	setRightBracket(rightBracket: TokenInfo) {
		this.rightBracket = rightBracket;
	}
}

export class ArrayItem {
	value: TokenInfo | Node | ArrayNode | null;
	comma: TokenInfo | null;

	constructor() {
		this.value = null;
		this.comma = null;
	}

	setValue(value: TokenInfo | Node | ArrayNode) {
		this.value = value;
	}

	setComma(value: TokenInfo) {
		this.comma = value;
	}
}

export function buildTree(tokens: TokenInfo[]): Tree {
	if (tokens.length === 0) {
		return new Tree(new Node(), []);
	}

	var [node, move] = getNode(tokens);
	// console.log(move);
	return new Tree(node, tokens.slice(move));
}

function getNode(tokens: TokenInfo[]): [Node, number] {
	var position = 0;
	var node = new Node();

	if (tokens[position].token === Token.LeftBracket) {
		node.setLeftBracket(tokens[position]);
		position++;
	}
	var movedForward = true;
	while (position < tokens.length && movedForward) {
		console.log("getNode, children loop", tokens.slice(position))
		movedForward = false;
		if (tokens[position].token === Token.RightBracket) {
			node.setRightBracket(tokens[position]);
			position++;
			break;
		}
		var keyValuePair = new KeyValuePair();
		if (position < tokens.length && tokens[position].token === Token.String) {
			keyValuePair.setKey(tokens[position]);
			position++;
			movedForward = true;
		}
		if (position < tokens.length && tokens[position].token === Token.Colon){
			keyValuePair.setColon(tokens[position]);
			position++;
			movedForward = true;
		}
		console.log("getNode, entering getValue", tokens.slice(position));
		var [value, move] = getValue(tokens.slice(position))
		if (value !== null) {
			keyValuePair.setValue(value);
			movedForward = true;
		}
		position += move;
		if (position < tokens.length && tokens[position].token === Token.Comma){
			// console.log(tokens.slice(position))
			keyValuePair.setComma(tokens[position]);
			position++;
			movedForward = true;
		}
		if (movedForward) {
			node.addChild(keyValuePair);
		}
	}
	return [node, position];
}

function getValue(tokens: TokenInfo[]): [TokenInfo | Node | ArrayNode | null, number] {
	var position = 0;
	if ([Token.String, Token.Integer, Token.PrecisionNumber, Token.Bool, Token.Null].includes(tokens[position].token)) {
		return [tokens[position], 1];
	}
	else if (tokens[position].token === Token.LeftSquareBracket) {
		console.log("getValue, entering getArray", tokens.slice(position));
		return getArray(tokens);
	}
	else if (tokens[position].token === Token.LeftBracket) {
		console.log("getValue, entering getNode", tokens.slice(position));
		return getNode(tokens);
	}

	return [null, 0];
}

function getArray(tokens: TokenInfo[]): [ArrayNode, number] {
	var position = 0;
	var result = new ArrayNode();
	if (tokens[position].token === Token.LeftSquareBracket) {
		result.setLeftBracket(tokens[position]);
		position++;
	}
	var movedForward = true;
	while (position < tokens.length && movedForward) {
		movedForward = false;
		console.log("getArray, items loop", tokens.slice(position));
		if (tokens[position].token === Token.RightSquareBracket) {
			result.setRightBracket(tokens[position]);
			position++;
			return [result, position];
		}
		var arrayItem = new ArrayItem();
		var [value, move] = getValue(tokens.slice(position));
		if (value !== null) {
			arrayItem.setValue(value);
			position += move;
			movedForward = true;
		}
		if (position < tokens.length && tokens[position].token === Token.Comma){
			arrayItem.setComma(tokens[position]);
			position++;
			movedForward = true;
		}
		if (movedForward) {
			result.addChild(arrayItem);
		}
	}
	return [result, position];
}

export default buildTree;