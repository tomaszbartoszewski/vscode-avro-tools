import { Tree, KeyValuePair, Node, ArrayNode, ArrayItem } from '../syntaxtree';
import { Token, StringToken } from '../parsing';

export enum ValidationSeverity {
	Error,
	Warning
}

export class ValidationMessage {
	severity: ValidationSeverity
	start: number
	end: number
	message: string

	constructor(severity: ValidationSeverity, start: number, end: number, message: string) {
		this.severity = severity;
		this.start = start;
		this.end = end;
		this.message = message;
	}
}

class ValidationMessageAggregator {
	private messages: ValidationMessage[] = [];

	addMessage(message: ValidationMessage) {
		this.messages.push(message);
	}

	getAll() {
		return this.messages;
	}
}

export interface Validator {
	validate(tree: Tree): ValidationMessage[];
}

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

	validateNode(node: Node, messageAggregator: ValidationMessageAggregator, isField: boolean = false) {
		const nodeStart = (node.leftBracket !== null) ? node.leftBracket.position : 0;
		const nodeEnd = (node.rightBracket !== null)
			? node.rightBracket.position + node.rightBracket.value.length
			: nodeStart + 1;

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
					attributesToValidate.add('"name"');
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
							if (field.value instanceof Node) {
								// console.log('Validate node', field);
								this.validateNode(field.value, messageAggregator, true);
							}
						});
					}
				}
			}
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