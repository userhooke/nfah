export default (error) =>
  error ===
  `
Type of {
    "type": "StringLiteral",
    "name": "b",
    "value": "Hallo!",
    "valueType": "String"
} doesn't match the expected {
    "type": "NumericLiteral",
    "name": "a",
    "value": 120,
    "valueType": "Number"
}`;
