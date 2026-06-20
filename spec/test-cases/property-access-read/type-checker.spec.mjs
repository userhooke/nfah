export default (ast) =>
  ast.body[0].inferredType.kind === "Block" &&
  ast.body[1].inferredType.kind === "Number";
