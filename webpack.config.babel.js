import path from 'path';
import webpack from 'webpack';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';

const outPath = path.join(__dirname, 'pages');

const pluginsWithoutUglify = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"',
    },
  }),
  new webpack.optimize.CommonsChunkPlugin(
    path.join('js', 'bundle-commons.js'), ['lib', 'app', 'advanced']),
  new StaticSiteGeneratorPlugin({
      crawl: true
    })
];

const plugins = pluginsWithoutUglify.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    mangle: true,
  }),
]);

const babelLoaderConfigShared = {
  test: /\.jsx?$/,
  loader: 'babel-loader',
  query: {
    ...require('./package.json').babel,
    cacheDirectory: true,
  },
};

export default {
  entry: {
    app: [
      './src/index.js',
    ],
    advanced: [
      './src/examples/AdvancedExample/index.js',
    ],
  },
  output: {
    path: outPath,
    filename: path.join('js', 'bundle-[name].js'),
    publicPath: '/',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        exclude: /node_modules/,
        ...babelLoaderConfigShared,
      },
      {
        include: /react-three-renderer[\\\/]src/,
        ...babelLoaderConfigShared,
      },
      {
          test: /\.glsl$/,
          loader: 'webpack-glsl'
      }
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      // use the source files
      'react-three-renderer': path.join(
        __dirname, 'node_modules', 'react-three-renderer', 'src'),
    },
  },
  devServer: {
    contentBase: path.join(__dirname, 'assets'),
    // noInfo: true, //  --no-info option
      disableHostCheck: true,
    hot: true,
    inline: true,
    stats: { colors: true },
  },
  pluginsWithoutUglify,
  plugins,
};
