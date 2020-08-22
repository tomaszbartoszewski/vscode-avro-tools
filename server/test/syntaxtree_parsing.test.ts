import * as assert from 'assert';
import {tokenize, TokenInfo} from '../src/parsing';
import {buildTree, ArrayNode, ArrayItem, Node, KeyValuePair, Tree} from '../src/syntaxtree';

function countTokensInNode(node: any): number {
	if (node === null) {
		return 0;
	}

	if (node instanceof TokenInfo) {
		return 1;
	}
	else if (node instanceof ArrayNode) {
		var count = 0;
		if (node.leftBracket !== null) {
			count++;
		}
		if (node.rightBracket !== null) {
			count++;
		}
		node.children.forEach(function(n) {
			count += countTokensInNode(n);
		});
		return count;
	}
	else if (node instanceof ArrayItem) {
		var count = countTokensInNode(node.value);
		if (node.comma !== null) {
			count++;
		}
		return count;
	}
	else if (node instanceof Node) {
		var count = 0;
		if (node.leftBracket !== null) {
			count++;
		}
		if (node.rightBracket !== null) {
			count++;
		}
		node.children.forEach(function(n) {
			count += countTokensInNode(n);
		});
		return count;
	}
	else if (node instanceof KeyValuePair) {
		var count = countTokensInNode(node.value);
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
	else if (node instanceof Tree) {
		return countTokensInNode(node.node) + node.outside.length
	}

}

describe('Run tokenize and buildTree together', () => {
	it('Check number of tokens in a tree', () => {
		const textNumberOfTokens: [string, number][] = [
			['{\n\r"type"  :\t  "string"  \n}', 5],
			['{"a": {"b"}}', 7],
			['{"a": {"b": [1,2,3]}}', 15],
			['{"a": {"b": [1,2,3', 12],
			['{"a": {"b": [1,2,3], "c": "asd"}}', 19],
			['{"a": 4, "c": "asd"}', 9],
			['{"a": null, "c": false, "d": -123.43, "e": true}', 17],
			// ['{"a": 4, "c": "asd"}}', 10],
		];

		textNumberOfTokens.forEach(function(tn) {
			var [text, numberOfTokens] = tn;
			const tokens = tokenize(text);
			assert.equal(tokens.length, numberOfTokens);
			const tree = buildTree(tokens);
			assert.equal(countTokensInNode(tree), numberOfTokens);
		});
	});
});