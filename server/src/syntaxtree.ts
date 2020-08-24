import { Token, LeftBracketToken, RightBracketToken, StringToken, ColonToken, CommaToken, LeftSquareBracketToken, RightSquareBracketToken, IntegerToken, PrecisionNumberToken, BoolToken, NullToken, FreeTextToken } from './tokens';
import { HighlightRange } from './highlightsRange';

export class Tree {
	node: ObjectNode;
	outside: Token[];

	constructor(node: ObjectNode, outside: Token[]) {
		this.node = node;
		this.outside = outside;
	}
}

export class ObjectNode implements HighlightRange {
	leftBracket: LeftBracketToken | null;
	children: KeyValuePair[];
	rightBracket: RightBracketToken | null;

	constructor() {
		this.leftBracket = null;
		this.children = [];
		this.rightBracket = null;
	}

	getStartPosition(): number {
		return this.leftBracket?.getStartPosition()
			?? (
				this.children.length > 0
					? this.children[0].getStartPosition()
					: this.rightBracket?.getStartPosition()
			)
			?? 0;
	}

	getEndPosition(): number {
		return this.rightBracket?.getEndPosition()
		?? (
			this.children.length > 0
				? this.children[this.children.length - 1].getEndPosition()
				: this.leftBracket?.getEndPosition()
		)
		?? 0;
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

export class KeyValuePair implements HighlightRange {
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

	getStartPosition(): number {
		return this.key?.getStartPosition()
			?? this.colon?.getStartPosition()
			?? this.value?.getStartPosition()
			?? this.comma?.getStartPosition()
			?? 0;
	}

	getEndPosition(): number {
		return this.comma?.getEndPosition()
			?? this.value?.getEndPosition()
			?? this.colon?.getEndPosition()
			?? this.key?.getEndPosition()
			?? 0;
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

export class ArrayNode implements HighlightRange {
	leftBracket: LeftSquareBracketToken | null;
	children: ArrayItem[];
	rightBracket: RightSquareBracketToken | null;

	constructor() {
		this.leftBracket = null;
		this.children = [];
		this.rightBracket = null;
	}

	getStartPosition(): number {
		return this.leftBracket?.getStartPosition()
			?? (
				this.children.length > 0
					? this.children[0].getStartPosition()
					: this.rightBracket?.getStartPosition()
			)
			?? 0;
	}

	getEndPosition(): number {
		return this.rightBracket?.getEndPosition()
		?? (
			this.children.length > 0
				? this.children[this.children.length - 1].getEndPosition()
				: this.leftBracket?.getEndPosition()
		)
		?? 0;
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

export class ArrayItem implements HighlightRange {
	value: Token | ObjectNode | ArrayNode | null;
	comma: CommaToken | null;

	constructor() {
		this.value = null;
		this.comma = null;
	}

	getStartPosition(): number {
		return this.value?.getStartPosition()
			?? this.comma?.getStartPosition()
			?? 0;
	}

	getEndPosition(): number {
		return this.comma?.getEndPosition()
			?? this.value?.getEndPosition()
			?? 0;
	}

	setValue(value: Token | ObjectNode | ArrayNode) {
		this.value = value;
	}

	setComma(comma: CommaToken) {
		this.comma = comma;
	}
}
