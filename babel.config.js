module.exports = function (api) {
  api.cache(true);
  plugins: [["module:react-native-dotenv"]];
  return {
    presets: ["babel-preset-expo"],
  };
};
