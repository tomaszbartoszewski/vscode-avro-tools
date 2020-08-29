import * as assert from 'assert';
import { KeyValuePair, ArrayNode, ObjectNode, Tree, ArrayItem } from '../src/syntaxTree';
import { Validator, ValidationMessage, ValidationSeverity } from '../src/validation/validators'
import { DefaultValidator } from '../src/validation/defaultValidator'
import { StringToken, Token, LeftBracketToken, RightBracketToken, IntegerToken, NullToken, BoolToken, PrecisionNumberToken } from '../src/tokens';
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

	it('Boolean type can only have default boolean', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"boolean"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('11', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			52,
			'Default value for type "boolean" has to be true or false'));
	});

	it('Boolean type correct default', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"boolean"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new BoolToken('false', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Type int can only have integer number', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"int"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new PrecisionNumberToken('1.0', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			53,
			'Default value for type "int" has to be a 32-bit signed integer'));
	});

	[
		['2147483647', 0],
		['-2147483648', 0],
		['12', 0],
		['-545656', 0],
		['2147483648', 1],
		['-2147483649', 1],
		['2147483647354645', 1],
	].forEach(([value, numberOfErrors]: [string, number]) => {
		it('Type int can only have 32-bit signed integer number value: ' + value + ' number of errors ' + numberOfErrors, () => {
			const node = validRecordWithField(
				keyValuePair(new StringToken('"type"', 20), null, new StringToken('"int"', 30), null),
				keyValuePair(new StringToken('"default"', 40), null, new IntegerToken(value, 50), null)
			);
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Type long can only have integer number', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"long"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new PrecisionNumberToken('1.0', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			53,
			'Default value for type "long" has to be a 64-bit signed integer'));
	});

	it('Long type correct default', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"long"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('12', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Type float can only be a number', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"float"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new StringToken('"x"', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			53,
			'Default value for type "float" has to be a 32-bit single precision floating-point number'));
	});

	it('Float type correct default', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"float"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new PrecisionNumberToken('12.95', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Float type int default is accepted', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"float"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('12', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Type double can only be a number', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"double"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new StringToken('"x"', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			53,
			'Default value for type "double" has to be a 64-bit double precision floating-point number'));
	});

	it('Double type correct default', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"double"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new PrecisionNumberToken('12.95', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Double type int default is accepted', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"double"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('12', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});
});