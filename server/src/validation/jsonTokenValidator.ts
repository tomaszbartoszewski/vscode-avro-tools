import { Token, LeftBracketToken, RightBracketToken, LeftSquareBracketToken, RightSquareBracketToken, StringToken, ColonToken } from '../tokens';
import { ValidationMessage, ValidationMessageAggregator } from './validators';

enum JSONLevel {
	Object,
	Array
}

export class JsonTokenValidator{
	validate(tokens: Token[]): ValidationMessage[] {
		const messageAggregator = new ValidationMessageAggregator();
		const brackets: LeftBracketToken|LeftSquareBracketToken[] = [];
		// const brackets = new BracketsLinkedList();

		if (tokens.length === 0 || (tokens.length === 1 && tokens[0] instanceof StringToken)) {
			return [];
		}

		// if (!(tokens[0] instanceof LeftBracketToken))
		// {
		// 	messageAggregator.addError(tokens[0], 'Schema should start with a {');
		// }
		let i = 0;
		let currentLevel = JSONLevel.Object;

		const getLevel = function(): JSONLevel {
			if (brackets.length > 0) {
				if (brackets[brackets.length - 1] instanceof LeftBracketToken) {
					return JSONLevel.Object;
				}
				else if (brackets[brackets.length - 1] instanceof LeftSquareBracketToken) {
					return JSONLevel.Array;
				}
			}
			return JSONLevel.Object;
		}

		while (i < tokens.length) {
			if (tokens[i] instanceof LeftBracketToken || tokens[i] instanceof LeftSquareBracketToken) {
				brackets.push(tokens[i]);
				currentLevel = getLevel();
			}
			else if (tokens[i] instanceof RightBracketToken || tokens[i] instanceof RightSquareBracketToken) {
				brackets.pop();
				currentLevel = getLevel();
			}
			else if (currentLevel === JSONLevel.Object) {
				if (!(tokens[i] instanceof StringToken)) {
					messageAggregator.addError(tokens[i], 'String as an attribute key expected');
				}

				if (i + 1 >= tokens.length) {
					messageAggregator.addError(tokens[i], 'Colon expected');
				}
				else if (!(tokens[i + 1] instanceof ColonToken)) {
					messageAggregator.addError(tokens[i + 1], 'Colon expected');
					i++;
				}
				else if (i + 2 >= tokens.length) {
					i++;
					messageAggregator.addError(tokens[i], 'Value expected');
				}
				else {
					i += 2;
				}

			}
			i++;
		}

		if (brackets.length > 0) {
			const lastBracket = brackets.pop();
			if (lastBracket instanceof LeftBracketToken) {
				messageAggregator.addError(lastBracket, 'Closing bracket expected');
			}
		}

		// tokens.forEach(token => {
		// 	if (token instanceof LeftBracketToken) {
		// 		brackets.append(token);
		// 	}
		// });

		// brackets.removeMatchingPairs();
		// brackets.toArray().forEach(token => {
		// 	if (token instanceof LeftBracketToken) {
		// 		messageAggregator.addError(token, 'Missing matching }');
		// 	}
		// });

		return messageAggregator.getAll();
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