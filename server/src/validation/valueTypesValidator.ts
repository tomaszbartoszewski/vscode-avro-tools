import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode, KeyValuePair, ArrayNode } from '../syntaxTree';
import { CorrectSchemaWalker } from './correctSchemaWalker';
import { StringToken, Token } from '../tokens';

export class ValueTypesValidator implements Validator {
	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		const walker = new CorrectSchemaWalker((node, isField) => {
			this.validateNode(node, messageAggregator, isField);
		});
		walker.walkTree(tree);
		return messageAggregator.getAll();
	}

	private validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator, isField: boolean) {
		const type = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');
		if (type instanceof KeyValuePair && type.value instanceof StringToken) {
			const token: StringToken = type.value;
			if (token.value === '"record"' || token.value === '"enum"' || token.value === '"fixed"') {
				const nameAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"name"');
				this.validateNameType(nameAttribute, messageAggregator);
				const namespaceAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"namespace"');
				this.validateNamespaceType(namespaceAttribute, messageAggregator);
				const aliasesAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"aliases"');
				this.validateAliasesType(aliasesAttribute, messageAggregator);
			}
		}
	}

	private validateNameType(attribute: KeyValuePair | undefined, messageAggregator: ValidationMessageAggregator) {
		if (attribute instanceof KeyValuePair && !(attribute.value instanceof StringToken)) {
			messageAggregator.addMessage(new ValidationMessage(
				ValidationSeverity.Error,
				attribute.getStartPosition(),
				attribute.getEndPosition(),
				'Name has to be a string'));
		}
	}

	private validateNamespaceType(attribute: KeyValuePair | undefined, messageAggregator: ValidationMessageAggregator) {
		if (attribute instanceof KeyValuePair && !(attribute.value instanceof StringToken)) {
			messageAggregator.addMessage(new ValidationMessage(
				ValidationSeverity.Error,
				attribute.getStartPosition(),
				attribute.getEndPosition(),
				'Namespace has to be a string'));
		}
	}

	private validateAliasesType(attribute: KeyValuePair | undefined, messageAggregator: ValidationMessageAggregator) {
		let isCorrect = true;
		
		if (attribute instanceof KeyValuePair) {
			if (!(attribute.value instanceof ArrayNode)) {
				isCorrect = false;
			}
			else {
				const aliases = attribute.value as ArrayNode;
				aliases.items.forEach(alias => {
					if (!(alias.value instanceof StringToken)) {
						isCorrect = false;
					}
				});
			}

			if (!isCorrect) {
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.getStartPosition(),
					attribute.getEndPosition(),
					'Aliases have to be an array of strings'));
			}
		}
	}
}