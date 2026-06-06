import { DefaultGlobalEnv, Environment } from "./Environment.mjs";

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
        evaluate(stmt, nestedEnv);
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
        const value = evaluate(ast.right, env);
        return env.assignIndexed(value);
      }

      if (ast.left.type === "Identifier") {
        const name = ast.left.value;
        const value = evaluate(ast.right, env);
        return env.assign(name, value);
      }

      if (ast.left.type === "MemberExpression") {
        const memberEnv = evaluate(ast.left.object, env);
        const value = evaluate(ast.right, env);
        return memberEnv.assign(ast.left.property.value, value);
      }

      throw new Error(
        `Trying to assign to "${ast.left.type}", this is not supported.`,
      );
    }

    case "CallExpression": {
      const fn = evaluate(ast.callee, env);

      let arg;
      if (ast.argument) {
        arg = evaluate(ast.argument, env);
      }

      // native built-in function call
      if (typeof fn === "function") {
        return fn(arg, env);
      }

      const activationEnv = new Environment(fn.env); // static scope

      if (fn.param) {
        activationEnv.assign(fn.param.value, arg);
      }

      return evaluate(fn.body, activationEnv);
    }

    case "FunctionDeclaration": {
      return {
        param: ast.param,
        body: ast.body,
        env, // closure
      };
    }

    case "MemberExpression": {
      if (ast.computed) {
        throw new Error(
          `[Interpreter] Computed property access is not implemented: ${JSON.stringify(ast, null, 4)}`,
        );
      }

      const objectEnv = evaluate(ast.object, env);
      const value = objectEnv.lookup(ast.property.value);

      return value;
    }

    case "NumericLiteral":
    case "BooleanLiteral":
    case "StringLiteral": {
      return ast.value;
    }

    case "Identifier": {
      return env.lookup(ast.value);
    }

    default:
      throw new Error(
        `[Interpreter] Unexpected AST node: "${JSON.stringify(ast, null, 4)}"`,
      );
  }
}
