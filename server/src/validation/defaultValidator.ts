import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode, KeyValuePair } from '../syntaxTree';
import { CorrectSchemaWalker } from './correctSchemaWalker';
import { StringToken, NullToken, BoolToken, IntegerToken, PrecisionNumberToken } from '../tokens';
import { HighlightRange } from '../highlightsRange';

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
		const addErrorMessage = function (range: HighlightRange, msg: string) {
			messageAggregator.addMessage(new ValidationMessage(
				ValidationSeverity.Error,
				range.getStartPosition(),
				range.getEndPosition(),
				msg));
		}
		
		if (isField) {
			const typeAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"type"');
			const defaultAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"default"');
			if (defaultAttribute instanceof KeyValuePair) {
				if (typeAttribute instanceof KeyValuePair && typeAttribute.value instanceof StringToken) {
					const typeToken: StringToken = typeAttribute.value;
					if (typeToken.value === '"null"' && !(defaultAttribute.value instanceof NullToken)) {
						addErrorMessage(defaultAttribute, 'Default value for type "null" has to be a null');
					}
					else if (typeToken.value === '"boolean"' && !(defaultAttribute.value instanceof BoolToken)) {
						addErrorMessage(defaultAttribute, 'Default value for type "boolean" has to be true or false');
					}
					else if (typeToken.value === '"int"') {
						if (defaultAttribute.value instanceof IntegerToken) {
							const token = defaultAttribute.value;
							const intValue = Number(token.value);
							if (intValue > 2147483647 || intValue < -2147483648) {
								addErrorMessage(defaultAttribute, 'Default value for type "int" has to be a 32-bit signed integer');
							}
						}
						else {
							addErrorMessage(defaultAttribute, 'Default value for type "int" has to be a 32-bit signed integer');
						}
					}
					else if (typeToken.value === '"long"' && !(defaultAttribute.value instanceof IntegerToken)) { // TODO: Add extra checks to see if it is a 64-bit number, so far what I read JS supports 53-bit
						addErrorMessage(defaultAttribute, 'Default value for type "long" has to be a 64-bit signed integer');
					}
					else if (typeToken.value === '"float"' && !(defaultAttribute.value instanceof PrecisionNumberToken) && !(defaultAttribute.value instanceof IntegerToken)) { // TODO: Add extra checks to see if it is a 32-bit number
						addErrorMessage(defaultAttribute, 'Default value for type "float" has to be a 32-bit single precision floating-point number');
					}
					else if (typeToken.value === '"double"' && !(defaultAttribute.value instanceof PrecisionNumberToken) && !(defaultAttribute.value instanceof IntegerToken)) { // TODO: Add extra checks to see if it is a 64-bit number
						addErrorMessage(defaultAttribute, 'Default value for type "double" has to be a 64-bit double precision floating-point number');
					}
				}
			}
		}
	}
}