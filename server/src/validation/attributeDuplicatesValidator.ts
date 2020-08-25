import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode, ArrayNode } from '../syntaxTree';
import { StringToken } from '../tokens';

export class AttributeDuplicatesValidator implements Validator {
	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		this.validateNode(tree.node, messageAggregator);
		return messageAggregator.getAll();
	}

	validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator) {
		const attributesAlreadyPresent = new Set<string>();
		node.attributes.forEach((attribute) => {
			if (attribute.key instanceof StringToken) {
				if (attributesAlreadyPresent.has(attribute.key.value)) {
					messageAggregator.addMessage(new ValidationMessage(
						ValidationSeverity.Error,
						attribute.getStartPosition(),
						attribute.getEndPosition(),
						'Attribute ' + attribute.key.value + ' already exists'));
				}
				else {
					attributesAlreadyPresent.add(attribute.key.value);
				}
			}

			if (attribute.value instanceof ObjectNode) {
				this.validateNode(attribute.value, messageAggregator);
			}

			if (attribute.value instanceof ArrayNode) {
				this.validateArrayNode(attribute.value, messageAggregator);
			}
	});
}

validateArrayNode(arrayNode: ArrayNode, messageAggregator: ValidationMessageAggregator) {
	arrayNode.items.forEach((item) => {
		if (item.value instanceof ObjectNode) {
			this.validateNode(item.value, messageAggregator);
		}

		if (item.value instanceof ArrayNode) {
			this.validateArrayNode(item.value, messageAggregator);
		}
	});
}
}