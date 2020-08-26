import * as assert from 'assert';
import { keyValuePair, nodeWithoutBrackets, validObjectNodeWithType, arrayNodeWithoutBrackets } from './syntaxTreeUtils';
import { StringToken, IntegerToken, CommaToken } from '../src/tokens';
import { NamesAndSymbolsValidator } from '../src/validation/namesAndSymbolsValidator'
import { Tree } from '../src/syntaxTree';
import { ValidationMessage, ValidationSeverity } from '../src/validation/validators';

describe('NamesAndSymbolsValidator', () => {
	const validator = new NamesAndSymbolsValidator();

	['"record"', '"enum"', '"fixed"'].forEach((type) => {
		it('validate incorrect name on type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"name"', 20), null, new StringToken('"11"', 30), null)
			);

			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				30,
				34,
				'Name "11" is not matching a regular expression [A-Za-z_][A-Za-z0-9_]*'));
		});
	});

	[
		['', false],
		['"0Name"', false],
		['"£_Name"', false],
		['"N"', true],
		['"a"', true],
		['"Name_test_12"', true],
		['"something76QWERTY"', true]
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

	it('validate name of nested object', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"record"', 18), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"11"', 30), null)
		);

		const node = validObjectNodeWithType(childNode);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate name of field', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"string"', 18), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"+3"', 30), null)
		);

		const fields = arrayNodeWithoutBrackets(childNode);

		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"name"', 1), null, new StringToken('"Test"', 9), new CommaToken(',', 15)),
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"record"', 29), null),
			keyValuePair(new StringToken('"fields"', 35), null, fields, null),
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	['"record"', '"enum"', '"fixed"'].forEach((type) => {
		it('validate incorrect namespace on type ' + type, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken(type, 10), null),
				keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
				keyValuePair(new StringToken('"namespace"', 38), null, new StringToken('"1234"', 50), null),
			);

			const highlights = validator.validate(new Tree(node, []));
			assert.equal(highlights.length, 1);
			assert.deepEqual(highlights[0], new ValidationMessage(
				ValidationSeverity.Error,
				50,
				56,
				'Namespace "1234" is not matching a regular expression [A-Za-z_][A-Za-z0-9_]*([\\.\\-][A-Za-z_][A-Za-z0-9_]*)*'));
		});
	});

	[
		['', false],
		['"0Name"', false],
		['"£_Name"', false],
		['"Name."', false],
		['".Name"', false],
		['"N"', true],
		['"a"', true],
		['"Name_test_12"', true],
		['"something76QWERTY"', true],
		['"something.name.test"', true],
		['"some-thing-name-test"', true],
	].forEach(([namespace, isValid]: [string, boolean]) => {
		it('validate namespace: ' + namespace + ' expected is valid: ' + isValid, () => {
			const node = nodeWithoutBrackets(
				keyValuePair(new StringToken('"type"', 0), null, new StringToken('"record"', 10), null),
				keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
				keyValuePair(new StringToken('"namespace"', 40), null, new StringToken(namespace, 50), null)
			);

			assert.equal(validator.validate(new Tree(node, [])).length === 0, isValid);
		});
	});

	it('validate namespace of nested object', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"record"', 18), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
			keyValuePair(new StringToken('"namespace"', 40), null, new StringToken('"%%^&"', 55), null)
		);

		const node = validObjectNodeWithType(childNode);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate name of field', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 10), null, new StringToken('"string"', 18), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
			keyValuePair(new StringToken('"namespace"', 40), null, new StringToken('"%%^&"', 55), null)
		);

		const fields = arrayNodeWithoutBrackets(childNode);

		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"name"', 1), null, new StringToken('"Test"', 9), new CommaToken(',', 15)),
			keyValuePair(new StringToken('"type"', 20), null, new StringToken('"record"', 29), null),
			keyValuePair(new StringToken('"fields"', 35), null, fields, null),
		);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate symbols of an enum', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"enum"', 10), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
			keyValuePair(new StringToken('"symbols"', 40), null,
				arrayNodeWithoutBrackets(new StringToken('"Correct"', 50), new StringToken('"#incorrect"', 60)),
				null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
		assert.deepEqual(highlights[0], new ValidationMessage(
			ValidationSeverity.Error,
			60,
			72,
			'Symbol "#incorrect" is not matching a regular expression [A-Za-z_][A-Za-z0-9_]*'));
	});

	it('validate symbols of a nested enum', () => {
		const childNode = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"enum"', 10), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
			keyValuePair(new StringToken('"symbols"', 40), null,
				arrayNodeWithoutBrackets(new StringToken('"Correct"', 50), new StringToken('"#incorrect"', 60)),
				null)
		);

		const node = validObjectNodeWithType(childNode);
		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 1);
	});

	it('validate symbols of an enum all correct', () => {
		const node = nodeWithoutBrackets(
			keyValuePair(new StringToken('"type"', 0), null, new StringToken('"enum"', 10), null),
			keyValuePair(new StringToken('"name"', 20), null, new StringToken('"Test"', 30), null),
			keyValuePair(new StringToken('"symbols"', 40), null,
				arrayNodeWithoutBrackets(new StringToken('"Correct"', 50), new StringToken('"_good"', 60),
					new StringToken('"perfect"', 50), new StringToken('"great1234_test_1"', 60)),
				null)
		);

		const highlights = validator.validate(new Tree(node, []));
		assert.equal(highlights.length, 0);
	});
});