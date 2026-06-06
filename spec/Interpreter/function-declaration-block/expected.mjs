export default (state) =>
  state.record.foo.param.value === "x" &&
  state.record.foo.body.type === "BlockExpression" &&
  state.record.foo.body.body[0].left.type === "Identifier" &&
  state.record.foo.body.body[0].right.type === "CallExpression";
