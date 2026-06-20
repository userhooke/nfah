export default (ast) =>
  ast.body[0].inferredType.kind === "Function" &&
  ast.body[0].inferredType.paramType.kind === "Number" &&
  ast.body[0].inferredType.returnType.kind === "Number" &&
  ast.body[1].inferredType.kind === "Number";
