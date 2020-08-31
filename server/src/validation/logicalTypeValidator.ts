import { Validator, ValidationMessage, ValidationMessageAggregator } from './validators';
import { Tree, ObjectNode, KeyValuePair } from '../syntaxTree';
import { CorrectSchemaWalker } from './correctSchemaWalker';
import { StringToken } from '../tokens';
import { stringify } from 'querystring';

export class LogicalTypeValidator implements Validator {
	private typeForLogicalType: Map<string, string[]> = new Map([
		['"decimal"', ['"bytes"', '"fixed"']],
		['"uuid"', ['"string"']],
		['"date"', ['"int"']],
		['"time-millis"', ['"int"']],
		['"time-micros"', ['"long"']],
		['"timestamp-millis"', ['"long"']],
		['"timestamp-micros"', ['"long"']],
		['"local-timestamp-millis"', ['"long"']],
		['"local-timestamp-micros"', ['"long"']],
		['"duration"', ['"fixed"']]
	]);

	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		const walker = new CorrectSchemaWalker((node, isField, _) => {
			this.validateNode(node, messageAggregator);
		});
		walker.walkTree(tree);
		return messageAggregator.getAll();
	}

	private validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator) {
		const logicalTypeAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"logicalType"');
		if (logicalTypeAttribute instanceof KeyValuePair) {
			if (!(logicalTypeAttribute.value instanceof StringToken)) {
				messageAggregator.addError(logicalTypeAttribute, 'Logical type attribute has to be a string');
				return;
			}

			const logicalTypeName = logicalTypeAttribute.value.value;
			const expectedType = this.typeForLogicalType.get(logicalTypeName);
			if (expectedType !== undefined) {
				const typeAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');
				if (typeAttribute instanceof KeyValuePair) {
					let isValid = false;
					if (typeAttribute.value instanceof StringToken) {
						const typeName = typeAttribute.value.value;
						expectedType.forEach(t => {
							if (typeName === t) {
								isValid = true;
								return;
							}
						})
					}
					if (!isValid) {
						messageAggregator.addError(logicalTypeAttribute, 'Logical type ' + logicalTypeName + ' requires type ' + expectedType.join(' or '));
					}
				}
			}
			else {
				messageAggregator.addError(logicalTypeAttribute, 'Logical type ' + logicalTypeName + ' is unknown');
			}
		}
	}
}