import * as assert from 'assert';
import { AVSCFormatter } from '../src/formatting/avscFormatter'

describe('AVSCFormatter', () => {
	const formatter = new AVSCFormatter();

	[
		['{}', '{}'],
		['{"type": "string"}', '{\n    "type": "string"\n}'],
		['{"type": "record","name":"Test"}', '{\n    "type": "record",\n    "name": "Test"\n}'],
		['{"type": "record","name":"Test",]}', '{"type": "record","name":"Test",]}'],
		['{"type": "record","fields":["Test","Other"]}', '{\n    "type": "record",\n    "fields": [\n        "Test",\n        "Other"\n    ]\n}'],
	].forEach(([input, expected]) => {
		it('Formatter converts correctly ' + input, () => {
			assert.equal(formatter.format(input), expected);
		});
	});
});