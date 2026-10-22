import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**", "dist/**", "coverage/**", "node_modules/**", "server.js", "lib/core.js", "public/**", "scripts/build.js", "tests/api.test.js", "tests/core.test.js", "types/**"]) ]);
