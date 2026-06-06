import { parse } from "../../src/Parser.mjs";
import { evaluate } from "../../src/Interpreter.mjs";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

function test(input, expected) {
  const ast = parse(input);
  const state = evaluate(ast);

  if (!expected(state)) {
    throw new Error(`[TEST] ${input}`);
  }
}

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const testCases = await Promise.all(
  readdirSync(currentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const directory = join(currentDirectory, entry.name);
      const [expectedFile] = readdirSync(directory).filter((file) =>
        file.endsWith(".mjs"),
      );

      return {
        input: readFileSync(join(directory, "input.nfah"), "utf8"),
        expected: (await import(pathToFileURL(join(directory, expectedFile))))
          .default,
      };
    }),
);

for (const { input, expected } of testCases) {
  try {
    test(input, expected);
  } catch (e) {
    if (expected(e)) {
      continue;
    }
    debugger;
    test(input, expected);
  }
}

console.log(`✅ All Compiler checks passed!`);
