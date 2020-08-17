export enum Token {
  LeftBracket,
  RightBracket,
  LeftSquareBracket,
  RightSquareBracket,
  Colon,
  Comma,
  String,
  Null,
  FreeText
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

export function tokenize(document: string): TokenInfo[] {
  if (document.length === 0) {
    return []
  }

  let position = 0;
  let tokens = new TokenInfoContainer();
  let insideString = false;
  let textContainer = new TextContainer();
  // let text = "";
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
        else {
          tokens.push(textContainer.endFreeText());
          insideString = true;
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
        if (!insideString && position + 3 <= document.length && 
          document[position + 1] === 'u' &&
          document[position + 2] === 'l' &&
          document[position + 3] === 'l') {
            if (position + 4 === document.length){
              tokens.push(new TokenInfo(Token.Null));
              position += 3;
              break;
            }
            else if (document[position + 4] === ' ' || document[position + 4] === '\t' ||
              document[position + 4] === '\n' || document[position + 4] === '}' || document[position + 4] === ']'){
                tokens.push(new TokenInfo(Token.Null));
                position += 3;
                break;
            }
          }
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