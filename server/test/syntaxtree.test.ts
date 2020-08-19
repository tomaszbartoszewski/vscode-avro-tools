import * as assert from 'assert';
import {buildTree} from '../src/syntaxtree';
import { TokenInfo, Token } from '../src/parsing';

class TokenContainer {
	tokens: TokenInfo[];
	position: number;

	constructor() {
		this.tokens = [];
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

	getTokens(): TokenInfo[] {
		return this.tokens;
	}
}

describe('Build Tree', () => {
	it('should return empty tree', () => {
		const result = buildTree([]);
		assert.equal(result.children.length, 0);
	});
	it('should return node with only brackets', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens);
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.rightBracket, tokens[1]);
	});
	it('should return node with children', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens);
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.children.length, 1);
		var keyValue = result.children[0];
		assert.equal(keyValue.key, tokens[1]);
		assert.equal(keyValue.colon, tokens[2]);
		assert.equal(keyValue.value, tokens[3]);
		assert.equal(result.rightBracket, tokens[4]);
	});
	it('should return node with two children', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"')
				.addString('"doc"').addColon().addString('"test"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens);
		assert.equal(result.leftBracket, tokens[0]);
		assert.equal(result.children.length, 2);
		var keyValueOne = result.children[0];
		assert.equal(keyValueOne.key, tokens[1]);
		assert.equal(keyValueOne.colon, tokens[2]);
		assert.equal(keyValueOne.value, tokens[3]);
		var keyValueTwo = result.children[1];
		assert.equal(keyValueTwo.key, tokens[4]);
		assert.equal(keyValueTwo.colon, tokens[5]);
		assert.equal(keyValueTwo.value, tokens[6]);
		assert.equal(result.rightBracket, tokens[7]);
	});
	it('should return node without closing bracket', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon().addString('"int"')
			.getTokens();
		const result = buildTree(tokens);
		assert.equal(result.rightBracket, null);
	});
	it('should return node without starting bracket', () => {
		var tokens = new TokenContainer()
			.addString('"type"').addColon().addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens);
		assert.equal(result.leftBracket, null);
	});
	it('should return key without value', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addColon()
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).children[0];
		assert.equal(result.key, tokens[1]);
		assert.equal(result.colon, tokens[2]);
		assert.equal(result.value, null);
	});
	it('should return key without colon', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
				.addString('"type"').addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).children[0];
		assert.equal(result.key, tokens[1]);
		assert.equal(result.colon, null);
		assert.equal(result.value, tokens[2]);
	});
	it('should return key without key', () => {
		var tokens = new TokenContainer()
			.addLeftBracket()
				.addColon().addString('"int"')
			.addRightBracket()
			.getTokens();
		const result = buildTree(tokens).children[0];
		assert.equal(result.key, null);
		assert.equal(result.colon, tokens[1]);
		assert.equal(result.value, tokens[2]);
	});
});