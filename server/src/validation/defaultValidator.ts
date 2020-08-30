import { Validator, ValidationMessage, ValidationMessageAggregator, ValidationSeverity } from './validators';
import { Tree, ObjectNode, KeyValuePair, ArrayNode, ArrayItem } from '../syntaxTree';
import { CorrectSchemaWalker } from './correctSchemaWalker';
import { StringToken, NullToken, BoolToken, IntegerToken, PrecisionNumberToken, Token } from '../tokens';
import { HighlightRange } from '../highlightsRange';

export class DefaultValidator implements Validator {
	private bytesDefaultRegex = new RegExp('^\"(\\\\u00[0-9A-Fa-f]{2})*\"$');

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
					if (!this.isValidDefaultForType(typeToken, defaultAttribute, node)) {
						addErrorMessage(defaultAttribute, this.getErrorMessageForType(typeToken));
					}
				}
			}
		}
	}

	
	private isValidDefaultForType(typeToken: StringToken, defaultAttribute: KeyValuePair | ArrayItem, node: ObjectNode): boolean {
		if (typeToken.value === '"null"' && !(defaultAttribute.value instanceof NullToken)) {
			return false;
		}
		else if (typeToken.value === '"boolean"' && !(defaultAttribute.value instanceof BoolToken)) {
			return false;
		}
		else if (typeToken.value === '"int"') {
			if (defaultAttribute.value instanceof IntegerToken) {
				const token = defaultAttribute.value;
				const intValue = Number(token.value);
				if (intValue > 2147483647 || intValue < -2147483648) {
					return false;
				}
			}
			else {
				return false;
			}
		}
		else if (typeToken.value === '"long"' && !(defaultAttribute.value instanceof IntegerToken)) { // TODO: Add extra checks to see if it is a 64-bit number, so far what I read JS supports 53-bit
			return false;
		}
		else if (typeToken.value === '"float"' && !(defaultAttribute.value instanceof PrecisionNumberToken) && !(defaultAttribute.value instanceof IntegerToken)) { // TODO: Add extra checks to see if it is a 32-bit number
			return false;
		}
		else if (typeToken.value === '"double"' && !(defaultAttribute.value instanceof PrecisionNumberToken) && !(defaultAttribute.value instanceof IntegerToken)) { // TODO: Add extra checks to see if it is a 64-bit number
			return false;
		}
		else if (typeToken.value === '"string"' && !(defaultAttribute.value instanceof StringToken)) {
			return false;
		}
		else if (typeToken.value === '"bytes"' && !this.isCorrectUnicodeDefault(defaultAttribute.value)) {
			return false;
		}
		else if (typeToken.value === '"fixed"' && !this.isCorrectUnicodeDefault(defaultAttribute.value)) {
			return false;
		}
		else if (typeToken.value === '"enum"') {
			const symbolsAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"symbols"');
			if (symbolsAttribute instanceof KeyValuePair && !this.isCorrectEnumDefault(defaultAttribute.value, symbolsAttribute.value)){
				return false;
			}
		}
		else if (typeToken.value === '"array"') {
			const itemsAttribute = node.attributes.find(kv => kv.key !== null && kv.key.value === '"items"');
			if (itemsAttribute instanceof KeyValuePair) {
				// to be an enum it would have to be an object as items, everything else can live with empty node,
				// it's too much self aware, but it can be changed later, for now I only handle primitive types as items
				let itemsTypeNode = new ObjectNode();
				if (itemsAttribute.value instanceof ObjectNode) {
					itemsTypeNode = itemsAttribute.value;
				}
				if (!this.isCorrectArrayDefault(defaultAttribute.value, itemsAttribute.value, itemsTypeNode)){
					return false;
				}
			}
		}
		return true;
	}

	private isCorrectUnicodeDefault(defaultValue: Token | ObjectNode | ArrayNode | null ): boolean {
		return defaultValue instanceof StringToken && this.bytesDefaultRegex.test(defaultValue.value);
	}

	private isCorrectEnumDefault(defaultValue: Token | ObjectNode | ArrayNode | null, symbolsValue: Token | ObjectNode | ArrayNode | null): boolean {
		if (!(defaultValue instanceof StringToken)) {
			return false;
		}
		const defaultText = defaultValue.value;
		let isOnSymbols = false;
		if (symbolsValue instanceof ArrayNode) {
			symbolsValue.items.forEach(symbol => {
				if (symbol.value instanceof StringToken) {
				}
				if (symbol.value instanceof StringToken && symbol.value.value === defaultText) {
					isOnSymbols = true;
					return;
				}
			});
		}
		return isOnSymbols;
	}

	private isCorrectArrayDefault(defaultValue: Token | ObjectNode | ArrayNode | null, itemsValue: Token | ObjectNode | ArrayNode | null, node: ObjectNode): boolean {
		if (!(defaultValue instanceof ArrayNode)) {
			return false;
		}
		let isMatchingSchema = true;
		if (itemsValue instanceof StringToken) {
			defaultValue.items.forEach(item => {
				if (!this.isValidDefaultForType(itemsValue, item, node)) {
					isMatchingSchema = false;
					return;
				}
			});
		}

		return isMatchingSchema;
	}

	private getErrorMessageForType(typeToken: StringToken): string {
		switch (typeToken.value) {
			case '"null"':
				return 'Default value for type "null" has to be a null';
			case '"boolean"':
				return 'Default value for type "boolean" has to be true or false';
			case '"int"':
				return 'Default value for type "int" has to be a 32-bit signed integer';
			case '"long"':
				return 'Default value for type "long" has to be a 64-bit signed integer';
			case '"float"':
				return 'Default value for type "float" has to be a 32-bit single precision floating-point number';
			case '"double"':
				return 'Default value for type "double" has to be a 64-bit double precision floating-point number';
			case '"string"':
				return 'Default value for type "string" has to be a string';
			case '"bytes"':
				return 'Default value for type "bytes" has to be a string containing Unicode codes 0-255 in a format \\u00FF\\u0048';
			case '"fixed"':
				return 'Default value for type "fixed" has to be a string containing Unicode codes 0-255 in a format \\u00FF\\u0048';
			case '"enum"':
				return 'Default value for type "enum" has to be a string from symbols array';
			case '"array"':
				return 'Default value for type "array" is not correct';
			default:
				return 'Default value is not matching type';
		}
	}
}