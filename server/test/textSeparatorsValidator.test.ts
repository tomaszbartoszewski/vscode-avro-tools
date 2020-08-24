import * as assert from 'assert';
import { ObjectNode, KeyValuePair, Tree } from '../src/syntaxTree';
import { LeftBracketToken, StringToken, RightBracketToken } from '../src/tokens';
import { TextSeparatorsValidator } from '../src/validation/textSeparatorsValidator'
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';

describe('TextSeparatorsValidator', () => {
	const validator = new TextSeparatorsValidator();
	it('validate returns error when colon is missing', () => {
		const node = new ObjectNode();
		node.setLeftBracket(new LeftBracketToken('{', 0));
		const keyValuePair = new KeyValuePair();
		keyValuePair.setKey(new StringToken('"type"', 1));
		keyValuePair.setValue(new StringToken('"string"', 9));
		node.addAttribute(keyValuePair);
		node.setRightBracket(new RightBracketToken('}', 18))

		const highlights = validator.validate(new Tree(node, []));

		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			1,
			17,
			'Missing ":" between a key and a value'));
	});
});