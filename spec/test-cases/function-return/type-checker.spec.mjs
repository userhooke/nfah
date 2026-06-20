export default (ast) =>
  ast.body[0].inferredType.kind === "Number" &&
  ast.body[1].inferredType.kind === "Function" &&
  ast.body[1].inferredType.paramType.kind === "Number" &&
  ast.body[1].inferredType.returnType.kind === "Number" &&
  ast.body[2].inferredType.kind === "Number";
