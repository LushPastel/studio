
// This file can be removed if the 'functions' directory is removed.
// Placeholder content if the file is kept.
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
    "max-len": ["error", {"code": 120}]
  },
  parserOptions: {
    "ecmaVersion": 2020
  }
};
