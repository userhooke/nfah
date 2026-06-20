import { parse } from "../src/Parser/index.mjs";
import { checkTypes } from "../src/TypeChecker/index.mjs";
import { evaluate } from "../src/Interpreter/index.mjs";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const currentDirectory = join(
  dirname(fileURLToPath(import.meta.url)),
  "test-cases",
);

async function loadTestFunction(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return (await import(pathToFileURL(filePath))).default;
}

const testCases = await Promise.all(
  readdirSync(currentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const directory = join(currentDirectory, entry.name);
      const input = readFileSync(join(directory, "input.nfah"), "utf8");
      const interpreter = await loadTestFunction(
        join(directory, "interpreter.spec.mjs"),
      );
      const typeChecker = await loadTestFunction(
        join(directory, "type-checker.spec.mjs"),
      );

      return {
        name: entry.name,
        input,
        interpreter,
        typeChecker,
      };
    }),
);

function test(testCase) {
  const ast = parse(testCase.input);

  if (testCase.typeChecker) {
    let typedAST;
    try {
      typedAST = checkTypes(ast);
    } catch (e) {
      typedAST = e.message;
    }
    if (!testCase.typeChecker(typedAST)) {
      throw new Error(`[${testCase.name}] [TypeChecker] ${testCase.input}`);
    }
  } else {
    console.warn(`Missing TypeChecker for ${testCase.name}`);
  }

  if (testCase.interpreter) {
    let result;
    try {
      result = evaluate(ast);
    } catch (e) {
      result = e.message;
    }
    if (!testCase.interpreter(result)) {
      throw new Error(`[${testCase.name}] [Interpreter] ${testCase.input}`);
    }
  } else {
    console.warn(`Missing Interpreter test for ${testCase.name}`);
  }
}

for (const testCase of testCases) {
  try {
    test(testCase);
  } catch (e) {
    console.error(e);
    debugger;
    test(testCase);
  }
}

console.log(`✅ Tests OK!`);
