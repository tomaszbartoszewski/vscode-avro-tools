import { Tree, KeyValuePair, ObjectNode, ArrayNode, ArrayItem } from '../syntaxTree';
import { StringToken } from '../tokens';

export class CorrectSchemaWalker {
	private validateNode: (node: ObjectNode, isField: boolean, isNestedType: boolean) => void

	constructor(validateNode: (node: ObjectNode, isField: boolean, isNestedType: boolean) => void) {
		this.validateNode = validateNode;
	}

	walkTree(tree: Tree) {
		this.walkNode(tree.node);
	}

	private walkNode(node: ObjectNode, isField: boolean = false, isNestedType: boolean = false) {
		this.validateNode(node, isField, isNestedType);

		const type = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');
		if (type instanceof KeyValuePair && type.value instanceof StringToken) {
			const token: StringToken = type.value;
			if (token.value === '"record"') {
				const fieldsAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"fields"');
				// console.log(fieldsAttribute);
				if (fieldsAttribute instanceof KeyValuePair && fieldsAttribute.value instanceof ArrayNode) {
					const fields: ArrayItem[] = fieldsAttribute.value.items;
					fields.forEach((field) => {
						if (field.value instanceof ObjectNode) {
							// console.log('Validate node', field);
							this.walkNode(field.value, true);
						}
					});
				}
			}
			else if (token.value === '"array"') {
				this.walkInLineDefinedType(node, '"items"');
			}
			else if (token.value === '"map"') {
				this.walkInLineDefinedType(node, '"values"');
			}
		}

		this.walkInLineDefinedType(node, '"type"', true);
	}

	private walkInLineDefinedType(node: ObjectNode, fieldName: string, isNestedType: boolean = false) {
		const attribute = node.attributes.find(kv => kv.key !== null && kv.key.value === fieldName);
		// console.log(attribute);
		if (attribute instanceof KeyValuePair && attribute.value instanceof ObjectNode) {
			this.walkNode(attribute.value, false, isNestedType); // TODO can map or array have a type which has default on it's own?
		}
		else if (attribute instanceof KeyValuePair && attribute.value instanceof ArrayNode) { // union // TODO same as above can a union type have a default on it's own?
			const types: ArrayItem[] = attribute.value.items;
			// console.log(types);
			types.forEach((type) => {
				if (type.value instanceof ObjectNode) {
					// console.log('Complex type in union', type.value);
					this.walkNode(type.value);
				}
			});
		}
	}
}