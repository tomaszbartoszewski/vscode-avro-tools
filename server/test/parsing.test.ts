import * as assert from 'assert';
import {tokenize, Token} from '../src/parsing';

describe('Tokenize', () => {
	it('should return empty array', () => {
		const result = tokenize('');
		assert.equal(result.length, 0);
	});
	it('should return left bracket', () => {
		const result = tokenize('{');
		assert.equal(result[0].token, Token.LeftBracket);
	});
	it('should return right bracket', () => {
		const result = tokenize('}');
		assert.equal(result[0].token, Token.RightBracket);
	});
	it('should return left square bracket', () => {
		const result = tokenize('[');
		assert.equal(result[0].token, Token.LeftSquareBracket);
	});
	it('should return right square bracket', () => {
		const result = tokenize(']');
		assert.equal(result[0].token, Token.RightSquareBracket);
	});
	it('should return colon', () => {
		const result = tokenize(':');
		assert.equal(result[0].token, Token.Colon);
	});
	it('should return comma', () => {
		const result = tokenize(',');
		assert.equal(result[0].token, Token.Comma);
	});
	it('should return string', () => {
		const result = tokenize('"record"');
		assert.equal(result[0].token, Token.String);
		assert.equal(result[0].value, "record");
	});
	it('should return tokenized object', () => {
		const result = tokenize('{"type":"string"}');
		let tokens = result.map(({token}) => token);
		assert.deepEqual(tokens, [Token.LeftBracket, Token.String, Token.Colon, Token.String, Token.RightBracket]);
		assert.equal(result[1].value, "type");
		assert.equal(result[3].value, "string");
	});
	it('should return tokenized object ignore space, tab, new line', () => {
		const result = tokenize('{\n\r"type"  :\t  "string"  \n}');
		let tokens = result.map(({token}) => token);
		assert.deepEqual(tokens, [Token.LeftBracket, Token.String, Token.Colon, Token.String, Token.RightBracket]);
		assert.equal(result[1].value, "type");
		assert.equal(result[3].value, "string");
	});
	it('should return tokenized record ignore space, tab, new line', () => {
		let document =
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
		let tokens = result.map(({token}) => token);
		assert.deepEqual(tokens, [Token.LeftSquareBracket, Token.String, Token.Comma, Token.String, Token.RightSquareBracket]);
		assert.equal(result[1].value, "a");
		assert.equal(result[3].value, "b");
	});
	it('should return null', () => {
		let nullDocuments = ['null', 'null ', 'null\t', 'null\n', 'null}', 'null]', 'null{', 'null[', 'null,'];
		nullDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result[0].token, Token.Null);
		});
	});
	it('should not return null', () => {
		let notNullDocuments = ['nullnot', 'null12', '"null"'];
		notNullDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.notEqual(result[0].token, Token.Null);
		});
	});
	it('should return free text', () => {
		const result = tokenize('{unknown}');
		assert.equal(result[0].token, Token.LeftBracket);
		assert.equal(result[1].token, Token.FreeText);
		assert.equal(result[1].value, "unknown");
		assert.equal(result[2].token, Token.RightBracket);
	});
	it('should return integer', () => {
		let intDocuments = ['124', '-2 ', '98\t', '1762873\n', '6573}', '-873]', '54{', '70854[', '-67845,'];
		intDocuments.forEach(function (document) {
			const result = tokenize(document);
			assert.equal(result[0].token, Token.Integer);
		});
	});
	it('should return integer with correct value', () => {
		let ints = [124, -2, 98, 1762873, 6573, -873, 54, 70854, -67845];
		ints.forEach(function (value) {
			let valueText = value.toString();
			const result = tokenize(valueText);
			assert.equal(result[0].token, Token.Integer);
			assert.equal(result[0].value, valueText);
		});
	});
});