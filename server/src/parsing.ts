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

  constructor(token: Token, value: string | null = null) {
    this.token = token;
    this.value = value;
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

function isTokenBreaker(document: string, position: number): boolean {
  if (position < 0 || document.length <= position) {
    return true;
  }
  
  return [' ', '\t', '\n', '\r', '}', ']', ',', '{', '[', ':'].includes(document[position]);
}

export function tokenize(document: string): TokenInfo[] {
  if (document.length === 0) {
    return []
  }

  let position = 0;
  let tokens = new TokenInfoContainer();
  let insideString = false;
  let textContainer = new TextContainer();
  while (true) {
    switch (document[position]) {
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
        if (insideString) {
          tokens.push(textContainer.endString());
          insideString = false;
        }
        else if (isTokenBreaker(document, position - 1)){
          insideString = true;
        }
        else {
          textContainer.push(document[position]);
        }
        break;
      case " ":
        tokens.push(textContainer.endFreeText());
        break;
      case "\t":
      case "\n":
      case "\r":
        tokens.push(textContainer.endFreeText());
        break;
      case "n":
        if (!insideString && isTokenBreaker(document, position - 1) && position + 3 <= document.length && 
          document[position + 1] === 'u' &&
          document[position + 2] === 'l' &&
          document[position + 3] === 'l') {
          if (isTokenBreaker(document, position+4)){
            tokens.push(new TokenInfo(Token.Null));
            position += 3;
            break;
          }
        }
        textContainer.push(document[position]);
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
        if (isTokenBreaker(document, position - 1)) {
          let numberText = document[position];
          let numberDepth = 1;
          let isInt = true;
          while (true) {
            let numberPosition = position + numberDepth;
            if (isTokenBreaker(document, numberPosition)) {
              break;
            }
            else if (document.charCodeAt(numberPosition) >= 48 && document.charCodeAt(numberPosition) <= 57){
              numberText += document[numberPosition];
              numberDepth++;
            }
            else {
              isInt = false;
              break;
            }
          }
          if (isInt && numberText !== '-') {
            tokens.push(new TokenInfo(Token.Integer, numberText));
            position += (numberDepth - 1);
            break;
          }
        }
        textContainer.push(document[position]);
        break;
      default:
        textContainer.push(document[position]);
    }
    position++;
    if (position >= document.length) {
      tokens.push(textContainer.endFreeText());
      break;
    }
  }

  return tokens.getTokens();
}

export default tokenize;