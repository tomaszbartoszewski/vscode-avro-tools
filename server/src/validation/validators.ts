import { Tree, KeyValuePair } from '../syntaxtree';
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

export interface Validator {
	// validate(tree: Tree): Generator<ValidationMessage, string, boolean>;
	validate(tree: Tree): ValidationMessage[];

}

export class ExpectedAttributesValidator implements Validator {
	// For some reason using this method is crashing the server
	// *validate(tree: Tree): Generator<ValidationMessage, string, boolean> {
	// 	const type = tree.node.children.find(kv => kv.key !== null 
	// 		&& kv.key.token === Token.String && kv.key.value === '"type"');

	// 	if (type !== undefined && type.value instanceof TokenInfo 
	// 		&& type.value.token === Token.String && type.value.value === '"record"') {
	// 			const typeKey = type.key as TokenInfo;
	// 			let hasName = false;
	// 			tree.node.children.forEach((kv) => {
	// 				if (kv.key !== null && kv.key.token === Token.String && kv.key.value === '"name"'){
	// 					hasName = true;
	// 				}
	// 			});

	// 			if (!hasName) {
	// 				yield new ValidationMessage(
	// 					ValidationSeverity.Error,
	// 					typeKey.position,
	// 					type.value.length + type.value.position,
	// 					"Attribute name is missing");
	// 			}
	// 	}

	// 	return "Finished!";
	// }

	validate(tree: Tree): ValidationMessage[] {
		const result: ValidationMessage[] = [];
		const type = tree.node.children.find(kv => kv.key !== null && kv.key.value === '"type"');

		if (type instanceof KeyValuePair && type.value instanceof StringToken && type.value.value === '"record"') {
				const typeKey = type.key as StringToken;
				let hasName = false;
				tree.node.children.forEach((kv) => {
					if (kv.key !== null && kv.key.value === '"name"'){
						hasName = true;
					}
				});

				if (!hasName) {
					result.push(new ValidationMessage(
						ValidationSeverity.Error,
						typeKey.position,
						type.value.length + type.value.position,
						'Attribute name is missing'));
				}

				let hasFields = false;
				tree.node.children.forEach((kv) => {
					if (kv.key !== null && kv.key.value === '"fields"'){
						hasFields = true;
					}
				});

				if (!hasFields) {
					result.push(new ValidationMessage(
						ValidationSeverity.Error,
						typeKey.position,
						type.value.length + type.value.position,
						'Attribute fields is missing'));
				}
		}

		return result;
	}
}