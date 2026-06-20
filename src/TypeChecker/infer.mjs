import {
  NumberType,
  StringType,
  BooleanType,
  ObjectType,
  FunctionType,
  TypeVar,
} from "./types.mjs";
import { unify } from "./unify.mjs";
import { TypeEnvironment } from "./TypeEnvironment.mjs";

export function infer(node, env) {
  switch (node.type) {
    case "Program":
      return {
        ...node,
        body: node.body.map((statement) => infer(statement, env)),
      };

    case "AssignmentStatement": {
      const right = infer(node.right, env);
      const rightType = right.inferredType;

      if (!node.left) {
        if (env.listType) {
          unify(env.listType, rightType);
        } else {
          env.listType = rightType;
        }

        return {
          ...node,
          left: null,
          right,
          inferredType: rightType,
        };
      }

      if (node.left.type === "MemberExpression") {
        const left = infer(node.left, env);

        unify(left.inferredType, rightType);

        return {
          ...node,
          left,
          right,
          inferredType: rightType,
        };
      }

      if (node.left.type !== "Identifier") {
        throw new Error(`Assignment to ${node.left.type} not implemented yet`);
      }

      const existingType = env.lookupLocal(node.left.name);

      let left;

      if (existingType) {
        unify(existingType, rightType);

        left = {
          ...node.left,
          inferredType: existingType,
        };
      } else {
        env.define(node.left.name, rightType);

        left = {
          ...node.left,
          inferredType: rightType,
        };
      }

      return {
        ...node,
        left,
        right,
        inferredType: rightType,
      };
    }

    case "CallExpression": {
      const callee = infer(node.callee, env);
      const argument = node.argument ? infer(node.argument, env) : null;

      const returnType = TypeVar("return");

      unify(
        callee.inferredType,
        FunctionType(argument?.inferredType ?? null, returnType),
      );

      return {
        ...node,
        callee,
        argument,
        inferredType: returnType,
      };
    }

    case "BlockExpression": {
      const blockEnv = new TypeEnvironment(env);
      const body = node.body.map((statement) => infer(statement, blockEnv));

      const blockType = ObjectType({
        listType: blockEnv.listType ?? TypeVar("list"),
      });

      for (const [name, type] of blockEnv.bindings) {
        blockType.fields.set(name, type);
      }

      let returnType = null;

      for (const statement of body) {
        if (!statement.returnType) continue;

        if (returnType) {
          unify(returnType, statement.returnType);
        } else {
          returnType = statement.returnType;
        }
      }

      return {
        ...node,
        body,
        inferredType: returnType ?? blockType,
      };
    }

    case "MemberExpression": {
      const object = infer(node.object, env);
      const fieldType = TypeVar(node.property.name);

      const expectedObject = ObjectType({
        fields: new Map([[node.property.name, fieldType]]),
      });

      unify(object.inferredType, expectedObject);

      return {
        ...node,
        object,
        property: {
          ...node.property,
          inferredType: fieldType,
        },
        inferredType: fieldType,
      };
    }

    case "ReturnStatement": {
      const argument = infer(node.argument, env);

      return {
        ...node,
        argument,
        returnType: argument.inferredType,
      };
    }

    case "IfStatement": {
      const test = infer(node.test, env);
      unify(test.inferredType, BooleanType);

      const consequent = infer(node.consequent, env);
      const alternate = node.alternate ? infer(node.alternate, env) : null;

      let returnType = consequent.returnType ?? null;

      if (alternate?.returnType) {
        if (returnType) {
          unify(returnType, alternate.returnType);
        } else {
          returnType = alternate.returnType;
        }
      }

      return {
        ...node,
        test,
        consequent,
        alternate,
        returnType,
      };
    }

    case "FunctionDeclaration": {
      const fnEnv = new TypeEnvironment(env);

      let param = null;
      let paramType = null;

      if (node.param) {
        paramType = TypeVar(node.param.name);

        param = {
          ...node.param,
          inferredType: paramType,
        };

        fnEnv.define(node.param.name, paramType);
      }

      const body = infer(node.body, fnEnv);

      return {
        ...node,
        param,
        body,
        inferredType: FunctionType(paramType, body.inferredType),
      };
    }

    case "NumericLiteral":
      return {
        ...node,
        inferredType: NumberType,
      };

    case "StringLiteral":
      return {
        ...node,
        inferredType: StringType,
      };

    case "BooleanLiteral":
      return {
        ...node,
        inferredType: BooleanType,
      };

    case "Identifier": {
      const type = env.lookup(node.name);

      if (!type) {
        throw new Error(`"${node.name}" is not defined.`);
      }

      return {
        ...node,
        inferredType: type,
      };
    }

    default:
      throw new Error(`Type inference not implemented for ${node.type}`);
  }
}
