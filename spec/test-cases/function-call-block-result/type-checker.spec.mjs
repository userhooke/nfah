export default (ast) =>
  ast.body[0].left.valueType === "Function" &&
  ast.body[1].left.valueType === "Block";
