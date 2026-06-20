let nextTypeId = 0;

export const NumberType = { kind: "Number" };
export const StringType = { kind: "String" };
export const BooleanType = { kind: "Boolean" };

export function TypeVar(name = null) {
  return {
    kind: "TypeVar",
    id: nextTypeId++,
    name,
    instance: null,
  };
}

export function ObjectType({
  fields = new Map(),
  listType = TypeVar("list"),
} = {}) {
  return {
    kind: "Block",
    fields,
    listType,
  };
}

export function FunctionType(paramType, returnType) {
  return {
    kind: "Function",
    paramType,
    returnType,
  };
}

export function prune(type) {
  if (type.kind === "TypeVar" && type.instance) {
    type.instance = prune(type.instance);
    return type.instance;
  }

  return type;
}

export function resolveType(type) {
  if (type.kind === "TypeVar" && type.instance) {
    type.instance = resolveType(type.instance);
    return type.instance;
  }

  return type;
}

export function resolveDeep(type) {
  type = resolveType(type);

  if (type.kind === "Function") {
    type.paramType = type.paramType ? resolveDeep(type.paramType) : null;
    type.returnType = resolveDeep(type.returnType);
  }

  if (type.kind === "Block") {
    type.listType = resolveDeep(type.listType);

    for (const [name, fieldType] of type.fields) {
      type.fields.set(name, resolveDeep(fieldType));
    }
  }

  return type;
}
