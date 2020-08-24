import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode } from '../syntaxTree';

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

			if (index < node.attributes.length - 1) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.getStartPosition(),
					attribute.getEndPosition(),
					'Missing "," between attributes'));
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
}