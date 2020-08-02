module.exports = {
  mode: 'development', // development or production
  entry: './client/app.jsx',
  output: {
    filename: 'app.js',
    path: __dirname + '/public/js'
  },
  devtool: 'source-map',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
}