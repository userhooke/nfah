export default (ast) =>
  ast.body[1].left.object.inferredType.kind === "Block" &&
  ast.body[1].left.object.inferredType.fields.get("b").kind === "Number" &&
  ast.body[1].right.inferredType.kind === "Number";
