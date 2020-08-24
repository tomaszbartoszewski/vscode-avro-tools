import * as assert from 'assert';
import { tokenize } from '../src/parsing';
import { LeftBracketToken, RightBracketToken, LeftSquareBracketToken, ColonToken, CommaToken, StringToken, RightSquareBracketToken, NullToken, FreeTextToken, IntegerToken, BoolToken, PrecisionNumberToken } from '../src/tokens';

describe('Tokenize', () => {
	it('should return empty array', () => {
		const result = tokenize('');
		assert.equal(result.length, 0);
	});
	it('should return left bracket', () => {
		const result = tokenize('{');
		assert.equal(result[0] instanceof LeftBracketToken, true);
		assert.equal(result[0].value, '{');
	});
	it('should return right bracket', () => {
		const result = tokenize('}');
		assert.equal(result[0] instanceof RightBracketToken, true);
		assert.equal(result[0].value, '}');
	});
	it('should return left square bracket', () => {
		const result = tokenize('[');
		assert.equal(result[0] instanceof LeftSquareBracketToken, true);
		assert.equal(result[0].value, '[');
	});
	it('should return right square bracket', () => {
		const result = tokenize(']');
		assert.equal(result[0] instanceof RightSquareBracketToken, true);
		assert.equal(result[0].value, ']');
	});
	it('should return colon', () => {
		const result = tokenize(':');
		assert.equal(result[0] instanceof ColonToken, true);
		assert.equal(result[0].value, ':');
	});
	it('should return comma', () => {
		const result = tokenize(',');
		assert.equal(result[0] instanceof CommaToken, true);
		assert.equal(result[0].value, ',');
	});
	it('should return string', () => {
		const result = tokenize('"record"');
		assert.equal(result[0] instanceof StringToken, true);
		assert.equal(result[0].value, '"record"');
	});
	it('should return tokenized object', () => {
		const result = tokenize('{"type":"string"}');
		assert.equal(result[0] instanceof LeftBracketToken, true);
		assert.equal(result[1] instanceof StringToken, true);
		assert.equal(result[2] instanceof ColonToken, true);
		assert.equal(result[3] instanceof StringToken, true);
		assert.equal(result[4] instanceof RightBracketToken, true);
		assert.equal(result[1].value, '"type"');
		assert.equal(result[3].value, '"string"');
	});
	it('should return tokenized object ignore space, tab, new line', () => {
		const result = tokenize('{\n\r"type"  :\t  "string"  \n}');
		assert.equal(result[0] instanceof LeftBracketToken, true);
		assert.equal(result[1] instanceof StringToken, true);
		assert.equal(result[2] instanceof ColonToken, true);
		assert.equal(result[3] instanceof StringToken, true);
		assert.equal(result[4] instanceof RightBracketToken, true);
		assert.equal(result[1].value, '"type"');
		assert.equal(result[3].value, '"string"');
	});
	it('should return tokenized record ignore space, tab, new line', () => {
		const document =
			`
		{
			"name": "test_record",
			"type": "record",
			"fields": [
			  {
				"name": "test_field",
				"type": "int"
			  }
			]
		}
		`
		const result = tokenize(document);
		assert.equal(result.length, 23);
	});
	it('should return tokenized array', () => {
		const result = tokenize('["a", "b"]');
		assert.equal(result[0] instanceof LeftSquareBracketToken, true);
		assert.equal(result[1] instanceof StringToken, true);
		assert.equal(result[2] instanceof CommaToken, true);
		assert.equal(result[3] instanceof StringToken, true);
		assert.equal(result[4] instanceof RightSquareBracketToken, true);
		assert.equal(result[1].value, '"a"');
		assert.equal(result[3].value, '"b"');
	});
	it('should return null', () => {
		const nullDocuments = ['null', 'null ', 'null\t', 'null\n', 'null}', 'null]', 'null{', 'null[', 'null,'];
		nullDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result[0] instanceof NullToken, true);
			assert.equal(result[0].value, 'null');
		});
	});
	it('should not return null', () => {
		const notNullDocuments = ['nullnot', 'null12', '"null"'];
		notNullDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result.length, 1);
			assert.notEqual(result[0] instanceof NullToken, true);
		});
	});
	it('should return free text without matching other token', () => {
		const freeText = ['nullnot', 'null12', 'asdnull', '123null', 'asd132', 'asd"qweqe"'];
		freeText.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result.length, 1);
			assert.equal(result[0] instanceof FreeTextToken, true);
			assert.equal(result[0].value, document);
		});
	});
	it('should return free text when containing other matches', () => {
		const result = tokenize('{unknown}');
		assert.equal(result[0] instanceof LeftBracketToken, true);
		assert.equal(result[1] instanceof FreeTextToken, true);
		assert.equal(result[1].value, 'unknown');
		assert.equal(result[2] instanceof RightBracketToken, true);
	});
	it('should return integer', () => {
		const intDocuments = ['124', '-2 ', '0', '-0', '98\t', '1762873\n', '6573}', '-873]', '54{', '70854[', '-67845,'];
		intDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result[0] instanceof IntegerToken, true);
		});
	});
	it('should return integer with correct value', () => {
		const ints = [124, -2, 98, 1762873, 6573, -873, 54, 70854, -67845];
		ints.forEach(function (value) {
			const valueText = value.toString();
			const result = tokenize(valueText);
			assert.equal(result[0] instanceof IntegerToken, true);
			assert.equal(result[0].value, valueText);
		});
	});
	it('should not return integer', () => {
		const result = tokenize('test123');
		assert.equal(result.length, 1);
		assert.equal(result[0] instanceof FreeTextToken, true);
		assert.equal(result[0].value, 'test123');
	});
	it('should return position and length', () => {
		const result = tokenize('unknown\n  test');
		assert.equal(result[0].position, 0);
		assert.equal(result[0].length, 7);
		assert.equal(result[1].position, 10);
		assert.equal(result[1].length, 4);
	});
	it('should return null after other token', () => {
		const nullDocuments = [':   null ', '\tnull', '\nnull', '}null', ']null', '{null', '[null', ',null'];
		nullDocuments.forEach(function (document) {
			const result = tokenize(document);
			const tokenInfo = result[result.length - 1];
			assert.equal(tokenInfo instanceof NullToken, true);
			assert.equal(tokenInfo.value, 'null');
		});
	});
	it('should return string position and length including quotes', () => {
		const result = tokenize('"unknown" "test"');
		assert.equal(result[0].position, 0);
		assert.equal(result[0].length, 9);
		assert.equal(result[1].position, 10);
		assert.equal(result[1].length, 6);
	});
	it('should return commas after integers', () => {
		const tokens = tokenize('{"a": [1,2,3]}');
		assert.equal(tokens[0] instanceof LeftBracketToken, true);
		assert.equal(tokens[1] instanceof StringToken, true);
		assert.equal(tokens[2] instanceof ColonToken, true);

		assert.equal(tokens[3] instanceof LeftSquareBracketToken, true);
		assert.equal(tokens[4] instanceof IntegerToken, true);
		assert.equal(tokens[5] instanceof CommaToken, true);

		assert.equal(tokens[6] instanceof IntegerToken, true);
		assert.equal(tokens[7] instanceof CommaToken, true);
		assert.equal(tokens[8] instanceof IntegerToken, true);

		assert.equal(tokens[9] instanceof RightSquareBracketToken, true);
		assert.equal(tokens[10] instanceof RightBracketToken, true);
	});
	it('should return true', () => {
		const trueDocuments = ['true', 'true ', 'true\t', 'true\n', 'true}', 'true]', 'true{', 'true[', 'true,'];
		trueDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result[0] instanceof BoolToken, true);
			assert.equal(result[0].value, 'true');
		});
	});
	it('should return false', () => {
		const falseDocuments = ['false', 'false ', 'false\t', 'false\n', 'false}', 'false]', 'false{', 'false[', 'false,'];
		falseDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result[0] instanceof BoolToken, true);
			assert.equal(result[0].value, 'false');
		});
	});
	it('should return precision number with correct value', () => {
		const numbers = ['124.12312', '0.1', '0.0', '-0.0', '-2.1', '98.7', '1762873.0', '6573.345', '-873.0', '54.54', '70854.0002', '-67845.345'];
		numbers.forEach(function (value) {
			const result = tokenize(value);
			assert.equal(result[0] instanceof PrecisionNumberToken, true);
			assert.equal(result[0].value, value);
		});
	});
	it('should return free text if numbers start with 0 number with correct value', () => {
		const numbers = ['01.12', '-04.1', '007', '-01'];
		numbers.forEach(function (value) {
			const result = tokenize(value);
			assert.equal(result[0] instanceof FreeTextToken, true);
			assert.equal(result[0].value, value);
		});
	});
	it('should return commas after integers', () => {
		const tokens = tokenize('{"a": null, "c": false}');
		assert.equal(tokens[0] instanceof LeftBracketToken, true);
		assert.equal(tokens[1] instanceof StringToken, true);
		assert.equal(tokens[2] instanceof ColonToken, true);
		assert.equal(tokens[3] instanceof NullToken, true);
		assert.equal(tokens[4] instanceof CommaToken, true);
		assert.equal(tokens[5] instanceof StringToken, true);
		assert.equal(tokens[6] instanceof ColonToken, true);
		assert.equal(tokens[7] instanceof BoolToken, true);
		assert.equal(tokens[8] instanceof RightBracketToken, true);
	});
	it('should return string including colons, spaces, brackets, commas and tabs', () => {
		const text = '"This is		some {example} (*) description. With : \\n , valid [values] https://example.com"';
		const result = tokenize(text);
		assert.equal(result[0] instanceof StringToken, true);
		assert.equal(result[0].value, text);
	});
	it('should return free text if string is on multiple lines', () => {
		const text = '"This\nis\nnot\nallowed"';
		const result = tokenize(text);
		assert.equal(result[0] instanceof FreeTextToken, true);
		assert.equal(result[1] instanceof FreeTextToken, true);
		assert.equal(result[2] instanceof FreeTextToken, true);
		assert.equal(result[3] instanceof FreeTextToken, true);
	});
});