import * as assert from 'assert';
import { keyValuePair, nodeWithoutBrackets, validObjectNodeWithType, objectNode, arrayNodeWithoutBrackets, arrayItem } from './syntaxTreeUtils';
import { StringToken, IntegerToken, ColonToken, CommaToken } from '../src/tokens';
import { NamesAndSymbolsValidator } from '../src/validation/namesAndSymbolsValidator'
import { Tree } from '../src/syntaxTree';
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';

describe('NamesAndSymbolsValidator', () => {
	const validator = new NamesAndSymbolsValidator();

	it('validate incorrect name', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"record"', 10), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"11"', 30), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			30,
			34,
			'Name "11" is not matching a regular expression ^[A-Za-z_][A-Za-z0-9_]*$'));
	});

	[
		['', false],
		['0Name', false],
		['£_Name', false],
		['N', true],
		['a', true],
		['Name_test_12', true],
		['something76QWERTY', true]
	].forEach(([name, isValid]: [string, boolean]) => {
		it('validate name: ' + name + ' expected is valid: ' + isValid, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken('"record"', 10), null),
				keyValuePair(new StringToken('"name"', 20), null, new StringToken(name, 30), null)
			);

			assert.equal(validator.validate(new Tree(node, [])).length === 0, isValid);
		});
	});

	it('validate name doesn\'t highlight incorrect name type', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"record"', 10), null),
			keyValuePair(new StringToken('"name"', 20), null, new IntegerToken('11', 30), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it ('validate name of nested object', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"record"', 18), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"11"', 30), null)
		);

		const node = validObjectNodeWithType(childNode);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it ('validate name of field', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"string"', 18), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"+3"', 30), null)
		);

		const fields = arrayNodeWithoutBrackets(childNode);

		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"name"', 1), new ColonToken(':', 7), new StringToken('"Test"', 9), new CommaToken(',', 15)),
			keyValuePair(new StringToken('"type"', 20), new ColonToken(':', 27), new StringToken('"record"', 29), null),
			keyValuePair(new StringToken('"fields"', 35), new ColonToken(':', 43), fields, null),
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});
});