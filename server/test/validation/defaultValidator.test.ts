import * as assert from 'assert';
import { Tree, KeyValuePair, ObjectNode } from '../../src/syntaxTree';
import { ValidationMessage, ValidationSeverity } from '../../src/validation/validators'
import { DefaultValidator } from '../../src/validation/defaultValidator'
import { StringToken, Token, IntegerToken, NullToken, BoolToken, PrecisionNumberToken } from '../../src/tokens';
import { keyValuePair, arrayNodeWithoutBrackets, validRecordWithField, nodeWithoutBrackets } from '../syntaxTreeUtils';

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
		['2147483647354645', 1]
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

	it('String type can only have default string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('11', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			52,
			'Default value for type "string" has to be a string'));
	});

	it('String type correct default', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new StringToken('"something"', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Bytes type can only have default string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"bytes"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('11', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			52,
			'Default value for type "bytes" has to be a string containing Unicode codes 0-255 in a format \\u00FF\\u0048'));
	});

	[
		['""', 0],
		['"\\u00FF"', 0],
		['"\\u00FF\\u0000"', 0],
		['"\\u00FF\\u0000\\u00AB"', 0],
		['"\\u008A"', 0],
		['"\\u000G"', 1],
		['"\\u00FF\\uFFFF"', 1],
		['"00FF"', 1],
		['"1234"', 1],
		['"\\u00FF2334"', 1]
	].forEach(([value, numberOfErrors]: [string, number]) => {
		it('Bytes type right formatting value ' + value + ' number of errors ' + numberOfErrors, () => {
			const node = validRecordWithField(
				keyValuePair(new StringToken('"type"', 20), null, new StringToken('"bytes"', 30), null),
				keyValuePair(new StringToken('"default"', 40), null, new StringToken(value, 50), null)
			);
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Fixed type can only have default string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"fixed"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('11', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			52,
			'Default value for type "fixed" has to be a string containing Unicode codes 0-255 in a format \\u00FF\\u0048'));
	});

	[
		['""', 0],
		['"\\u00FF"', 0],
		['"\\u00FF\\u0000"', 0],
		['"\\u00FF\\u0000\\u00AB"', 0],
		['"\\u008A"', 0],
		['"\\u000G"', 1],
		['"\\u00FF\\uFFFF"', 1],
		['"00FF"', 1],
		['"1234"', 1],
		['"\\u00FF2334"', 1]
	].forEach(([value, numberOfErrors]: [string, number]) => {
		it('Fixed type right formatting value ' + value + ' number of errors ' + numberOfErrors, () => {
			const node = validRecordWithField(
				keyValuePair(new StringToken('"type"', 20), null, new StringToken('"fixed"', 30), null),
				keyValuePair(new StringToken('"default"', 40), null, new StringToken(value, 50), null)
			);
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Enum type can only have default string', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"enum"', 30), null),
			keyValuePair(new StringToken('"symbols"', 40), null, arrayNodeWithoutBrackets(), null),
			keyValuePair(new StringToken('"default"', 60), null, new IntegerToken('11', 70), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			60,
			72,
			'Default value for type "enum" has to be a string from symbols array'));
	});

	[
		['"ValueA"', 0],
		['"OtherValue"', 0],
		['"Something"', 0],
		['"NotAvailable"', 1],
		['"Wrong"', 1],
		['"Missing Value"', 1]
	].forEach(([value, numberOfErrors]: [string, number]) => {
		it('Enum type correct default value ' + value + ' number of errors ' + numberOfErrors, () => {
			const symbols = arrayNodeWithoutBrackets(
				new StringToken('"ValueA"', 60),
				new StringToken('"OtherValue"', 80),
				new StringToken('"Something"', 100)
			)

			const node = validRecordWithField(
				keyValuePair(new StringToken('"type"', 20), null, new StringToken('"enum"', 30), null),
				keyValuePair(new StringToken('"symbols"', 40), null, symbols, null),
				keyValuePair(new StringToken('"default"', 120), null, new StringToken(value, 140), null)
			);
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Array of strings type can only have default array of elements matching items schema', () => {
		const defaultValues = arrayNodeWithoutBrackets(
			new StringToken('"correct"', 50),
			new IntegerToken('12', 60),
			new StringToken('"other"', 70)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"array"', 10), null),
			keyValuePair(new StringToken('"items"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, defaultValues, null),
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			77,
			'Default value for type "array" is not correct'));
	});

	[
		['"string"', [new StringToken('"correct"', 50)], 0],
		['"int"', [new IntegerToken('11', 50), new IntegerToken('45', 60)], 0],
		['"boolean"', [new BoolToken('false', 50), new BoolToken('true', 60)], 0],
		['"bytes"', [new StringToken('"\\u00FA"', 50), new StringToken('"\\u0011"', 60), new StringToken('"\\u0012\\u0013"', 60)], 0],
		['"bytes"', [new StringToken('"\\u00FA"', 50), new BoolToken('false', 60)], 1],
		['"int"', [new IntegerToken('11', 50), new PrecisionNumberToken('2.4', 60)], 1]
	].forEach(([itemsType, defaults, numberOfErrors]: [string, Token[], number]) => {
		it('Array of ' + itemsType + ' type correct default value ' + JSON.stringify(defaults) + ' number of errors ' + numberOfErrors, () => {
			const defaultValues = arrayNodeWithoutBrackets(
				...defaults
			);

			const node = validRecordWithField(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken('"array"', 10), null),
				keyValuePair(new StringToken('"items"', 20), null, new StringToken(itemsType, 30), null),
				keyValuePair(new StringToken('"default"', 40), null, defaultValues, null),
			);

			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Map of strings type can only have default map of elements matching values schema', () => {
		const defaultValues = nodeWithoutBrackets(
			keyValuePair(new StringToken('"a"', 50), null, new StringToken('"correct"', 55), null),
			keyValuePair(new StringToken('"b"', 70), null, new IntegerToken('11', 75), null),
			keyValuePair(new StringToken('"c"', 90), null, new StringToken('"other"', 95), null)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"map"', 10), null),
			keyValuePair(new StringToken('"values"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, defaultValues, null),
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			102,
			'Default value for type "map" is not correct, it has to have unique string keys and values matching values type'));
	});

	it('Map of strings type can only have default map with unique keys', () => {
		const defaultValues = nodeWithoutBrackets(
			keyValuePair(new StringToken('"a"', 50), null, new StringToken('"correct"', 55), null),
			keyValuePair(new StringToken('"b"', 70), null, new StringToken('"correct"', 75), null),
			keyValuePair(new StringToken('"a"', 90), null, new StringToken('"other"', 95), null)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"map"', 10), null),
			keyValuePair(new StringToken('"values"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, defaultValues, null),
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			102,
			'Default value for type "map" is not correct, it has to have unique string keys and values matching values type'));
	});

	[
		[
			'"string"',
			[
				keyValuePair(new StringToken('"a"', 50), null, new StringToken('"correct"', 55), null)
			],
			0
		],
		[
			'"int"',
			[
				keyValuePair(new StringToken('"a"', 50), null, new IntegerToken('11', 55), null),
				keyValuePair(new StringToken('"b"', 60), null, new IntegerToken('45', 65), null)
			],
			0
		],
		[
			'"boolean"',
			[
				keyValuePair(new StringToken('"a"', 50), null, new BoolToken('false', 55), null),
				keyValuePair(new StringToken('"b"', 70), null, new BoolToken('true', 75), null)
			],
			0
		],
		[
			'"bytes"',
			[
				keyValuePair(new StringToken('"a"', 50), null, new StringToken('"\\u00FA"', 55), null),
				keyValuePair(new StringToken('"b"', 70), null, new StringToken('"\\u0011"', 75), null),
				keyValuePair(new StringToken('"c"', 90), null, new StringToken('"\\u0012\\u0013"', 95), null)
			],
			0
		],
		[
			'"bytes"',
			[
				keyValuePair(new StringToken('"a"', 50), null, new StringToken('"\\u00FA"', 55), null),
				keyValuePair(new StringToken('"b"', 70), null, new BoolToken('false', 75), null)
			],
			1
		],
		[
			'"int"',
			[
				keyValuePair(new StringToken('"a"', 50), null, new IntegerToken('11', 55), null),
				keyValuePair(new StringToken('"b"', 70), null, new PrecisionNumberToken('2.4', 75), null)
			],
			1
		]
	].forEach(([itemsType, defaults, numberOfErrors]: [string, KeyValuePair[], number]) => {
		it('Map of ' + itemsType + ' type correct default value ' + JSON.stringify(defaults) + ' number of errors ' + numberOfErrors, () => {
			const defaultValues = nodeWithoutBrackets(
				...defaults
			);

			const node = validRecordWithField(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken('"map"', 10), null),
				keyValuePair(new StringToken('"values"', 20), null, new StringToken(itemsType, 30), null),
				keyValuePair(new StringToken('"default"', 40), null, defaultValues, null),
			);

			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Record type can only have default JSON object', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"record"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new IntegerToken('11', 50), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			52,
			'Default value for type "record" has to be a JSON object'));
	});

	it('Record type correct default type', () => {
		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"record"', 30), null),
			keyValuePair(new StringToken('"default"', 40), null, new ObjectNode(), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Union type can only have default of first type', () => {
		const types = arrayNodeWithoutBrackets(
			new StringToken('"null"', 30),
			new StringToken('"int"', 40)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, types, null),
			keyValuePair(new StringToken('"default"', 50), null, new IntegerToken('11', 60), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			50,
			62,
			'Default value for union type has to match first type from the union'));
	});

	it('Union type correct default', () => {
		const types = arrayNodeWithoutBrackets(
			new StringToken('"null"', 30),
			new StringToken('"int"', 40),
			new StringToken('"string"', 50),
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, types, null),
			keyValuePair(new StringToken('"default"', 60), null, new NullToken('null', 70), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});

	it('Union type first type is record', () => {
		const types = arrayNodeWithoutBrackets(
			nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 30), null, new StringToken('"record"', 40), null),
			),
			new StringToken('"null"', 50)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, types, null),
			keyValuePair(new StringToken('"default"', 60), null, new NullToken('null', 70), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			60,
			74,
			'Default value for union type has to match first type from the union'));
	});

	it('Union type first type is enum', () => {
		const symbols = arrayNodeWithoutBrackets(
			new StringToken('"ValueA"', 60),
			new StringToken('"OtherValue"', 80),
			new StringToken('"Something"', 100)
		)

		const types = arrayNodeWithoutBrackets(
			nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 30), null, new StringToken('"enum"', 40), null),
				keyValuePair(new StringToken('"symbols"', 40), null, symbols, null)
			),
			new StringToken('"null"', 50)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, types, null),
			keyValuePair(new StringToken('"default"', 120), null, new NullToken('null', 130), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			120,
			134,
			'Default value for union type has to match first type from the union'));
	});

	it('Enum type default inside inline type', () => {
		const symbols = arrayNodeWithoutBrackets(
			new StringToken('"ValueA"', 60),
			new StringToken('"OtherValue"', 80),
			new StringToken('"Something"', 100)
		)

		const type = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"enum"', 30), null),
			keyValuePair(new StringToken('"symbols"', 40), null, symbols, null),
			keyValuePair(new StringToken('"default"', 120), null, new StringToken('"Wrong"', 130), null)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, type, null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			120,
			137,
			'Default value for type "enum" has to be a string from symbols array'));
	});

	it('Enum type default outside inline type', () => {
		const symbols = arrayNodeWithoutBrackets(
			new StringToken('"ValueA"', 60),
			new StringToken('"OtherValue"', 80),
			new StringToken('"Something"', 100)
		)

		const type = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"enum"', 30), null),
			keyValuePair(new StringToken('"symbols"', 40), null, symbols, null)
		);

		const node = validRecordWithField(
			keyValuePair(new StringToken('"type"', 20), null, type, null),
			keyValuePair(new StringToken('"default"', 120), null, new StringToken('"Wrong"', 130), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			120,
			137,
			'Default value for type "enum" has to be a string from symbols array'));
	});
});