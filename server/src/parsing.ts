export enum Token {
  LeftBracket,
  RightBracket,
  LeftSquareBracket,
  RightSquareBracket,
  Colon,
  Comma,
  String,
  FreeText,
  Null,
  Integer,
  PrecisionNumber,
  Bool
}

export class TokenInfo {
  token: Token;
  value: string;
  position: number;
  length: number;

  constructor(token: Token, value: string, position: number) {
    this.token = token;
    this.value = value;
    this.position = position;
    this.length = value.length;
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

class DocumentIterator {
  document: string;
  position: number;
  tokenPosition: number;

  constructor(document: string) {
    this.document = document;
    this.position = -1;
    this.tokenPosition = 0;
  }

  getNext(): string {
    this.position++;
    this.tokenPosition = this.position;
    let value = this.document[this.position];
    return value;
  }

  tryGetString(): [string, boolean] {
    let depth = 1;
    let text = '"';
    while (true) {
      if (this.document[this.position + depth] === '"'){
        if (this.isTokenBreaker(depth + 1)) {
          text += '"';
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

  tryGetSpecifiedWord(word: string): [string, boolean] {
    if (this.document.slice(this.position, this.position + word.length) === word && this.isTokenBreaker(word.length)){
      this.position += (word.length - 1);
      return [word, true];
    }
    return ["", false];
  }

  getFreeText(): string {
    let depth = 1;
    let text = this.document[this.position];
    while (this.position + depth < this.document.length) {
      if (this.isTokenBreaker(depth)) {
        break;
      }
      else {
        text += this.document[this.position + depth];
        depth++;
      }
    }
    this.position += (depth - 1);
    return text;
  }

  tryGetNumber(): [string, boolean, Token] {
    // I considered regular expressions here, I wrote it this way to not have to check text few times,
    // but as the code looks now more scary than regex I may change it later

    let numberText = this.document[this.position];
    let depth = 1;
    let isNumber = true;
    let containsDot = false;
    while (true) {
      if (this.isTokenBreaker(depth)) {
        break;
      }
      let nextValue = this.document[this.position + depth];
      if (nextValue.charCodeAt(0) >= 48 && nextValue.charCodeAt(0) <= 57){
        numberText += nextValue;
        depth++;
      }
      else if (nextValue === ".") {
        if (containsDot) {
          isNumber = false;
          break;
        }
        containsDot = true;
        numberText += nextValue;
        depth++;
      }
      else {
        isNumber = false;
        break;
      }
    }
    if (isNumber && numberText !== "-") {
      var ignoringMinusStart = (numberText[0] === "-") ? 1 : 0;
      if (
        containsDot && numberText[numberText.length - 1] !== "." && (
          (numberText[ignoringMinusStart] !== "0")
          || (numberText[ignoringMinusStart] === "0" && numberText[ignoringMinusStart + 1] === ".")
        )
      ) {
        this.position += (depth - 1);
        return [numberText, true, Token.PrecisionNumber];
      }
      if (!containsDot && (
          (numberText[ignoringMinusStart] !== "0")
          || (numberText[ignoringMinusStart] === "0" && numberText.length === ignoringMinusStart + 1)
        )
      ){
        this.position += (depth - 1);
        return [numberText, true, Token.Integer];
      }
    }
    return ["", false, Token.FreeText];
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
  let iterator = new DocumentIterator(document);
  while (true) {
    var symbol = iterator.getNext()
    switch (symbol) {
      case '{':
        tokens.push(new TokenInfo(Token.LeftBracket, '{', iterator.tokenPosition));
        break;
      case '}':
        tokens.push(new TokenInfo(Token.RightBracket, '}', iterator.tokenPosition));
        break;
      case '[':
        tokens.push(new TokenInfo(Token.LeftSquareBracket, '[', iterator.tokenPosition));
        break;
      case ']':
        tokens.push(new TokenInfo(Token.RightSquareBracket, ']', iterator.tokenPosition));
        break;
      case ':':
        tokens.push(new TokenInfo(Token.Colon, ':', iterator.tokenPosition));
        break;
      case ',':
        tokens.push(new TokenInfo(Token.Comma, ',', iterator.tokenPosition));
        break;
      case '"':
        var [value, ok] = iterator.tryGetString();
        if (ok) {
          tokens.push(new TokenInfo(Token.String, value, iterator.tokenPosition));
        }
        else {
          tokens.push(new TokenInfo(Token.FreeText, iterator.getFreeText(), iterator.tokenPosition));
        }
        break;
      case " ":
      case "\t":
      case "\n":
      case "\r":
        break;
      case "n":
        var [value, ok] = iterator.tryGetSpecifiedWord("null");
        if (ok) {
          tokens.push(new TokenInfo(Token.Null, value, iterator.tokenPosition));
        }
        else {
          tokens.push(new TokenInfo(Token.FreeText, iterator.getFreeText(), iterator.tokenPosition));
        }
        break;
      case "t":
      case "f":
        var searchedWord = (symbol === "t") ? "true" : "false";
        var [value, ok] = iterator.tryGetSpecifiedWord(searchedWord);
        if (ok) {
          tokens.push(new TokenInfo(Token.Bool, value, iterator.tokenPosition));
        }
        else {
          tokens.push(new TokenInfo(Token.FreeText, iterator.getFreeText(), iterator.tokenPosition));
        }
        break;
      case "-":
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        var [value, ok, token] = iterator.tryGetNumber();
        if (ok) {
          tokens.push(new TokenInfo(token, value, iterator.tokenPosition));
        }
        else {
          tokens.push(new TokenInfo(Token.FreeText, iterator.getFreeText(), iterator.tokenPosition));
        }
        break;
      default:
        tokens.push(new TokenInfo(Token.FreeText, iterator.getFreeText(), iterator.tokenPosition));
    }
    if (iterator.end()) {
      break;
    }
  }

  return tokens.getTokens();
}

export default tokenize;