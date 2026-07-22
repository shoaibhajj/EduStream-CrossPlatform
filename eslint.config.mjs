// Root ESLint config — each app extends this via their own eslint.config.mjs
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.expo/**",
      "**/build/**"
    ]
  }
];
