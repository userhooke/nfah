export default (ast) =>
  ast.body[0].inferredType.kind === "Number" &&
  ast.body[1].inferredType.kind === "Number" &&
  ast.body[2].inferredType.kind === "Number" &&
  ast.body[3].inferredType.kind === "Number" &&
  ast.body[4].inferredType.kind === "String";
