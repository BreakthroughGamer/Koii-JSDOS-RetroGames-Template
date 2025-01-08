import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

export default {
  entry: "./src/index.js", // Entry point for your JS code
  target: "node",
  mode: "development",
  devtool: "source-map",
  optimization: {
    usedExports: false,
  },
  stats: {
    moduleTrace: false,
  },
  node: {
    __dirname: true,
  },
  plugins: [
    // Changed from 'plugin' to 'plugins'
    new HtmlWebpackPlugin({
      template: "./src/task/game_files/main.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/task/game_files/js-dos.css", to: "js-dos.css" },
        { from: "src/task/game_files/js-dos.js", to: "js-dos.js" },
        { from: "src/task/game_files/bundle.jsdos", to: "bundle.jsdos" },
      ],
    }),
  ],
  module: {
    rules: [{ test: /\.html$/, use: ["html-loader"] }],
  },
};
