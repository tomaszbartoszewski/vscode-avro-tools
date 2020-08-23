import { Tree } from '../syntaxtree';

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

export class ValidationMessageAggregator {
	private messages: ValidationMessage[] = [];

	addMessage(message: ValidationMessage) {
		this.messages.push(message);
	}

	getAll() {
		return this.messages;
	}
}

export interface Validator {
	validate(tree: Tree): ValidationMessage[];
}