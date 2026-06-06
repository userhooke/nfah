export class Environment {
  constructor(parent = null) {
    this.record = {};
    this.parent = parent;
    this.index = 0;
  }

  assign(name, value) {
    this.record[name] = value;
    return value;
  }

  assignGlobal(name, value) {
    if (this.parent !== null) {
      return this.parent.assignGlobal(name, value);
    }
    this.record[name] = value;
    return value;
  }

  assignIndexed(value) {
    this.record[this.index++] = value;
    return value;
  }

  lookup(name) {
    return this.resolve(name).record[name];
  }

  resolve(name) {
    if (this.record.hasOwnProperty(name)) {
      return this;
    }

    if (this.parent === null) {
      throw new Error(`"${name}" is not defined.`);
    }

    return this.parent.resolve(name);
  }

  resolveGlobal() {
    if (this.parent !== null) {
      return this.parent.resolveGlobal();
    }
    return this;
  }
}

export class DefaultGlobalEnv extends Environment {
  constructor() {
    super();

    this.assign("sum", this.sum);
    this.assign("print", this.print);
    this.assign("debugger", this.debugger);
    this.assign("less?", this.isLess);
    this.assign("length", this.length);
  }

  sum(arg) {
    return Object.values(arg.record).reduce((acc, current) => acc + current, 0);
  }

  print(arg) {
    console.log(arg);
  }

  debugger(arg) {
    debugger;
  }

  isLess(arg) {
    const a = arg.record[0];
    const b = arg.record[1];
    if (a < b) {
      return "true";
    } else {
      return "false";
    }
  }

  length(arg) {
    if (typeof arg === "string") {
      return arg.length;
    } else {
      throw new Error(
        `length for value "${arg}" of type "${typeof arg}" is not implemented.`,
      );
    }
  }
}
