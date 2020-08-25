import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode, ArrayNode } from '../syntaxTree';

export class TextSeparatorsValidator implements Validator {
	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		this.validateNode(tree.node, messageAggregator);
		return messageAggregator.getAll();
	}

	validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator) {
		node.attributes.forEach((attribute, index) => {
			if (attribute.colon === null) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.getStartPosition(),
					attribute.getEndPosition(),
					'Missing ":" between a key and a value'));
			}

			if (index < node.attributes.length - 1 && attribute.comma === null) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.getStartPosition(),
					attribute.getEndPosition(),
					'Missing "," between attributes'));
			}

			if (index === node.attributes.length - 1 && attribute.comma !== null) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.comma.getStartPosition(),
					attribute.comma.getEndPosition(),
					'Last attribute followed by ","'));
			}

			if (attribute.value instanceof ObjectNode) {
				this.validateNode(attribute.value, messageAggregator);
			}

			if (attribute.value instanceof ArrayNode) {
				this.validateArrayNode(attribute.value, messageAggregator);
			}
		});

		if (node.leftBracket !== null && node.rightBracket === null) {
			messageAggregator.addMessage(new ValidationMessage(
				ValidationSeverity.Error,
				node.getStartPosition(),
				node.getEndPosition(),
				'Missing closing bracket "}"'));
		}
	}

	validateArrayNode(arrayNode: ArrayNode, messageAggregator: ValidationMessageAggregator) {
		arrayNode.items.forEach((item, index) => {
			if (index < arrayNode.items.length - 1 && item.comma === null) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					item.getStartPosition(),
					item.getEndPosition(),
					'Missing "," between array items'));
			}

			if (index === arrayNode.items.length - 1 && item.comma !== null) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					item.comma.getStartPosition(),
					item.comma.getEndPosition(),
					'Last array item followed by ","'));
			}

			if (item.value instanceof ObjectNode) {
				this.validateNode(item.value, messageAggregator);
			}

			if (item.value instanceof ArrayNode) {
				this.validateArrayNode(item.value, messageAggregator);
			}
		});

		if (arrayNode.leftBracket !== null && arrayNode.rightBracket === null) {
			messageAggregator.addMessage(new ValidationMessage(
				ValidationSeverity.Error,
				arrayNode.getStartPosition(),
				arrayNode.getEndPosition(),
				'Missing closing bracket "]"'));
		}
	}
}