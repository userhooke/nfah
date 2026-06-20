const tokenizerSpec = [
  [/^\s+/, null],

  [/^\/\/.*/, null],
  [/^\/\*[\s\S]*?\*\//, null],

  [/^\{/, "{"],
  [/^\}/, "}"],
  [/^\(/, "("],
  [/^\)/, ")"],

  [/^\./, "."],

  [/^=>/, "=>"],
  [/^=/, "="],

  [/^\bif\b/, "if"],
  [/^\bthen\b/, "then"],
  [/^\belse\b/, "else"],

  [/^\btrue\b/, "true"],
  [/^\bfalse\b/, "false"],

  [/^\breturn\b/, "return"],

  [/^\d+/, "NUMBER"],
  [/^"[^"]*"/, "STRING"],
  [/^[A-Za-z][A-Za-z0-9_?-]*/, "IDENTIFIER"],
];

export class Tokenizer {
  constructor(string) {
    this.string = string;
    this.cursor = 0;
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const string = this.string.slice(this.cursor);

    for (const [regexp, tokenType] of tokenizerSpec) {
      const tokenValue = this.match(regexp, string);

      if (tokenValue === null) {
        continue;
      }

      if (tokenType === null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    throw new Error(`Unexpected token: "${string[0]}"`);
  }

  hasMoreTokens() {
    return this.cursor < this.string.length;
  }

  match(regexp, string) {
    const matched = regexp.exec(string);

    if (matched === null) {
      return null;
    }

    this.cursor += matched[0].length;
    return matched[0];
  }
}
