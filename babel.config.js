const parent = require("./.config/babel.config");

module.exports = {
  presets: [
    //
    ...parent.presets,
  ],
  plugins: [
    //
    ...parent.plugins,
  ],
};
