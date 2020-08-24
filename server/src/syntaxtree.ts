import { Token, LeftBracketToken, RightBracketToken, StringToken, ColonToken, CommaToken, LeftSquareBracketToken, RightSquareBracketToken, IntegerToken, PrecisionNumberToken, BoolToken, NullToken, FreeTextToken } from './tokens';

export class Tree {
	node: ObjectNode;
	outside: Token[];

	constructor(node: ObjectNode, outside: Token[]) {
		this.node = node;
		this.outside = outside;
	}
}

export class ObjectNode {
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
	value: Token | ObjectNode | ArrayNode | null;
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

	setValue(value: Token | ObjectNode | ArrayNode) {
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
	value: Token | ObjectNode | ArrayNode | null;
	comma: CommaToken | null;

	constructor() {
		this.value = null;
		this.comma = null;
	}

	setValue(value: Token | ObjectNode | ArrayNode) {
		this.value = value;
	}

	setComma(comma: CommaToken) {
		this.comma = comma;
	}
}
