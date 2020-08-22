import * as assert from 'assert';
import {buildTree, ArrayNode, ArrayItem, Node} from '../src/syntaxtree';
import { TokenInfo, Token } from '../src/parsing';

class TokenContainer {
	tokens: TokenInfo[];
	position: number;

	constructor() {
		this.tokens = [];
		this.position = 0;
	}

	addLeftBracket(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.LeftBracket, '{', this.position))
		this.position++;
		return this;
	}

	addRightBracket(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.RightBracket, '}', this.position))
		this.position++;
		return this;
	}

	addColon(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.Colon, ':', this.position))
		this.position++;
		return this;
	}

	addString(value: string): TokenContainer {
		this.tokens.push(new TokenInfo(Token.String, value, this.position))
		this.position += value.length;
		return this;
	}

	addInteger(value: string): TokenContainer {
		this.tokens.push(new TokenInfo(Token.Integer, value, this.position))
		this.position += value.length;
		return this;
	}

	addPrecisionNumber(value: string): TokenContainer {
		this.tokens.push(new TokenInfo(Token.PrecisionNumber, value, this.position))
		this.position += value.length;
		return this;
	}

	addBool(value: boolean): TokenContainer {
		const text = (value) ? 'true' : 'false';
		this.tokens.push(new TokenInfo(Token.Bool, text, this.position))
		this.position += text.length;
		return this;
	}

	addNull(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.Null, 'null', this.position))
		this.position += 4;
		return this;
	}

	addComma(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.Comma, ',', this.position))
		this.position++;
		return this;
	}

	addLeftSquareBracket(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.LeftSquareBracket, '[', this.position))
		this.position++;
		return this;
	}

	addRightSquareBracket(): TokenContainer {
		this.tokens.push(new TokenInfo(Token.RightSquareBracket, ']', this.position))
		this.position++;
		return this;
	}

	addFreeText(value: string): TokenContainer {
		this.tokens.push(new TokenInfo(Token.FreeText, value, this.position))
		this.position += value.length;
		return this;
	}

	getTokens(): TokenInfo[] {
		return this.tokens;
	}
}

describe('Build Tree', () => {
	it('should return empty tree', () => {
		const result = buildTree([]).node;
		assert.equal(result.children.length, 0);
	});
	it('should return node with only brackets', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.rightBracket, tokens[1]);
	});
	it('should return node with children', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.children.length, 1);
		const keyValue = result.children[0];
		assert.equal(keyValue.key, tokens[1]);
		assert.equal(keyValue.colon, tokens[2]);
		assert.equal(keyValue.value, tokens[3]);
		assert.equal(result.rightBracket, tokens[4]);
	});
	it('should return node with two children', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"')
				.addString('"doc"').addColon().addString('"test"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.children.length, 2);
		const keyValueOne = result.children[0];
		assert.equal(keyValueOne.key, tokens[1]);
		assert.equal(keyValueOne.colon, tokens[2]);
		assert.equal(keyValueOne.value, tokens[3]);
		const keyValueTwo = result.children[1];
		assert.equal(keyValueTwo.key, tokens[4]);
		assert.equal(keyValueTwo.colon, tokens[5]);
		assert.equal(keyValueTwo.value, tokens[6]);
		assert.equal(result.rightBracket, tokens[7]);
	});
	it('should return node without closing bracket', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"')
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.rightBracket, null);
	});
	it('should return node without starting bracket', () => {
		const tokens = new TokenContainer()
			.addString('"type"').addColon().addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.leftBracket, null);
	});
	it('should return child without value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.key, tokens[1]);
		assert.equal(result.colon, tokens[2]);
		assert.equal(result.value, null);
	});
	it('should return child without colon', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.key, tokens[1]);
		assert.equal(result.colon, null);
		assert.equal(result.value, tokens[2]);
	});
	it('should return child without key', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addColon().addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.key, null);
		assert.equal(result.colon, tokens[1]);
		assert.equal(result.value, tokens[2]);
	});
	it('should return two children separated by comma', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"').addComma()
				.addString('"doc"').addColon().addString('"test"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 2);
		const keyValueOne = result.children[0];
		assert.equal(keyValueOne.key, tokens[1]);
		assert.equal(keyValueOne.colon, tokens[2]);
		assert.equal(keyValueOne.value, tokens[3]);
		assert.equal(keyValueOne.comma, tokens[4]);
		const keyValueTwo = result.children[1];
		assert.equal(keyValueTwo.key, tokens[5]);
		assert.equal(keyValueTwo.colon, tokens[6]);
		assert.equal(keyValueTwo.value, tokens[7]);
		assert.equal(keyValueTwo.comma, null);
	});
	it('should return three children with comma', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addComma()
				.addComma()
				.addComma()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 3);
		assert.equal(result.children[0].comma, tokens[1]);
		assert.equal(result.children[1].comma, tokens[2]);
		assert.equal(result.children[2].comma, tokens[3]);
	});
	it('should return child with array value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addLeftSquareBracket()
					.addString('"null"').addComma()
					.addString('"int"')
				.addRightSquareBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.children.length, 1);
		const keyValue = result.children[0];
		assert.equal(keyValue.key, tokens[1]);
		assert.equal(keyValue.colon, tokens[2]);
		const array = keyValue.value as ArrayNode;
		assert.equal(array.leftBracket, tokens[3]);
		assert.equal(array.children.length, 2);
		let arrayItem = array.children[0] as ArrayItem;
		assert.equal(arrayItem.value, tokens[4]);
		assert.equal(arrayItem.comma, tokens[5]);
		arrayItem = array.children[1] as ArrayItem;
		assert.equal(arrayItem.value, tokens[6]);
		assert.equal(array.rightBracket, tokens[7]);
		assert.equal(keyValue.comma, null);
		assert.equal(result.rightBracket, tokens[8]);
	});
	it('should return node inside a node', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addLeftBracket()
					.addString('"type"').addColon().addString('"int"')
				.addRightBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 1);
		const innerNode = result.children[0].value as Node;
		assert.equal(innerNode.leftBracket, tokens[3]);
		assert.equal(innerNode.children.length, 1);
		const keyValue = innerNode.children[0];
		assert.equal(keyValue.key, tokens[4]);
		assert.equal(keyValue.colon, tokens[5]);
		assert.equal(keyValue.value, tokens[6]);
		assert.equal(innerNode.rightBracket, tokens[7]);
	});
	it('should return node inside an array', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addLeftSquareBracket()
					.addLeftBracket()
						.addString('"name"').addColon().addString('"Test"')
					.addRightBracket()
				.addRightSquareBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 1);
		const arrayNode = result.children[0].value as ArrayNode;
		assert.equal(arrayNode.children.length, 1);
		assert.equal(arrayNode.children[0].value instanceof Node, true);
	});
	it('should return node inside an array, missing record closing bracket', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addLeftSquareBracket()
					.addLeftBracket()
						.addString('"name"').addColon().addString('"Test"')
				.addRightSquareBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 1);
		const arrayNode = result.children[0].value as ArrayNode;
		assert.equal(arrayNode.children.length, 1);
		assert.equal(arrayNode.children[0].value instanceof Node, true);
	});
	it('should return an array inside an array', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addLeftSquareBracket()
					.addLeftSquareBracket()
						.addString('"name"')
					.addRightSquareBracket()
				.addRightSquareBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 1);
		const arrayNode = result.children[0].value as ArrayNode;
		assert.equal(arrayNode.children.length, 1);
		assert.equal(arrayNode.children[0].value instanceof ArrayNode, true);
	});
	it('should return integer value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"default"').addColon().addInteger('123')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.value, tokens[3]);
	});
	it('should return precision number value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"default"').addColon().addPrecisionNumber('123.45')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.value, tokens[3]);
	});
	it('should return null value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"default"').addColon().addNull()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.value, tokens[3]);
	});
	it('should return bool value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"default"').addColon().addBool(true)
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.value, tokens[3]);
	});
	it('should return after last matching closed bracket everything is in outside node', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
			.addRightBracket()
			.addLeftBracket()
			.addString('key')
			.getTokens();
		const result = buildTree(tokens).outside;
		assert.deepEqual(result, [tokens[2], tokens[3]]);
	});
	it('should return colon inside an array', () => {
		 // inside array colon should be added, so it doesn't mess up further validation
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addLeftSquareBracket()
					.addColon()
				.addRightSquareBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node;
		assert.equal(result.children.length, 1);
		const arrayNode = result.children[0].value as ArrayNode;
		assert.equal(arrayNode.children.length, 1);
		assert.equal(arrayNode.children[0].value, tokens[4]);
	});
	it('should return free text value', () => {
		const tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"default"').addColon().addFreeText('wrong')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).node.children[0];
		assert.equal(result.value, tokens[3]);
	});
});