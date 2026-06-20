import { FunctionType, ObjectType, NumberType, BooleanType } from "./types.mjs";

export class TypeEnvironment {
  constructor(parent = null) {
    this.parent = parent;
    this.bindings = new Map();
    this.listType = null;
  }

  define(name, type) {
    this.bindings.set(name, type);
    return type;
  }

  lookupLocal(name) {
    return this.bindings.get(name) ?? null;
  }

  lookup(name) {
    return this.lookupLocal(name) ?? this.parent?.lookup(name) ?? null;
  }
}

export function createDefaultEnv() {
  const env = new TypeEnvironment();

  env.define(
    "sum",
    FunctionType(ObjectType({ listType: NumberType }), NumberType),
  );

  env.define(
    "less?",
    FunctionType(ObjectType({ listType: NumberType }), BooleanType),
  );

  return env;
}
