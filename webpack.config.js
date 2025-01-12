import { fileURLToPath } from "url";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/index.js",
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
  output: {
    filename: "bafybeih3wu3drl7mbeuvgk3jmrtgvhkg2ibcbcql6svb5sem2xdrxsuu3u.js",
    path: path.resolve(__dirname, "dist"),
  },
};
