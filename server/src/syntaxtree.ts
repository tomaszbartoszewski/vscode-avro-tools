import { TokenInfo, Token } from './parsing';

class Node {
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

class KeyValuePair {
	key: TokenInfo | null;
	colon: TokenInfo | null;
	value: TokenInfo | Node | null;
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

	setValue(value: TokenInfo | Node) {
		this.value = value;
	}

	setComma(value: TokenInfo) {
		this.comma = value;
	}
}

export function buildTree(tokens: TokenInfo[]): Node {
	if (tokens.length === 0) {
		return new Node();
	}

	var [node, _] = getNode(tokens);

	return node;
}

function getNode(tokens: TokenInfo[]): [Node, number] {
	var position = 0;
	var node = new Node();

	if (tokens[position].token === Token.LeftBracket) {
		node.setLeftBracket(tokens[position]);
		position++;
	}

	while (position < tokens.length) {
		if (tokens[position].token === Token.RightBracket) {
			node.setRightBracket(tokens[position]);
			break;
		}
		var keyValuePair = new KeyValuePair();
		if (position < tokens.length && tokens[position].token === Token.String) {
			keyValuePair.setKey(tokens[position]);
			position++;
		}
		if (position < tokens.length && tokens[position].token === Token.Colon){
			keyValuePair.setColon(tokens[position]);
			position++;
		}
		var [value, move] = getValue(tokens.slice(position))
		if (value !== null) {
			keyValuePair.setValue(value);
		}
		position += move;
		if (position < tokens.length && tokens[position].token === Token.Comma){
			// console.log(tokens.slice(position))
			keyValuePair.setComma(tokens[position]);
			position++;
		}
		node.addChild(keyValuePair);
	}
	return [node, position];
}

function getValue(tokens: TokenInfo[]): [TokenInfo | Node | null, number] {
	// console.log(tokens);
	if ([Token.String, Token.Integer].includes(tokens[0].token)) {
		return [tokens[0], 1];
	}
	return [null, 0];
}

export default buildTree;