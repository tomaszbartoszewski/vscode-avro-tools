import { Token, LeftBracketToken, RightBracketToken, LeftSquareBracketToken, RightSquareBracketToken, StringToken, ColonToken, BoolToken, CommaToken, FreeTextToken, IntegerToken, NullToken, PrecisionNumberToken } from '../tokens';
import { ValidationMessage, ValidationMessageAggregator } from './validators';

export class JsonTokenValidator{
	validate(tokens: Token[]): ValidationMessage[] {
		if (tokens.length === 0 || (tokens.length === 1 && tokens[0] instanceof StringToken)) {
			return [];
		}

		const messageAggregator = new ValidationMessageAggregator();
		if (tokens.length > 0) {
			if (tokens[0] instanceof LeftBracketToken) {
				this.validateNode(tokens, messageAggregator);
			}
			else {
				messageAggregator.addError(tokens[0], 'Expected a JSON object or a string literal');
			}
		}

		return messageAggregator.getAll();
	}

	private validateNode(tokens: Token[], messageAggregator: ValidationMessageAggregator): number {
		let position = 0;

		if (tokens[position] instanceof LeftBracketToken) {
			position++;
		}
		let movedForward = true;
		let hasClosingBracket = false;
		let commaToken: Token | null = null;
		let attributeIteration = 0;
		while (position < tokens.length && movedForward) {
			movedForward = false;
			if (tokens[position] instanceof RightBracketToken) {
				position++;
				hasClosingBracket = true;
				break;
			}

			if (tokens[position] instanceof RightSquareBracketToken) {
				messageAggregator.addError(tokens[position], 'Unexpected closing bracket ]');
				position++;
				movedForward = true;
				if (position < tokens.length && tokens[position] instanceof RightBracketToken) {
					continue;
				}
			}
			else if (!(tokens[position] instanceof StringToken)) {
				messageAggregator.addError(tokens[position], 'Attribute key must be double quoted');
				position++;
				movedForward = true;
			}
			else {
				position++;
				movedForward = true;
			}

			if (commaToken === null && attributeIteration > 0) {
				messageAggregator.addError(tokens[position - 1], 'Expected comma');
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
			const move = this.validateValue(tokens.slice(position), false, messageAggregator)
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
			attributeIteration++;
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

	private validateValue(tokens: Token[], isArray: boolean, messageAggregator: ValidationMessageAggregator): number {
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
			return this.validateArray(tokens, messageAggregator);
		}
		if (tokens[position] instanceof LeftBracketToken) {
			return this.validateNode(tokens, messageAggregator);
		}

		return 0;
	}

	private validateArray(tokens: Token[], messageAggregator: ValidationMessageAggregator): number {
		let position = 0;
		if (tokens[position] instanceof LeftSquareBracketToken) {
			position++;
		}
		let movedForward = true;
		let hasClosingBracket = false;
		let commaToken: Token | null = null;
		let valueIteration = 0;
		while (position < tokens.length && movedForward) {
			movedForward = false;
			if (tokens[position] instanceof RightSquareBracketToken) {
				position++;
				hasClosingBracket = true;
				break;
			}

			if (tokens[position] instanceof RightBracketToken) {
				messageAggregator.addError(tokens[position], 'Unexpected closing bracket }');
				position++;
				movedForward = true;
				if (position < tokens.length && tokens[position] instanceof RightSquareBracketToken) {
					continue;
				}
			}

			const move = this.validateValue(tokens.slice(position), true, messageAggregator);
			if (move > 0) {
				if (commaToken === null && valueIteration > 0) {
					messageAggregator.addError(tokens[position], 'Expected comma');
				}
				position += move;
				movedForward = true;
			}
			commaToken = null;
			if (position < tokens.length && tokens[position] instanceof CommaToken){
				commaToken = tokens[position];
				position++;
				movedForward = true;
			}
			valueIteration++;
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
