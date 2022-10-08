/* eslint-disable */
module.exports = {
  extends: require.resolve("./.config/.eslintrc.js"),
  parserOptions: {
    project: require.resolve("./tsconfig.json"),
  },
};
