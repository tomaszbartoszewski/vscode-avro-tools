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
	value: TokenInfo | Node | null;
	comma: TokenInfo | null;

	constructor() {
		this.value = null;
		this.comma = null;
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
	// console.log(tokens);
	var position = 0;
	var result: TokenInfo | Node | ArrayNode | null = null;
	if ([Token.String, Token.Integer].includes(tokens[0].token)) {
		return [tokens[0], 1];
	}
	else if (tokens[0].token === Token.LeftSquareBracket) {
		result = new ArrayNode();
		result.setLeftBracket(tokens[position]);
		position++;
		var movedForward = true;
		while (position < tokens.length && movedForward) {
			movedForward = false;
			console.log("getValue, array loop", tokens.slice(position));
			if (tokens[position].token === Token.RightSquareBracket) {
				result.setRightBracket(tokens[position]);
				position++;
				return [result, position];
			}
			var arrayItem = new ArrayItem();
			if (position < tokens.length && tokens[position].token !== Token.Comma) {
				arrayItem.setValue(tokens[position]);
				position++;
				movedForward = true;
			}
			if (position < tokens.length && tokens[position].token === Token.Comma){
				arrayItem.setComma(tokens[position]);
				position++;
				movedForward = true;
			}
			// var [value, move] = getValue(tokens.slice(position))
			// if (value !== null) {
			// 	keyValuePair.setValue(value);
			// 	movedForward = true;
			// }
			// position += move;
			if (movedForward) {
				result.addChild(arrayItem);
			}
		}
	}

	return [result, position];
}

export default buildTree;