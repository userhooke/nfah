import { createDefaultEnv } from "./TypeEnvironment.mjs";
import { resolveDeep } from "./types.mjs";
import { infer } from "./infer.mjs";

export function checkTypes(ast, env = createDefaultEnv()) {
  const typedAst = infer(ast, env);
  return finalizeTypes(typedAst);
}

export function finalizeTypes(node) {
  if (!node || typeof node !== "object") {
    return node;
  }

  if (node.inferredType) {
    node.inferredType = resolveDeep(node.inferredType);
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      value.forEach(finalizeTypes);
    } else if (value && typeof value === "object") {
      finalizeTypes(value);
    }
  }

  return node;
}
