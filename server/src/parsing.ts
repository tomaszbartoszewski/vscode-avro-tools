export enum Token {
  LeftBracket,
  RightBracket,
  LeftSquareBracket,
  RightSquareBracket,
  Colon,
  Comma,
  String,
  Null,
  FreeText,
  Integer
}

export class TokenInfo {
  token: Token;
  value: string | null;
  line: number;
  column: number;
  length: number;

  constructor(token: Token, value: string | null = null) {
    this.token = token;
    this.value = value;
    // line: number, column: number,
    this.line = 0;
    this.column = 0;
    this.length = 0;
  }
}

class TokenInfoContainer {
  tokens: TokenInfo[];

  constructor() {
    this.tokens = [];
  }

  push(token: TokenInfo | null) {
    if (token != null) {
      this.tokens.push(token);
    }
  }

  getTokens(): TokenInfo[] {
    return this.tokens;
  }
}

class TextContainer {
  text: string;

  constructor(){
    this.text = "";
  }

  push(char: string) {
    this.text += char;
  }

  endString(): TokenInfo{
    let result = new TokenInfo(Token.String, this.text);
    this.text = "";
    return result;
  }

  endFreeText(): TokenInfo | null {
    if (this.text.length > 0) {
      let result = new TokenInfo(Token.FreeText, this.text);
      this.text = ""
      return result;
    }
    return null
  }
}

class DocumentIterator {
  document: string;
  position: number;
  line: number;
  column: number;
  nextLine: number;
  nextColumn: number;

  constructor(document: string) {
    this.document = document;
    this.position = -1;
    this.line = 0;
    this.column = -1;
    this.nextLine = 0;
    this.nextColumn = 0;
  }

  getNext(): string {
    this.line = this.nextLine;
    this.column = this.nextColumn;
    this.position++;
    let value = this.document[this.position];
    if (value === '\n') {
      this.nextLine++;
      this.nextColumn = 0;
    }
    else if (value !== '\r') {
      this.nextColumn++;
    }
    return value;
  }

  getCurrent(): string {
    return this.document[this.position];
  }

  tryGetString(): [string, boolean] {
    if (!this.isTokenBreaker(-1)) {
      return ["", false];
    }
    let depth = 1;
    let text = "";
    while (true) {
      if (this.document[this.position + depth] === "\""){
        if (this.isTokenBreaker(depth + 1)) {
          this.position += depth;
          return [text, true];
        }
        else {
          return ["", false];
        }
      }
      else if (this.isTokenBreaker(depth)) {
        return ["", false];
      }
      else {
        text += this.document[this.position + depth];
        depth++;
      }
      if (this.position + depth >= this.document.length) {
        break;
      }
    }
    return ["", false];
  }

  tryGetNull(): [string, boolean] {
    if (this.document.slice(this.position, 4) === "null" && this.isTokenBreaker(4)){
      this.position += 4;
      return ["null", true];
    }
    return ["", false];
  }

  scan(length: number): string {
    return this.document.slice(this.position, length);
  }

  moveCursor(length: number) {
    this.position += length;
  }

  end(): boolean {
    return this.position + 1 >= this.document.length;
  }

  isTokenBreaker(jump: number): boolean {
    let toCheck = this.position + jump;
    if (toCheck < 0 || this.document.length <= toCheck) {
      return true;
    }
    
    return [' ', '\t', '\n', '\r', '}', ']', ',', '{', '[', ':'].includes(this.document[toCheck]);
  }
}

export function tokenize(document: string): TokenInfo[] {
  if (document.length === 0) {
    return []
  }

  let tokens = new TokenInfoContainer();
  let textContainer = new TextContainer();
  let iterator = new DocumentIterator(document);
  let value = "";
  let ok = false;
  while (true) {
    switch (iterator.getNext()) {
      case '{':
        tokens.push(textContainer.endFreeText());
        tokens.push(new TokenInfo(Token.LeftBracket));
        break;
      case '}':
        tokens.push(textContainer.endFreeText());
        tokens.push(new TokenInfo(Token.RightBracket));
        break;
      case '[':
        tokens.push(textContainer.endFreeText());
        tokens.push(new TokenInfo(Token.LeftSquareBracket));
        break;
      case ']':
        tokens.push(textContainer.endFreeText());
        tokens.push(new TokenInfo(Token.RightSquareBracket));
        break;
      case ':':
        tokens.push(textContainer.endFreeText());
        tokens.push(new TokenInfo(Token.Colon));
        break;
      case ',':
        tokens.push(textContainer.endFreeText());
        tokens.push(new TokenInfo(Token.Comma));
        break;
      case '"':
        [value, ok] = iterator.tryGetString();
        if (ok) {
          tokens.push(new TokenInfo(Token.String, value));
        }
        else {
          textContainer.push(iterator.getCurrent());
        }
        break;
      case " ":
      case "\t":
      case "\n":
      case "\r":
        tokens.push(textContainer.endFreeText());
        break;
      case "n":
        [value, ok] = iterator.tryGetNull();
        if (ok) {
          tokens.push(new TokenInfo(Token.Null));
        }
        else {
          textContainer.push(iterator.getCurrent());
        }
        break;
      case "-":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        if (iterator.isTokenBreaker(-1)) {
          let numberText = iterator.getCurrent();
          let numberDepth = 1;
          let isInt = true;
          while (true) {
            if (iterator.isTokenBreaker(1)) {
              break;
            }
            let nextValue = iterator.getNext();
            if (nextValue.charCodeAt(0) >= 48 && nextValue.charCodeAt(0) <= 57){
              numberText += nextValue;
              numberDepth++;
            }
            else {
              isInt = false;
              break;
            }
          }
          if (isInt && numberText !== '-') {
            tokens.push(new TokenInfo(Token.Integer, numberText));
            break;
          }
          else {
            iterator.moveCursor(-numberDepth);
          }
        }
        textContainer.push(iterator.getCurrent());
        break;
      default:
        textContainer.push(iterator.getCurrent());
    }
    if (iterator.end()) {
      tokens.push(textContainer.endFreeText());
      break;
    }
  }

  return tokens.getTokens();
}

export default tokenize;