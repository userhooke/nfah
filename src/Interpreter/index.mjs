import { Environment, DefaultGlobalEnv } from "./Environment.mjs";

export function evaluate(ast, env = new DefaultGlobalEnv()) {
  switch (ast.type) {
    case "Program": {
      for (const stmt of ast.body) {
        evaluate(stmt, env);
      }
      return env;
    }

    case "BlockExpression": {
      const nestedEnv = new Environment(env);
      for (const stmt of ast.body) {
        const result = evaluate(stmt, nestedEnv);

        if (result instanceof ReturnSignal) {
          return result;
        }
      }
      return nestedEnv;
    }

    case "IfStatement": {
      const test = evaluate(ast.test, env);
      if (test === "true") {
        return evaluate(ast.consequent, env);
      }

      if (!ast.alternate) {
        return;
      }

      if (test === "false") {
        return evaluate(ast.alternate, env);
      }

      throw new Error(`Value "${test}" is not a BooleanLiteral`);
    }

    case "AssignmentStatement": {
      if (!ast.left) {
        const value = unwrapReturn(evaluate(ast.right, env));
        return env.assignIndexed(value);
      }

      if (ast.left.type === "Identifier") {
        const name = ast.left.name;
        const value = unwrapReturn(evaluate(ast.right, env));
        return env.assign(name, value);
      }

      if (ast.left.type === "MemberExpression") {
        const memberEnv = evaluate(ast.left.object, env);
        const value = unwrapReturn(evaluate(ast.right, env));
        return memberEnv.assign(ast.left.property.name, value);
      }

      throw new Error(
        `Trying to assign to "${ast.left.type}", this is not supported.`,
      );
    }

    case "CallExpression": {
      const fn = evaluate(ast.callee, env);

      let arg;
      if (ast.argument) {
        arg = unwrapReturn(evaluate(ast.argument, env));
      }

      // native built-in function call
      if (typeof fn === "function") {
        return fn(arg, env);
      }

      const activationEnv = new Environment(fn.env); // static scope

      if (fn.param) {
        activationEnv.assign(fn.param.name, arg);
      }

      const result = unwrapReturn(evaluate(fn.body, activationEnv));
      return result;
    }

    case "FunctionDeclaration": {
      return {
        param: ast.param,
        body: ast.body,
        env, // closure
      };
    }

    case "MemberExpression": {
      const objectEnv = unwrapReturn(evaluate(ast.object, env));
      const value = objectEnv.lookup(ast.property.name);

      return value;
    }

    case "ReturnStatement": {
      return new ReturnSignal(evaluate(ast.argument, env));
    }

    case "NumericLiteral":
    case "BooleanLiteral":
    case "StringLiteral": {
      return ast.value;
    }

    case "Identifier": {
      const id = env.lookup(ast.name);
      if (!id) {
        throw new Error(`"${ast.name}" is not defined.`);
      }
      return id;
    }

    default:
      throw new Error(
        `[Interpreter] Unexpected AST node: "${JSON.stringify(ast, null, 4)}"`,
      );
  }
}

class ReturnSignal {
  constructor(value) {
    this.value = value;
  }
}

function unwrapReturn(value) {
  return value instanceof ReturnSignal ? value.value : value;
}
