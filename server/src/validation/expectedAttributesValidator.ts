import { Tree, KeyValuePair, ObjectNode } from '../syntaxTree';
import { StringToken } from '../tokens';
import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { CorrectSchemaWalker } from './correctSchemaWalker';

export class ExpectedAttributesValidator implements Validator {
	private typeRequiredAttributes: Map<string, string[]> =
		new Map([
			['"record"', ['"name"', '"fields"']],
			['"enum"', ['"name"', '"symbols"']],
			['"fixed"', ['"name"', '"size"']],
			['"array"', ['"items"']],
			['"map"', ['"values"']],
		]);

	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		const walker = new CorrectSchemaWalker((node, isField) => {
			this.validateNode(node, messageAggregator, isField);
		});
		walker.walkTree(tree);
		return messageAggregator.getAll();
	}

	private validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator, isField: boolean) {
		const nodeStart = node.getStartPosition();
		const nodeEnd = node.getEndPosition();

		if (isField) {
			const attributeMissing = this.expectedAttribute(node.attributes, '"name"', nodeStart, nodeEnd);
			if (attributeMissing !== null) {
				messageAggregator.addMessage(attributeMissing);
			}
		}

		const typeMissing = this.expectedAttribute(node.attributes, '"type"', nodeStart, nodeEnd);
		if (typeMissing !== null) {
			messageAggregator.addMessage(typeMissing);
		}
		else {
			const type = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');

			if (type instanceof KeyValuePair && type.value instanceof StringToken) {
				const token: StringToken = type.value;
				const requiredAttributes = this.typeRequiredAttributes.get(token.value);

				let attributesToValidate: Set<string> = new Set();
				if (requiredAttributes !== undefined) {
					attributesToValidate = new Set(requiredAttributes);
				}
				if (isField) {
					attributesToValidate.delete('"name"');
				}

				attributesToValidate.forEach((attributeName) => {
					const attributeMissing = this.expectedAttribute(node.attributes, attributeName, type.getStartPosition(), type.getEndPosition());
					if (attributeMissing !== null) {
						messageAggregator.addMessage(attributeMissing);
					}
				});
			}
		}
	}

	private expectedAttribute(attributes: KeyValuePair[], name: string, messageStart: number, messageEnd: number): ValidationMessage | null {
		let hasFields = false;
		attributes.forEach((kv) => {
			if (kv.key !== null && kv.key.value === name) {
				hasFields = true;
			}
		});

		if (!hasFields) {
			return new ValidationMessage(
				ValidationSeverity.Error,
				messageStart,
				messageEnd,
				'Attribute ' + name + ' is missing');
		}

		return null;
	}
}