import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(rootDir, "src");
const extensionCandidates = ["", ".ts", ".tsx", ".js", ".mjs"];
const indexCandidates = ["index.ts", "index.tsx", "index.js", "index.mjs"];

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const resolvedPath = resolveWithCandidateExtensions(
      path.join(srcDir, specifier.slice(2)),
    );

    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href,
      };
    }
  }

  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentPath = fileURLToPath(context.parentURL);
    const resolvedPath = resolveWithCandidateExtensions(
      path.resolve(path.dirname(parentPath), specifier),
    );

    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href,
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.startsWith("file:")) {
    const filePath = fileURLToPath(url);
    const extension = path.extname(filePath);

    if (extension === ".ts" || extension === ".tsx") {
      const source = await readFile(filePath, "utf8");
      const transpiled = ts.transpileModule(source, {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          target: ts.ScriptTarget.ES2020,
        },
        fileName: filePath,
      });

      return {
        format: "module",
        shortCircuit: true,
        source: transpiled.outputText,
      };
    }
  }

  return defaultLoad(url, context, defaultLoad);
}

function resolveWithCandidateExtensions(basePath) {
  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`;

    if (isFile(candidate)) {
      return candidate;
    }
  }

  if (isDirectory(basePath)) {
    for (const indexCandidate of indexCandidates) {
      const candidate = path.join(basePath, indexCandidate);

      if (isFile(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function isFile(filePath) {
  return existsSync(filePath) && statSync(filePath).isFile();
}

function isDirectory(filePath) {
  return existsSync(filePath) && statSync(filePath).isDirectory();
}
