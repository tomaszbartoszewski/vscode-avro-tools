import * as assert from 'assert';
import { KeyValuePair, ArrayNode, ObjectNode, Tree, ArrayItem } from '../src/syntaxTree';
import { Validator, ValidationMessage, ValidationSeverity } from '../src/validation/validators'
import { DefaultValidator } from '../src/validation/defaultValidator'
import { StringToken, Token, LeftBracketToken, RightBracketToken, IntegerToken, NullToken } from '../src/tokens';
import { nodeWithoutBrackets, keyValuePair, arrayNodeWithoutBrackets, validRecordWithField } from './syntaxTreeUtils';

describe('DefaultValidator', () => {
	const validator = new DefaultValidator();

	it('Null type can only have default null', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"null"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('11', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			52,
			'Default value for type "null" has to be a null'));
	});

	it('Null type correct default', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"null"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new NullToken('null', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});
});