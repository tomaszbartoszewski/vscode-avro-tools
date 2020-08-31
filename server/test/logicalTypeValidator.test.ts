import * as assert from 'assert';
import { Tree } from '../src/syntaxTree';
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators'
import { LogicalTypeValidator } from '../src/validation/logicalTypeValidator'
import { StringToken, IntegerToken } from '../src/tokens';
import { keyValuePair, nodeWithoutBrackets } from './syntaxTreeUtils';

describe('LogicalTypeValidator', () => {
	const validator = new LogicalTypeValidator();

	it('Logical type has to be a string', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"logicalType"', 10), null, new IntegerToken('12', 30), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			10,
			32,
			'Logical type attribute has to be a string'));
	});

	it('Validate type is matching logical type, check error for decimal', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"logicalType"', 40), null, new StringToken('"decimal"', 60), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			69,
			'Logical type "decimal" requires type "bytes" or "fixed"'));
	});

	it('Validate type is matching logical type, check error for date', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"string"', 30), null),
			keyValuePair(new StringToken('"logicalType"', 40), null, new StringToken('"date"', 60), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			40,
			66,
			'Logical type "date" requires type "int"'));
	});

	[
		['"decimal"', '"int"', 1],
		['"decimal"', '"bytes"', 0],
		['"decimal"', '"fixed"', 0],
		['"uuid"', '"boolean"', 1],
		['"uuid"', '"string"', 0],
		['"date"', '"boolean"', 1],
		['"date"', '"int"', 0],
		['"time-millis"', '"boolean"', 1],
		['"time-millis"', '"int"', 0],
		['"time-micros"', '"int"', 1],
		['"time-micros"', '"long"', 0],
		['"timestamp-millis"', '"int"', 1],
		['"timestamp-millis"', '"long"', 0],
		['"timestamp-micros"', '"int"', 1],
		['"timestamp-micros"', '"long"', 0],
		['"local-timestamp-millis"', '"int"', 1],
		['"local-timestamp-millis"', '"long"', 0],
		['"local-timestamp-micros"', '"int"', 1],
		['"local-timestamp-micros"', '"long"', 0],
		['"duration"', '"bytes"', 1],
		['"duration"', '"fixed"', 0]
	].forEach(([logicalType, type, numberOfErrors]: [string, string, number]) => {
		it('Logical type ' + logicalType + ' is matching type ' + type + ' number of errors ' + numberOfErrors, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 20), null, new StringToken(type, 30), null),
				keyValuePair(new StringToken('"logicalType"', 40), null, new StringToken(logicalType, 60), null)
			);
			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, numberOfErrors);
		});
	});

	it('Logical type unknown', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"logicalType"', 10), null, new StringToken('"wrong"', 30), null)
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			10,
			37,
			'Logical type "wrong" is unknown'));
	});
});