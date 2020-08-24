import { Token, LeftBracketToken, RightBracketToken, StringToken, ColonToken, CommaToken, IntegerToken, PrecisionNumberToken, BoolToken, NullToken, FreeTextToken, LeftSquareBracketToken, RightSquareBracketToken } from './tokens';
import { Tree, ObjectNode, KeyValuePair, ArrayNode, ArrayItem } from './syntaxTree';

export function buildTree(tokens: Token[]): Tree {
	if (tokens.length === 0) {
		return new Tree(new ObjectNode(), []);
	}

	const [node, move] = getNode(tokens);
	// console.log(move);
	return new Tree(node, tokens.slice(move));
}

function getNode(tokens: Token[]): [ObjectNode, number] {
	let position = 0;
	const node = new ObjectNode();

	if (tokens[position] instanceof LeftBracketToken) {
		node.setLeftBracket(tokens[position]);
		position++;
	}
	let movedForward = true;
	while (position < tokens.length && movedForward) {
		// console.log('getNode, children loop', tokens.slice(position))
		movedForward = false;
		if (tokens[position] instanceof RightBracketToken) {
			node.setRightBracket(tokens[position]);
			position++;
			break;
		}
		const keyValuePair = new KeyValuePair();
		if (position < tokens.length && tokens[position] instanceof StringToken) {
			keyValuePair.setKey(tokens[position]);
			position++;
			movedForward = true;
		}
		if (position < tokens.length && tokens[position] instanceof ColonToken){
			keyValuePair.setColon(tokens[position]);
			position++;
			movedForward = true;
		}
		// console.log('getNode, entering getValue', tokens.slice(position));
		const [value, move] = getValue(tokens.slice(position))
		if (value !== null) {
			keyValuePair.setValue(value);
			movedForward = true;
		}
		position += move;
		if (position < tokens.length && tokens[position] instanceof CommaToken){
			// console.log(tokens.slice(position))
			keyValuePair.setComma(tokens[position]);
			position++;
			movedForward = true;
		}
		if (movedForward) {
			node.addAttribute(keyValuePair);
		}
	}
	return [node, position];
}

function getValue(tokens: Token[], isArray: boolean = false): [Token | ObjectNode | ArrayNode | null, number] {
	const position = 0;

	if (isArray && tokens[position] instanceof ColonToken) {
		// console.log('getValue, colon', tokens.slice(position));
		return [tokens[position], 1];
	}
	if (tokens[position] instanceof StringToken || tokens[position] instanceof IntegerToken
		|| tokens[position] instanceof PrecisionNumberToken || tokens[position] instanceof BoolToken
		|| tokens[position] instanceof NullToken || tokens[position] instanceof FreeTextToken) {
		// console.log('getValue, primitives', tokens.slice(position));
		return [tokens[position], 1];
	}
	if (tokens[position] instanceof LeftSquareBracketToken) {
		// console.log('getValue, entering getArray', tokens.slice(position));
		return getArray(tokens);
	}
	if (tokens[position] instanceof LeftBracketToken) {
		// console.log('getValue, entering getNode', tokens.slice(position));
		return getNode(tokens);
	}

	return [null, 0];
}

function getArray(tokens: Token[]): [ArrayNode, number] {
	let position = 0;
	const result = new ArrayNode();
	if (tokens[position] instanceof LeftSquareBracketToken) {
		result.setLeftBracket(tokens[position]);
		position++;
	}
	let movedForward = true;
	while (position < tokens.length && movedForward) {
		movedForward = false;
		// console.log('getArray, items loop', tokens.slice(position));
		if (tokens[position] instanceof RightSquareBracketToken) {
			result.setRightBracket(tokens[position]);
			position++;
			return [result, position];
		}
		const arrayItem = new ArrayItem();
		const [value, move] = getValue(tokens.slice(position), true);
		if (value !== null) {
			arrayItem.setValue(value);
			position += move;
			movedForward = true;
		}
		if (position < tokens.length && tokens[position] instanceof CommaToken){
			arrayItem.setComma(tokens[position]);
			position++;
			movedForward = true;
		}
		if (movedForward) {
			result.addItem(arrayItem);
		}
	}
	return [result, position];
}

export default buildTree;