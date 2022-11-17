const path = require("path");
// const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
// const glob = require("glob");

module.exports = {
  mode: "development",
  entry: './src/ts/index.tsx',
  output: {
    path: path.join(__dirname, "dist"),
    filename: "main.js",
    //publicPath: "./dist/",
    //webassemblyModuleFilename: "[hash].wasm",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/react']
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
      // {
      //   test: /\.(ts|tsx)$/,
      //   use: 'ts-loader',
      // },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [{
          // inject CSS to page
          loader: 'style-loader'
        }, {
          // translates CSS into CommonJS modules
          loader: 'css-loader'
        }, {
          // Run postcss actions
          loader: 'postcss-loader',
          // options: {
          //   // `postcssOptions` is needed for postcss 8.x;
          //   // if you use postcss 7.x skip the key
          //   postcssOptions: {
          //     // postcss plugins, can be exported to postcss.config.js
          //     plugins: function () {
          //       return [
          //         require('autoprefixer')
          //       ];
          //     }
          //   }
          // }
        }, {
          // compiles Sass to CSS
          loader: 'sass-loader'
        }]
      },
      {
        test:/\.SVG$/,
        //loader: 'svg-inline-loader'
        type: 'asset/source',
      },
      {
        // https://ics.media/entry/16329/
        test:/.(gif|svg|png|jpg|jpeg|JPG)$/,
        // type: 'asset/inline',
        type: 'asset', /**  default <8kb: inline, >8kb: resource  */
        generator: {
          filename: 'image/[hash].[ext]',
        }
      },
      {
        test:/.(mp3|wav|aac)$/,
        type: 'asset/resource',
        generator: {
          filename: 'audio/[hash].[ext]'
        }
      },
      {
        test:/.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'font/[hash].[ext]'
        }
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3000,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".wasm"]
  },
  experiments: {
    outputModule: true,
    asyncWebAssembly: true,
  },
  target: 'web',
};
