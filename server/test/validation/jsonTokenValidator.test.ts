import * as assert from 'assert';
import tokenize from '../../src/parsing';
import { JsonTokenValidator } from '../../src/validation/jsonTokenValidator';
import { ValidationMessage, ValidationSeverity } from '../../src/validation/validators';

describe('JsonTokenValidator', () => {
	const validator = new JsonTokenValidator();

	function error(start: number, end: number, msg: string): ValidationMessage {
		return new ValidationMessage(ValidationSeverity.Error, start, end, msg);
	}

	function validateText(text: string): ValidationMessage[] {
		const tokens = tokenize(text);
		return validator.validate(tokens);
	}

	it('Does not have matching }', () => {
		const highlights = validateText('{');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(0, 1, 'Closing bracket expected'));
	});

	[
		'{"type": "string"}',
		// '{"type": "record", "name":"test", "fields":[{"type": "string", "name": "a"}]}',
		'"string"'
	].forEach(text => {
		it('Is valid ' + text, () => {
			assert.strictEqual(validateText(text).length, 0);
		})
	});

	it('Attribute name is not a string', () => {
		const highlights = validateText('{false:"a"}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(1, 6, 'String as an attribute key expected'));
	});

	it('Attribute is missing a colon', () => {
		const highlights = validateText('{"a"');

		assert.deepStrictEqual(highlights[0], error(1, 4, 'Colon expected'));
	});

	it('Attribute is missing a value', () => {
		const highlights = validateText('{"a":');

		assert.deepStrictEqual(highlights[0], error(4, 5, 'Value expected'));
	});

	it('Attribute is missing a colon before value', () => {
		const highlights = validateText('{"a" "b"}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(5, 8, 'Colon expected'));
	});
});