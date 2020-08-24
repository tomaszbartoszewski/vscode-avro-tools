import { Tree, KeyValuePair, ObjectNode, ArrayNode, ArrayItem } from '../syntaxtree';
import { StringToken } from '../parsing';
import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';

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
		this.validateNode(tree.node, messageAggregator);
		return messageAggregator.getAll();
	}

	validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator, isField: boolean = false) {
		const nodeStart = (node.leftBracket !== null) ? node.leftBracket.position : 0;
		const nodeEnd = (node.rightBracket !== null)
			? node.rightBracket.position + node.rightBracket.value.length
			: nodeStart + 1;

		if (isField) {
			const attributeMissing = this.expectedAttribute(node.children, '"name"', nodeStart, nodeEnd);
			if (attributeMissing !== null) {
				messageAggregator.addMessage(attributeMissing);
			}
		}

		const typeMissing = this.expectedAttribute(node.children, '"type"', nodeStart, nodeEnd);
		if (typeMissing !== null) {
			messageAggregator.addMessage(typeMissing);
		}
		else {
			const type = node.children.find(kv => kv.key !== null && kv.key.value === '"type"');

			if (type instanceof KeyValuePair && type.value instanceof StringToken) {
				const token: StringToken = type.value;
				const typeKey = type.key as StringToken;
				const requiredAttributes = this.typeRequiredAttributes.get(token.value);

				let attributesToValidate: Set<string> = new Set();
				if (requiredAttributes !== undefined) {
					attributesToValidate = new Set(requiredAttributes);
				}
				if (isField) {
					attributesToValidate.delete('"name"');
				}

				attributesToValidate.forEach((attributeName) => {
					const attributeMissing = this.expectedAttribute(node.children, attributeName, typeKey.position, token.value.length + token.position);
					if (attributeMissing !== null) {
						messageAggregator.addMessage(attributeMissing);
					}
				});

				if (token.value === '"record"') {
					const fieldsAttribute = node.children.find(kv => kv.key !== null && kv.key.value === '"fields"');
					// console.log(fieldsAttribute);
					if (fieldsAttribute instanceof KeyValuePair && fieldsAttribute.value instanceof ArrayNode) {
						const fields: ArrayItem[] = fieldsAttribute.value.children;
						fields.forEach((field) => {
							if (field.value instanceof ObjectNode) {
								// console.log('Validate node', field);
								this.validateNode(field.value, messageAggregator, true);
							}
						});
					}
				}
				else if (token.value === '"array"') {
					this.validateInLineDefinedType(node, '"items"', messageAggregator);
				}
				else if (token.value === '"map"') {
					this.validateInLineDefinedType(node, '"values"', messageAggregator);
				}
			}

			this.validateInLineDefinedType(node, '"type"', messageAggregator);
		}
	}

	validateInLineDefinedType(node: ObjectNode, fieldName: string, messageAggregator: ValidationMessageAggregator) {
		const attribute = node.children.find(kv => kv.key !== null && kv.key.value === fieldName);
		// console.log(attribute);
		if (attribute instanceof KeyValuePair && attribute.value instanceof ObjectNode) {
			this.validateNode(attribute.value, messageAggregator);
		}
		else if (attribute instanceof KeyValuePair && attribute.value instanceof ArrayNode) { // union
			const types: ArrayItem[] = attribute.value.children;
			// console.log(types);
			types.forEach((type) => {
				if (type.value instanceof ObjectNode) {
					// console.log('Complex type in union', type.value);
					this.validateNode(type.value, messageAggregator);
				}
			});
		}
	}

	expectedAttribute(attributes: KeyValuePair[], name: string, messageStart: number, messageEnd: number): ValidationMessage | null {
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