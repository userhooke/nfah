export default (ast) =>
  ast.body[0].test.inferredType.kind === "Boolean" &&
  ast.body[1].test.inferredType.kind === "Boolean";
