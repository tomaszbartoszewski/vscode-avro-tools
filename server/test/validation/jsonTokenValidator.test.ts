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
		assert.deepStrictEqual(highlights[0], error(0, 1, 'Closing bracket } expected'));
	});

	[
		'{"type": "string"}',
		'{"type": "record", "name":"test", "fields":[{"type": "string", "name": "a"}]}',
		'"string"'
	].forEach(text => {
		it('Is valid ' + text, () => {
			assert.strictEqual(validateText(text).length, 0);
		})
	});

	it('Attribute name is not a string', () => {
		const highlights = validateText('{false:"a"}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(1, 6, 'Attribute key must be double quoted'));
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

	it('Array is missing a closing bracket', () => {
		const highlights = validateText('{"a":[');

		assert.deepStrictEqual(highlights[0], error(5, 6, 'Closing bracket ] expected'));
	});

	it('Object is missing a closing bracket after array', () => {
		const highlights = validateText('{"a":[]');

		assert.deepStrictEqual(highlights[0], error(6, 7, 'Closing bracket } expected'));
	});

	it('Free text token is highlighted', () => {
		const highlights = validateText('{"a": b1 }');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(6, 8, 'Unrecognized value'));
	});

	it('Single quote instead of double quote', () => {
		const highlights = validateText('{\'a\':1}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(1, 4, 'Attribute key must be double quoted'));
	});

	it('Trailing comma when a comma is before a closing bracket', () => {
		const highlights = validateText('{"a":1,}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(6, 7, 'Trailing comma'));
	});

	it('Attribute expected when nothing after a comma', () => {
		const highlights = validateText('{"a":1,');

		assert.deepStrictEqual(highlights[0], error(6, 7, 'Attribute expected'));
	});

	it('Trailing comma when a comma is before an array\'s closing bracket', () => {
		const highlights = validateText('{"a":[1,]}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(7, 8, 'Trailing comma'));
	});

	it('Value expected when nothing after a comma in an array', () => {
		const highlights = validateText('{"a":[1,');

		assert.deepStrictEqual(highlights[0], error(7, 8, 'Value expected'));
	});

	it('Missing comma between attributes', () => {
		const highlights = validateText('{"a":1 "b":2}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(7, 10, 'Expected comma'));
	});

	it('Missing comma between array values', () => {
		const highlights = validateText('{"a":[1 2]}');

		assert.strictEqual(highlights.length, 1);
		assert.deepStrictEqual(highlights[0], error(8, 9, 'Expected comma'));
	});
});