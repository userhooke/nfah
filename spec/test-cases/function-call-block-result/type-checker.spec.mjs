export default (ast) =>
  ast.body[0].inferredType.kind === "Function" &&
  ast.body[1].inferredType.kind === "Block" &&
  ast.body[1].inferredType.fields.get("innerResult").kind === "Number";
