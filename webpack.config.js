const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    demo: './demo/index.tsx',
  },
  output: {
    filename: 'js/[name].js',
    path: __dirname + '/public',
  },
  devtool: 'source-map',
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript', '@emotion/babel-preset-css-prop'],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
  devServer: {
    contentBase: __dirname + '/public',
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './demo/index.html'
    }),
  ]
}