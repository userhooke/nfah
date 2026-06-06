# nfah

nfah is an experiment programming language implemented as a tokenizer, parser,
and tree-walking interpreter in JavaScript.

The current language is small and expression-oriented. Blocks are first-class
values, functions are closures, and object-like state is represented by nested
environments.

## Tour

### Values

```nfah
n = 12
s = "Hello world!"
t = true
f = false
```

Numbers are unsigned integers. Strings use double quotes. Booleans are the
literal values `true` and `false`.

Identifiers start with a letter and may contain letters, digits, `_`, `/`, `-`,
and `?`.

```nfah
less? = true
path/name = "ok"
```

### Comments

```nfah
// line comment

/*
  block comment
*/
```

Whitespace separates tokens. There are no semicolons.

### Assignment

```nfah
a = 12
b = a
```

Assignment stores a value in the current environment. Reading an identifier walks
outward through parent environments until the name is found.

A bare expression is also a statement. Its value is stored under the next numeric
index in the current environment.

```nfah
12
"hello"
```

This creates entries `0 = 12` and `1 = "hello"` in the current environment.

### Blocks

```nfah
config = {
  host = "localhost"
  port = 8080
}
```

A block creates a nested environment. Its parent is the environment where the
block is evaluated. The block expression evaluates to that nested environment.

Names inside a block can read outer names:

```nfah
a = 12
b = 13
c = {
  a = b
  b = 20
}
```

Here `c.a` is `13`, because `b` is read from the outer environment before the
inner `b = 20` assignment exists.

### Property Access

```nfah
a = {
  b = 12
}

c = a.b
a.d = 15
```

Dot access reads and writes fields on block environments.

### Functions

Functions use `=>`.

```nfah
foo = x => sum({ a = x b = 25 })
result = foo(5)
```

Each function takes zero or one argument. For multiple inputs, pass a block:

```nfah
add3 = xs => sum(xs)
result = add3({
  12
  13
  5
})
```

Because bare expressions are assigned numeric indexes, the argument block above
contains `0 = 12`, `1 = 13`, and `2 = 5`.

Zero-argument function shorthand:

```nfah
answer ==> 23
result = answer()
```

`==>` is tokenized as `=` followed by `=>`, so it means "assign a no-argument
function".

Function bodies can be single expressions or blocks:

```nfah
value = x => x

make = x => {
  result = x
}
```

A block-bodied function returns the block environment.

Functions use lexical scope:

```nfah
x = 10

f ==> x

g ==> {
  x = 20
  fresult = f()
}

gresult = g()
```

`gresult.fresult` is `10`, because `f` reads `x` from the environment where `f`
was declared.

### Calls

```nfah
foo()
foo(5)
global.a.e()
```

Calls can be chained. Method calls are normal property reads followed by calls;
there is no special `this` binding.

### Conditionals

```nfah
if true then a = 12 else a = 13
if false then b = 12
```

Only boolean values, `true` and `false`, are accepted
as conditions. A non-boolean condition errors:

```nfah
if 1 then a = 1 else a = 0
```

Error:

```text
Value "1" is not a BooleanLiteral
```

## Semantics

- A program evaluates statements in order and returns the global environment.
- An assignment returns the assigned value.
- A block evaluates statements in a new child environment and returns that child
  environment.
- A function value stores its parameter, body, and declaration environment.
- A function call evaluates the argument in the caller environment, then runs the
  body in a new activation environment whose parent is the declaration
  environment.
- Identifier lookup resolves through parent environments.
- Property lookup uses dot access on environment records.
- Blocks plus numeric indexes cover array-like data.
