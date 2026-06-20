export default (ast) =>
  ast.body[0].inferredType.kind === "Block" &&
  ast.body[0].inferredType.listType.kind === "Number" &&
  ast.body[1].inferredType.kind === "Block" &&
  ast.body[1].inferredType.fields.get("a").kind === "Number" &&
  ast.body[1].inferredType.fields.get("b").kind === "Number";
