import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode, KeyValuePair } from '../syntaxTree';
import { CorrectSchemaWalker } from './correctSchemaWalker';
import { StringToken, NullToken } from '../tokens';

export class DefaultValidator implements Validator {
	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		const walker = new CorrectSchemaWalker((node, isField) => {
			this.validateNode(node, messageAggregator, isField);
		});
		walker.walkTree(tree);
		return messageAggregator.getAll();
	}

	private validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator, isField: boolean) {
		if (isField) {
			const typeAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');
			const defaultAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"default"');
			if (defaultAttribute instanceof KeyValuePair) {
				if (typeAttribute instanceof KeyValuePair && typeAttribute.value instanceof StringToken) {
					const typeToken: StringToken = typeAttribute.value;
					if (typeToken.value === '"null"' && !(defaultAttribute.value instanceof NullToken)) {
						messageAggregator.addMessage(new ValidationMessage(
							ValidationSeverity.Error,
							defaultAttribute.getStartPosition(),
							defaultAttribute.getEndPosition(),
							'Default value for type "null" has to be a null'));
					}
				}
			}
		}
	}
}