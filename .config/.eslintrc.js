module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: require.resolve("./tsconfig.json"),
  },
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // 안 쓰는 변수는 에러 처리
    "no-unused-vars": "error",
    // falsy, truthy 를 쓰지 않도록 에러 처리
    "@typescript-eslint/strict-boolean-expressions": "error",
    // 중복 import는 에러 처리
    "import/no-duplicates": "error",
    // import 순서를 자동으로 처리
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external", "internal"],
          "parent",
          "sibling",
          "index",
        ],
        alphabetize: { order: "asc" },
      },
    ],
    // 암묵적 형변환 에러 처리
    "no-implicit-coercion": "error",
    // === 사용하도록 처리
    eqeqeq: ["error", "always", { null: "ignore" }],
    // 재할당하지 않으면 const 로 쓰도록 처리
    "prefer-const": "error",
    // var는 반드시 안쓰도록 처리
    "no-var": "error",

    // zod로 타입 구성하고 interface로 타이핑할 때 유용함
    "@typescript-eslint/no-empty-interface": ["off"],
  },
};
