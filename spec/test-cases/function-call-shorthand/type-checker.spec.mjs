export default (ast) =>
  ast.body[0].valueType === "Function" &&
  ast.body[1].left.valueType === "Number";
