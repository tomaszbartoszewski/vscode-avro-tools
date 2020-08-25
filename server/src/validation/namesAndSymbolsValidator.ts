import { Tree, KeyValuePair, ObjectNode, ArrayNode, ArrayItem } from '../syntaxTree';
import { StringToken } from '../tokens';
import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { CorrectSchemaWalker } from './correctSchemaWalker';

export class NamesAndSymbolsValidator implements Validator {
	private nameRegex = new RegExp('^\"[A-Za-z_][A-Za-z0-9_]*\"$');
	private namespaceRegex = new RegExp('^\"[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*\"$');

	validate(tree: Tree): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		const walker = new CorrectSchemaWalker((node, isField) => {
			this.validateNode(node, messageAggregator, isField);
		});
		walker.walkTree(tree);
		return messageAggregator.getAll();
	}

	private validateNode(node: ObjectNode, messageAggregator: ValidationMessageAggregator, isField: boolean = false) {
		if (isField) {
			const nameAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"name"');
			this.validateName(nameAttribute, messageAggregator);
			const namespaceAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"namespace"');
			this.validateNamespace(namespaceAttribute, messageAggregator);
		}
		
		const type = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');
		if (type instanceof KeyValuePair && type.value instanceof StringToken) {
			const token: StringToken = type.value;
			console.log(token);
			if (token.value === '"record"' && !isField) { // if it's a field we already ran a validation
				const nameAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"name"');
				this.validateName(nameAttribute, messageAggregator);
				const namespaceAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"namespace"');
				this.validateNamespace(namespaceAttribute, messageAggregator);
			}
		}
	}

	private validateName(attribute: KeyValuePair | undefined, messageAggregator: ValidationMessageAggregator) {
		if (attribute instanceof KeyValuePair && attribute.value instanceof StringToken) {
			const name = attribute.value.value;
			console.log(name);
			if (!this.nameRegex.test(name)) {
				console.log('Name failed')
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.value.getStartPosition(),
					attribute.value.getEndPosition(),
					'Name ' + name + ' is not matching a regular expression [A-Za-z_][A-Za-z0-9_]*'));
			}
		}
	}

	private validateNamespace(attribute: KeyValuePair | undefined, messageAggregator: ValidationMessageAggregator) {
		if (attribute instanceof KeyValuePair && attribute.value instanceof StringToken) {
			const namespace = attribute.value.value;
			console.log(namespace);
			if (!this.namespaceRegex.test(namespace)) {
				console.log('Namespace failed')
				messageAggregator.addMessage(new ValidationMessage(
					ValidationSeverity.Error,
					attribute.value.getStartPosition(),
					attribute.value.getEndPosition(),
					'Namespace ' + namespace + ' is not matching a regular expression [A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*'));
			}
		}
	}
}