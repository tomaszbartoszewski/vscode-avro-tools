import { Token, LeftBracketToken, RightBracketToken, StringToken, ColonToken, CommaToken, LeftSquareBracketToken, RightSquareBracketToken, IntegerToken, PrecisionNumberToken, BoolToken, NullToken, FreeTextToken } from './parsing';

export class Tree {
	node: Node;
	outside: Token[];

	constructor(node: Node, outside: Token[]) {
		this.node = node;
		this.outside = outside;
	}
}

export class Node {
	leftBracket: LeftBracketToken | null;
	children: KeyValuePair[];
	rightBracket: RightBracketToken | null;

	constructor() {
		this.leftBracket = null;
		this.children = [];
		this.rightBracket = null;
	}

	setLeftBracket(leftBracket: LeftBracketToken) {
		this.leftBracket = leftBracket;
	}

	addChild(keyValuePair: KeyValuePair) {
		this.children.push(keyValuePair);
	}

	setRightBracket(rightBracket: RightBracketToken) {
		this.rightBracket = rightBracket;
	}
}

export class KeyValuePair {
	key: StringToken | null;
	colon: ColonToken | null;
	value: Token | Node | ArrayNode | null;
	comma: CommaToken | null;

	constructor() {
		this.key = null;
		this.colon = null;
		this.value = null;
		this.comma = null;
	}

	setKey(key: StringToken) {
		this.key = key;
	}

	setColon(colon: ColonToken) {
		this.colon = colon;
	}

	setValue(value: Token | Node | ArrayNode) {
		this.value = value;
	}

	setComma(comma: CommaToken) {
		this.comma = comma;
	}
}

export class ArrayNode {
	leftBracket: LeftSquareBracketToken | null;
	children: ArrayItem[];
	rightBracket: RightSquareBracketToken | null;

	constructor() {
		this.leftBracket = null;
		this.children = [];
		this.rightBracket = null;
	}

	setLeftBracket(leftBracket: LeftSquareBracketToken) {
		this.leftBracket = leftBracket;
	}

	addChild(arrayItem: ArrayItem) {
		this.children.push(arrayItem);
	}

	setRightBracket(rightBracket: RightSquareBracketToken) {
		this.rightBracket = rightBracket;
	}
}

export class ArrayItem {
	value: Token | Node | ArrayNode | null;
	comma: CommaToken | null;

	constructor() {
		this.value = null;
		this.comma = null;
	}

	setValue(value: Token | Node | ArrayNode) {
		this.value = value;
	}

	setComma(comma: CommaToken) {
		this.comma = comma;
	}
}

export function buildTree(tokens: Token[]): Tree {
	if (tokens.length === 0) {
		return new Tree(new Node(), []);
	}

	const [node, move] = getNode(tokens);
	// console.log(move);
	return new Tree(node, tokens.slice(move));
}

function getNode(tokens: Token[]): [Node, number] {
	let position = 0;
	const node = new Node();

	if (tokens[position] instanceof LeftBracketToken) {
		node.setLeftBracket(tokens[position]);
		position++;
	}
	let movedForward = true;
	while (position < tokens.length && movedForward) {
		// console.log('getNode, children loop', tokens.slice(position))
		movedForward = false;
		if (tokens[position] instanceof RightBracketToken) {
			node.setRightBracket(tokens[position]);
			position++;
			break;
		}
		const keyValuePair = new KeyValuePair();
		if (position < tokens.length && tokens[position] instanceof StringToken) {
			keyValuePair.setKey(tokens[position]);
			position++;
			movedForward = true;
		}
		if (position < tokens.length && tokens[position] instanceof ColonToken){
			keyValuePair.setColon(tokens[position]);
			position++;
			movedForward = true;
		}
		// console.log('getNode, entering getValue', tokens.slice(position));
		const [value, move] = getValue(tokens.slice(position))
		if (value !== null) {
			keyValuePair.setValue(value);
			movedForward = true;
		}
		position += move;
		if (position < tokens.length && tokens[position] instanceof CommaToken){
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

function getValue(tokens: Token[], isArray: boolean = false): [Token | Node | ArrayNode | null, number] {
	const position = 0;

	if (isArray && tokens[position] instanceof ColonToken) {
		// console.log('getValue, colon', tokens.slice(position));
		return [tokens[position], 1];
	}
	if (tokens[position] instanceof StringToken || tokens[position] instanceof IntegerToken
		|| tokens[position] instanceof PrecisionNumberToken || tokens[position] instanceof BoolToken
		|| tokens[position] instanceof NullToken || tokens[position] instanceof FreeTextToken) {
		// console.log('getValue, primitives', tokens.slice(position));
		return [tokens[position], 1];
	}
	if (tokens[position] instanceof LeftSquareBracketToken) {
		// console.log('getValue, entering getArray', tokens.slice(position));
		return getArray(tokens);
	}
	if (tokens[position] instanceof LeftBracketToken) {
		// console.log('getValue, entering getNode', tokens.slice(position));
		return getNode(tokens);
	}

	return [null, 0];
}

function getArray(tokens: Token[]): [ArrayNode, number] {
	let position = 0;
	const result = new ArrayNode();
	if (tokens[position] instanceof LeftSquareBracketToken) {
		result.setLeftBracket(tokens[position]);
		position++;
	}
	let movedForward = true;
	while (position < tokens.length && movedForward) {
		movedForward = false;
		// console.log('getArray, items loop', tokens.slice(position));
		if (tokens[position] instanceof RightSquareBracketToken) {
			result.setRightBracket(tokens[position]);
			position++;
			return [result, position];
		}
		const arrayItem = new ArrayItem();
		const [value, move] = getValue(tokens.slice(position), true);
		if (value !== null) {
			arrayItem.setValue(value);
			position += move;
			movedForward = true;
		}
		if (position < tokens.length && tokens[position] instanceof CommaToken){
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