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
	attributes: KeyValuePair[];
	rightBracket: RightBracketToken | null;

	constructor() {
		this.leftBracket = null;
		this.attributes = [];
		this.rightBracket = null;
	}

	getStartPosition(): number {
		return this.leftBracket?.getStartPosition()
			?? (
				this.attributes.length > 0
					? this.attributes[0].getStartPosition()
					: this.rightBracket?.getStartPosition()
			)
			?? 0;
	}

	getEndPosition(): number {
		return this.rightBracket?.getEndPosition()
		?? (
			this.attributes.length > 0
				? this.attributes[this.attributes.length - 1].getEndPosition()
				: this.leftBracket?.getEndPosition()
		)
		?? 0;
	}

	setLeftBracket(leftBracket: LeftBracketToken) {
		this.leftBracket = leftBracket;
	}

	addAttribute(keyValuePair: KeyValuePair) {
		this.attributes.push(keyValuePair);
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
	items: ArrayItem[];
	rightBracket: RightSquareBracketToken | null;

	constructor() {
		this.leftBracket = null;
		this.items = [];
		this.rightBracket = null;
	}

	getStartPosition(): number {
		return this.leftBracket?.getStartPosition()
			?? (
				this.items.length > 0
					? this.items[0].getStartPosition()
					: this.rightBracket?.getStartPosition()
			)
			?? 0;
	}

	getEndPosition(): number {
		return this.rightBracket?.getEndPosition()
		?? (
			this.items.length > 0
				? this.items[this.items.length - 1].getEndPosition()
				: this.leftBracket?.getEndPosition()
		)
		?? 0;
	}

	setLeftBracket(leftBracket: LeftSquareBracketToken) {
		this.leftBracket = leftBracket;
	}

	addItem(arrayItem: ArrayItem) {
		this.items.push(arrayItem);
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
