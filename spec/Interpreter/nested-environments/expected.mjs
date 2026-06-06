export default (state) =>
  state.record.a === 12 &&
  state.record.b === 13 &&
  state.record.c.record.a === 13 &&
  state.record.c.record.b === 20;
