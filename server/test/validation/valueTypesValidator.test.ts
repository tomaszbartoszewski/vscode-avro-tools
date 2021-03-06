import * as assert from 'assert';
import { StringToken, IntegerToken, CommaToken } from '../../src/tokens';
import { Tree } from '../../src/syntaxTree';
import { nodeWithoutBrackets, keyValuePair, arrayNodeWithoutBrackets, validRecordWithField } from '../syntaxTreeUtils';
import { ValidationMessage, ValidationSeverity } from '../../src/validation/validators';
import { ValueTypesValidator } from '../../src/validation/valueTypesValidator';

describe('ValueTypesValidator', () => {
	const validator = new ValueTypesValidator();

	['"record"', '"enum"', '"fixed"'].forEach((type) => {
		it('validate name is a string for type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"name"', 20), null, new IntegerToken('11', 30), null)
			);
	
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				20,
				32,
				'Name has to be a string'));
		});
	});

	['"record"', '"enum"', '"fixed"'].forEach((type) => {
		it('validate namespace is a string for type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"namespace"', 20), null, new IntegerToken('11', 35), null)
			);
	
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				20,
				37,
				'Namespace has to be a string'));
		});
	});

	['"record"', '"enum"', '"fixed"'].forEach((type) => {
		it('validate aliases is an array of strings for type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"aliases"', 20), null, arrayNodeWithoutBrackets(new StringToken('"Correct"', 35), new IntegerToken('11', 45)), null)
			);
	
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				45,
				47,
				'Aliases have to be an array of strings'));
		});
	});

	['"record"', '"enum"', '"fixed"'].forEach((type) => {
		it('validate aliases is an array for type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"aliases"', 20), null, new IntegerToken('11', 45), null)
			);
	
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				20,
				47,
				'Aliases have to be an array of strings'));
		});
	});

	['"record"', '"enum"'].forEach((type) => {
		it('validate doc is a string for type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"doc"', 20), null, new IntegerToken('11', 35), null)
			);
	
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				20,
				37,
				'Doc has to be a string'));
		});
	});

	it('validate fields are an array of objects', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"record"', 10), null),
			keyValuePair(new StringToken('"fields"', 20), null, arrayNodeWithoutBrackets(new IntegerToken('11', 35)), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			35,
			37,
			'Fields have to be an array of JSON objects'));
	});

	it('validate fields are an array', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"record"', 10), null),
			keyValuePair(new StringToken('"fields"', 20), null, new IntegerToken('11', 35), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			20,
			37,
			'Fields have to be an array of JSON objects'));
	});

	it('validate symbols for enum are an array of strings', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"enum"', 10), null),
			keyValuePair(new StringToken('"symbols"', 20), null, arrayNodeWithoutBrackets(new IntegerToken('11', 35)), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			35,
			37,
			'Symbols have to be an array of strings'));
	});

	it('validate symbols for enum are an array', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"enum"', 10), null),
			keyValuePair(new StringToken('"symbols"', 20), null, new IntegerToken('11', 35), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			20,
			37,
			'Symbols have to be an array of strings'));
	});

	it('validate size of fixed is an int', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"fixed"', 10), null),
			keyValuePair(new StringToken('"size"', 20), null, new StringToken('"11"', 30), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			20,
			34,
			'Size has to be an int'));
	});

	it('validate default of enum is a string', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"enum"', 10), null),
			keyValuePair(new StringToken('"default"', 20), null, new IntegerToken('11', 30), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			20,
			32,
			'Default has to be a string'));
	});

	[
		['"array"', '"items"'],
		['"map"', '"values"']
	].forEach(([type, attribute]) => {
		it('validate attribute ' + attribute + ' is a type definition for type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken(attribute, 20), null, new IntegerToken('11', 35), null)
			);

			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				20,
				37,
				'Attribute ' + attribute + ' has to be a string, a JSON object, or a JSON array'));
		});
	});

	it('validate type is a type definition', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new IntegerToken('11', 10), null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			0,
			12,
			'Attribute "type" has to be a string, a JSON object, or a JSON array'));
	});

	it('validate name of field is a string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"name"', 20), null, new IntegerToken('11', 30), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate doc of field is a string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"doc"', 20), null, new IntegerToken('11', 30), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate aliases of field are an array of strings', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"aliases"', 20), null, arrayNodeWithoutBrackets(new StringToken('"Correct"', 35), new IntegerToken('11', 45)), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate order of field is a string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"order"', 20), null, new IntegerToken('11', 30), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			20,
			32,
			'Attribute "order" has to be a string'));
	});
});