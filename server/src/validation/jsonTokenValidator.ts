import { Token, LeftBracketToken, RightBracketToken, LeftSquareBracketToken, RightSquareBracketToken, StringToken, ColonToken, BoolToken, CommaToken, FreeTextToken, IntegerToken, NullToken, PrecisionNumberToken } from '../tokens';
import { ValidationMessage, ValidationMessageAggregator } from './validators';

export class JsonTokenValidator{
	validate(tokens: Token[]): ValidationMessage[] {
		if (tokens.length === 0 || (tokens.length === 1 && tokens[0] instanceof StringToken)) {
			return [];
		}

		const messageAggregator = new ValidationMessageAggregator();
		this.getNode(tokens, messageAggregator);
		return messageAggregator.getAll();
	}

	getNode(tokens: Token[], messageAggregator: ValidationMessageAggregator): number {
		let position = 0;
	
		if (tokens[position] instanceof LeftBracketToken) {
			position++;
		}
		let movedForward = true;
		let hasClosingBracket = false;
		let commaToken: Token | null = null;
		while (position < tokens.length && movedForward) {
			movedForward = false;
			if (tokens[position] instanceof RightBracketToken) {
				position++;
				hasClosingBracket = true;
				break;
			}
			if (position < tokens.length) {
				if (!(tokens[position] instanceof StringToken)) {
					messageAggregator.addError(tokens[position], 'Attribute key must be double quoted');
				}
				position++;
				movedForward = true;
			}
			if (position >= tokens.length) {
				messageAggregator.addError(tokens[position - 1], 'Colon expected');
			}
			else if (tokens[position] instanceof ColonToken){
				position++;
				movedForward = true;
			}
			else {
				messageAggregator.addError(tokens[position], 'Colon expected');
			}
			const move = this.getValue(tokens.slice(position), false, messageAggregator)
			if (move > 0) {
				movedForward = true;
			}
			else {
				messageAggregator.addError(tokens[position - 1], 'Value expected');
			}
			position += move;
			commaToken = null;
			if (position < tokens.length && tokens[position] instanceof CommaToken){
				commaToken = tokens[position];
				position++;
				movedForward = true;
			}
		}
		if (commaToken !== null) {
			if (hasClosingBracket) {
				messageAggregator.addError(commaToken, 'Trailing comma');
			}
			else {
				messageAggregator.addError(commaToken, 'Attribute expected');
			}
		}
		if (!hasClosingBracket && tokens.length > 0 && position > 0) {
			messageAggregator.addError(tokens[position - 1], 'Closing bracket } expected');
		}

		return position;
	}
	
	getValue(tokens: Token[], isArray: boolean, messageAggregator: ValidationMessageAggregator): number {
		const position = 0;
	
		if (isArray && tokens[position] instanceof ColonToken) {
			return 1;
		}
		if (tokens[position] instanceof StringToken || tokens[position] instanceof IntegerToken
			|| tokens[position] instanceof PrecisionNumberToken || tokens[position] instanceof BoolToken
			|| tokens[position] instanceof NullToken) {
			return 1;
		}
		else if (tokens[position] instanceof FreeTextToken) {
			messageAggregator.addError(tokens[position], 'Unrecognized value');
			return 1;
		}
		if (tokens[position] instanceof LeftSquareBracketToken) {
			return this.getArray(tokens, messageAggregator);
		}
		if (tokens[position] instanceof LeftBracketToken) {
			return this.getNode(tokens, messageAggregator);
		}
	
		return 0;
	}
	
	getArray(tokens: Token[], messageAggregator: ValidationMessageAggregator): number {
		let position = 0;
		if (tokens[position] instanceof LeftSquareBracketToken) {
			position++;
		}
		let movedForward = true;
		let hasClosingBracket = false;
		let commaToken: Token | null = null;
		while (position < tokens.length && movedForward) {
			movedForward = false;
			if (tokens[position] instanceof RightSquareBracketToken) {
				position++;
				hasClosingBracket = true;
				break;
			}
			const move = this.getValue(tokens.slice(position), true, messageAggregator);
			if (move > 0) {
				position += move;
				movedForward = true;
			}
			commaToken = null;
			if (position < tokens.length && tokens[position] instanceof CommaToken){
				commaToken = tokens[position];
				position++;
				movedForward = true;
			}
		}
		if (commaToken !== null) {
			if (hasClosingBracket) {
				messageAggregator.addError(commaToken, 'Trailing comma');
			}
			else {
				messageAggregator.addError(commaToken, 'Value expected');
			}
		}
		if (!hasClosingBracket && tokens.length > 0 && position > 0) {
			messageAggregator.addError(tokens[position - 1], 'Closing bracket ] expected');
		}

		return position;
	}
}

// class BracketNode {
// 	next: BracketNode | null = null;
// 	token: LeftBracketToken | LeftSquareBracketToken | RightBracketToken | RightSquareBracketToken;

// 	constructor (token: LeftBracketToken | LeftSquareBracketToken | RightBracketToken | RightSquareBracketToken) {
// 		this.token = token;
// 	}
// }

// class BracketsLinkedList {
// 	private head: BracketNode | null = null;
// 	// private len: number = 0;

// 	append(token: LeftBracketToken | LeftSquareBracketToken | RightBracketToken | RightSquareBracketToken) {
// 		const node = new BracketNode(token);
// 		if (this.head === null) {
// 			this.head = node;
// 		}
// 		else {
// 			let current = this.head;
// 			while (current.next !== null) {
// 				current = current.next;
// 			}
// 			current.next = node;
// 		}
// 		// this.len++;
// 	}

// 	getNotMatchingBrackets(): Token[] {
// 		let removed = this.removeMatchingPairs();
		
// 	}

// 	removeMatchingPairs(): boolean {
// 		if (this.head === null) {
// 			return false;
// 		}
// 		let removed = false;
// 		let current: BracketNode = this.head;
// 		let previous: BracketNode | null = null;
// 		while (current.next !== null) {
// 			let next = current.next;
// 			if (current.token instanceof LeftBracketToken && next.token instanceof RightBracketToken) {
// 				if (previous === null) {
// 					this.head = next.next;
// 				}
// 				else {
// 					previous.next = next.next;
// 				}
// 				if (next.next instanceof BracketNode) {
// 					current = next.next;
// 				}
// 				else {
// 					break;
// 				}
// 				// this.len -= 2;
// 				removed = true;
// 			}
// 			else {
// 				previous = current;
// 				current = next;
// 			}
// 		}
// 		return removed;
// 	}

// 	toArray(): Token[] {
// 		const result: Token[] = [];
// 		let current: BracketNode | null = this.head;
// 		while (current !== null) {
// 			result.push(current.token);
// 			current = current.next;
// 		}
// 		return result;
// 	}
// }