export class Environment {
  constructor(parent = null) {
    this.record = {};
    this.list = [];
    this.parent = parent;
  }

  assign(name, value) {
    this.record[name] = value;
    return value;
  }

  assignIndexed(value) {
    this.list.push(value);
    return value;
  }

  lookup(name) {
    return this.resolve(name)?.record[name];
  }

  resolve(name) {
    if (this.record.hasOwnProperty(name)) {
      return this;
    }

    if (!this.parent) {
      return null;
    }

    return this.parent.resolve(name);
  }
}

export class DefaultGlobalEnv extends Environment {
  constructor() {
    super();

    this.assign("sum", this.sum);
    this.assign("print", this.print);
    this.assign("less?", this.isLess);
    this.assign("length", this.length);
  }

  sum(arg) {
    return arg.list.reduce((acc, current) => acc + current, 0);
  }

  print(arg) {
    console.log(arg);
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
    }
  }
}
