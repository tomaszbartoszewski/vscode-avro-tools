export abstract class Token {
	value: string;
	position: number;
	length: number;

	constructor(value: string, position: number) {
		this.value = value;
		this.position = position;
		this.length = value.length;
	}

	getStartPosition(): number {
		return this.position;
	}

	getEndPosition(): number {
		return this.position + this.length;
	}
}

export class LeftBracketToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class RightBracketToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class LeftSquareBracketToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class RightSquareBracketToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class ColonToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class CommaToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class StringToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class FreeTextToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class NullToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class IntegerToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class PrecisionNumberToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}

export class BoolToken extends Token {
	constructor(value: string, position: number) {
		super(value, position);
	}
}