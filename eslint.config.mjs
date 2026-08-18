import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptConfig from "eslint-config-next/typescript";

/** Flat config — eslint-config-next 16 ships native flat config entrypoints. */
const eslintConfig = [
  ...coreWebVitals,
  ...typescriptConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "images/**",
      "src/data/catalog.json",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
