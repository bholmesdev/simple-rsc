import ReactFlightWebpackPlugin from "react-server-dom-webpack/plugin";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";

/** @type {import('webpack').Configuration} */
export default {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/index.jsx",
  target: ["node16.18"],
  // Webpack noise constrained to errors and warnings
  stats: "errors-warnings",
  output: {
    path: fileURLToPath(new URL("./dist", import.meta.url)),
    filename: "bundle.js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new ReactFlightWebpackPlugin({
      isServer: false,
      clientReferences: {
        directory: "./src",
        recursive: true,
        include: /\.(jsx|tsx)$/,
      },
    }),
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: /\.(jsx|tsx)$/,
            loader: resolveNodeModulesPath("babel-loader"),
            options: {
              customize: resolveNodeModulesPath(
                "babel-preset-react-app/webpack-overrides"
              ),
              presets: [
                [
                  resolveNodeModulesPath("babel-preset-react-app"),
                  {
                    runtime: "automatic",
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
};

function resolveNodeModulesPath(path) {
  return resolve(
    fileURLToPath(new URL("./node_modules", import.meta.url)),
    path
  );
}
