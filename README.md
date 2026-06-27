# nfah

nfah is an experimental programming language implemented as a tokenizer, parser,
static type checker with type inference, and tree-walking interpreter in JavaScript.

The current language is small and expression-oriented. Blocks are first-class
values, functions are closures, and blocks are also the primary scoping
mechanism.

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

Identifiers start with a letter and may contain letters, digits, `_`, `-`,
and `?`.

```nfah
iden-ti_fiers = "_-?"
less? = true
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

Assignment stores a named field in the current block. Reading an identifier walks
outward through parent blocks until the name is found.

Each block is both a record and a list. Named assignments create fields. Bare
expressions append list items.

```nfah
12
20
```

This creates entries `12` and `20` in the list of the current block.

### Blocks

```nfah
config = {
  host = "localhost"
  port = 8080
}
```

A block creates a nested scope. Its parent is the block where it is evaluated.
Without `return`, a block expression evaluates to the block itself.

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

Dot access reads and writes fields on blocks.

### Functions

Functions use `=>`.

```nfah
foo = x => sum({ x 25 })
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

Because bare expressions are assigned to a list, the argument block above
contains `12`, `13`, and `5`.

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

A block-bodied function returns the block itself unless the block calls `return`.

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
api.handler()
```

Calls can be chained. Method calls are normal property reads followed by calls.
There is no special `this` binding.

### Return statements

Every block may contain a special statement: `return`.

```
a = {
    b = 120
    return b
}
```

In this example, `a = 120`, because the block immediately returns.

In a similar fashion we can use `return` in a function:

```
min = x => {
    if less?({ x 10 })
        then return 10
        else return x
}

result = min(5)
```

There is no concept of `undefined` or `null` in nfah. If a function does not call
`return`, its return value is the function block itself.

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

### Type inference

In nfah, there is no function overloading and no generic types. This constraint
makes full type inference relatively straightforward. Base types are defined by
built-in functions. Arithmetic and comparisons are ordinary function calls, not
operators. For example:

```
callbackFn = x => sum({ x 10 })
fn = cb => cb(5)
result = fn(callbackFn)

```

`sum` is a built-in function that accepts an environment containing a list of
numbers and returns a number. From this, we can infer that the `x` parameter in
`callbackFn` must be a `Number`, and that `callbackFn` also returns a `Number`.
On the second line, `cb(5)` tells us that `cb` must be a function that accepts a
`Number`. On the third line, we can check whether `callbackFn` matches the type
that `fn` expects.

The inferred types are:

```text
callbackFn: Function(Number, Number)
fn: Function(Function(Number, Number), Number)
result: Number
```
