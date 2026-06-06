import { Tokenizer } from "./Tokenizer.mjs";

export function parse(input) {
  const tokenizer = new Tokenizer(input);
  const parser = new Parser(tokenizer);
  return parser.Program();
}

class Parser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.lookahead = this.tokenizer.getNextToken();
  }

  /**
   * Program
   *   : StatementList
   *   ;
   */
  Program() {
    return {
      type: "Program",
      body: this.StatementList(),
    };
  }

  /**
   * StatementList
   *   : Statement
   *   | StatementList Statement
   *   ;
   */
  StatementList(stopLookahead = null) {
    const statementList = [];

    do {
      statementList.push(this.Statement());
    } while (this.lookahead !== null && this.lookahead.type !== stopLookahead);

    return statementList;
  }

  /**
   * Statement
   *   : IfStatement
   *   | ReturnStatement
   *   | AssignmentStatement
   *   ;
   */
  Statement() {
    switch (this.lookahead.type) {
      case "if":
        return this.IfStatement();
      case "return":
        return this.ReturnStatement();
      default:
        return this.AssignmentStatement();
    }
  }

  /**
   * IfStatement
   *   : 'if' RExpression 'then' Statement
   *   | 'if' RExpression 'then' Statement 'else' Statement
   *   ;
   */
  IfStatement() {
    this.eat("if");
    const test = this.RExpression();
    this.eat("then");
    const consequent = this.Statement();
    let alternate = null;

    if (this.lookahead?.type === "else") {
      this.eat("else");
      alternate = this.Statement();
    }

    return {
      type: "IfStatement",
      test,
      consequent,
      alternate,
    };
  }

  /**
   * ReturnStatement
   *   : 'return' RExpression
   *   ;
   */
  ReturnStatement() {
    this.eat("return");
    const argument = this.RExpression();

    return {
      type: "ReturnStatement",
      argument,
    };
  }

  /**
   * AssignmentStatement
   *   : MemberExpression
   *   | MemberExpression "=" RExpression
   *   ;
   */
  AssignmentStatement() {
    const left = this.CallMemberExpression();

    if (this.lookahead?.type !== "=") {
      return {
        type: "AssignmentStatement",
        left: null,
        right: left,
      };
    }

    if (left.type !== "Identifier" && left.type !== "MemberExpression") {
      throw new Error(
        `Invalid left-hand side "${left.type}" in assignment expression`,
      );
    }

    this.eat("=");

    return {
      type: "AssignmentStatement",
      left,
      right: this.RExpression(),
    };
  }

  /**
   * CallMemberExpression
   *   : MemberExpression
   *   : CallExpression
   *   ;
   */
  CallMemberExpression() {
    const member = this.MemberExpression();

    if (this.lookahead?.type === "(") {
      return this.CallExpression(member);
    }

    return member;
  }

  /**
   * CallExpression
   *   : Callee Argument
   *   ;
   *
   * Callee
   *   : MemberExpression
   *   | CallExpression
   *   ;
   */
  CallExpression(callee) {
    let callExpression = {
      type: "CallExpression",
      callee,
      argument: this.Argument(),
    };

    if (this.lookahead?.type === "(") {
      callExpression = this.CallExpression(callExpression);
    }

    return callExpression;
  }

  /**
   * Argument
   *   : '(' OptArgument ')'
   *   ;
   */
  Argument() {
    this.eat("(");

    let argument = null;

    if (this.lookahead?.type !== ")") {
      argument = this.RExpression();
    }

    this.eat(")");

    return argument;
  }

  /**
   * MemberExpression
   *   : Atom
   *   | MemberExpression '.' Identifier
   *   | MemberExpression '[' RExpression ']'
   *   ;
   */
  MemberExpression() {
    let object = this.Atom();

    while (
      this.lookahead?.type === "." ||
      this.lookahead?.type === "[" ||
      this.lookahead?.type === "("
    ) {
      // MemberExpression '.' Identifier
      if (this.lookahead?.type === ".") {
        this.eat(".");
        const property = this.Identifier();
        object = {
          type: "MemberExpression",
          computed: false,
          object,
          property,
        };
      }

      // MemberExpression '[' RExpression ']'
      if (this.lookahead?.type === "[") {
        this.eat("[");
        const property = this.RExpression();
        this.eat("]");
        object = {
          type: "MemberExpression",
          computed: true,
          object,
          property,
        };
      }

      if (this.lookahead?.type === "(") {
        object = this.CallExpression(object);
      }
    }

    return object;
  }

  /**
   * RExpression
   *   : BlockExpression
   *   | FunctionDeclaration
   *   | CallMemberExpression
   *   ;
   */
  RExpression() {
    let expr = null;

    switch (this.lookahead.type) {
      case "{": {
        expr = this.BlockExpression();
        break;
      }
      case "=>": {
        expr = this.FunctionDeclaration(); // no param
        break;
      }
      default: {
        expr = this.CallMemberExpression();
      }
    }

    if (this.lookahead?.type === "=>") {
      return this.FunctionDeclaration(expr);
    } else {
      return expr;
    }
  }

  /**
   * BlockExpression
   *   : '{' OptStatementList '}'
   *   ;
   */
  BlockExpression() {
    this.eat("{");

    const body = this.lookahead.type !== "}" ? this.StatementList("}") : [];

    this.eat("}");

    return {
      type: "BlockExpression",
      body,
    };
  }

  /**
   * FunctionDeclaration
   *   : '(' OptFormalParameterList ')' '=>' RExpression
   *   ;
   */
  FunctionDeclaration(param = null) {
    //  this.eat('(');
    //  const params = this.FormalParameterList();
    //  this.eat(')');

    this.eat("=>");
    const body = this.RExpression();

    return {
      type: "FunctionDeclaration",
      param,
      body,
    };
  }

  /**
   * Atom
   *   : NumericLiteral
   *   | StringLiteral
   *   | BooleanLiteral
   *   | Identifier
   *   ;
   */
  Atom() {
    switch (this.lookahead.type) {
      case "NUMBER":
        return this.NumericLiteral();
      case "STRING":
        return this.StringLiteral();
      case "true":
      case "false":
        return this.BooleanLiteral(this.lookahead.type);
      case "IDENTIFIER":
        return this.Identifier();
      default:
        throw new Error(`Invalid atom value: "${this.lookahead.value}"`);
    }
  }

  /**
   * Identifier
   *   : IDENTIFIER
   *   ;
   */
  Identifier() {
    const value = this.eat("IDENTIFIER").value;

    return {
      type: "Identifier",
      value,
    };
  }

  /**
   * NumericLiteral
   *   : NUMBER
   *   ;
   */
  NumericLiteral() {
    const token = this.eat("NUMBER");
    return {
      type: "NumericLiteral",
      value: Number(token.value),
    };
  }

  /**
   * StringLiteral
   *   : STRING
   *   ;
   */
  StringLiteral() {
    const token = this.eat("STRING");
    return {
      type: "StringLiteral",
      value: token.value.slice(1, -1), // remove quotes
    };
  }

  /**
   * BooleanLiteral
   *   : 'true'
   *   | 'false'
   *   ;
   */
  BooleanLiteral(value) {
    if (value === "true") {
      this.eat("true");
    } else {
      this.eat("false");
    }

    return {
      type: "BooleanLiteral",
      value,
    };
  }

  eat(tokenType) {
    const token = this.lookahead;

    if (token === null) {
      throw new Error(`Unexpected end of input, expected: ${tokenType}`);
    }

    if (token.type !== tokenType) {
      throw new Error(
        `Unexpected token: "${token.value}", expected: "${tokenType}"`,
      );
    }

    this.lookahead = this.tokenizer.getNextToken();

    return token;
  }
}
