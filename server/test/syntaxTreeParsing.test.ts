import * as assert from 'assert';
import {tokenize} from '../src/parsing';
import {Token} from '../src/tokens';
import {ArrayNode, ArrayItem, ObjectNode, KeyValuePair} from '../src/syntaxTree';
import {buildTree} from '../src/buildSyntaxTree'

function countTokensInNode(node: any): number {
	if (node === null) {
		return 0;
	}

	if (node instanceof Token) {
		return 1;
	}
	else if (node instanceof ArrayNode) {
		let count = 0;
		if (node.leftBracket !== null) {
			count++;
		}
		if (node.rightBracket !== null) {
			count++;
		}
		node.items.forEach(function(n) {
			count += countTokensInNode(n);
		});
		return count;
	}
	else if (node instanceof ArrayItem) {
		let count = countTokensInNode(node.value);
		if (node.comma !== null) {
			count++;
		}
		return count;
	}
	else if (node instanceof ObjectNode) {
		let count = 0;
		if (node.leftBracket !== null) {
			count++;
		}
		if (node.rightBracket !== null) {
			count++;
		}
		node.attributes.forEach(function(n) {
			count += countTokensInNode(n);
		});
		return count;
	}
	else if (node instanceof KeyValuePair) {
		let count = countTokensInNode(node.value);
		if (node.key !== null) {
			count++;
		}
		if (node.colon !== null) {
			count++;
		}
		if (node.comma !== null) {
			count++;
		}
		return count;
	}
}

describe('Run tokenize and buildTree together', () => {
	it('Check number of tokens in a tree', () => {
		const textNumberOfTokens: [string, number, number][] = [
			['{\n\r"type"  :\t  "string"  \n}', 5, 0],
			['{"a": {"b"}}', 7, 0],
			['{"a": {"b": [1,2,3]}}', 15, 0],
			['{"a": {"b": [1,2,3', 12, 0],
			['{"a": {"b": [1,2,3], "c": "asd"}}', 19, 0],
			['{"a": 4, "c": "asd"}', 9, 0],
			['{"a": null, "c": false, "d": -123.43, "e": true}', 17, 0],
			['{"a": 4, "c": "asd"}}', 9, 1],
			['{"a": ["b": 0]}', 9, 0],
		];

		textNumberOfTokens.forEach(function(tn) {
			const [text, numberOfTokens, outside] = tn;
			const tokens = tokenize(text);
			assert.equal(tokens.length, numberOfTokens + outside);
			const tree = buildTree(tokens);
			assert.equal(countTokensInNode(tree.node), numberOfTokens);
			assert.equal(tree.outside.length, outside);
		});
	});
});