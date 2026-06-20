export default (error) =>
  `
Type of {
    "type": "StringLiteral",
    "value": "5",
    "valueType": "String"
} doesn't match the expected {
    "type": "Identifier",
    "name": "x",
    "valueType": "Number"
}`;
