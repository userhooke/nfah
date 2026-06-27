import { prune } from "./types.mjs";

export function unify(left, right) {
  left = prune(left);
  right = prune(right);

  if (left === right) {
    return left;
  }

  if (left.kind === "TypeVar") {
    left.instance = right;
    return right;
  }

  if (right.kind === "TypeVar") {
    right.instance = left;
    return left;
  }

  if (left.kind !== right.kind) {
    throw new Error(`Type mismatch: ${left.kind} vs ${right.kind}`);
  }

  if (left.kind === "Function") {
    const leftHasParam = left.paramType !== null;
    const rightHasParam = right.paramType !== null;

    if (leftHasParam !== rightHasParam) {
      throw new Error("Function arity mismatch");
    }

    if (leftHasParam) {
      unify(left.paramType, right.paramType);
    }

    unify(left.returnType, right.returnType);
    return left;
  }

  if (left.kind === "Block") {
    unify(left.listType, right.listType);

    for (const [name, rightField] of right.fields) {
      const leftField = left.fields.get(name);

      if (leftField) {
        unify(leftField, rightField);
      } else {
        left.fields.set(name, rightField);
      }
    }

    return left;
  }

  return left;
}
