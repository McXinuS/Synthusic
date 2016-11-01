var webpack = require('webpack'),
	path = require("path");

const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`NODE_ENV = ${NODE_ENV}`);
const NODE_ENV_DEV = (NODE_ENV == 'development');
const NODE_ENV_PROD = (NODE_ENV == 'production');

module.exports = {
	context: path.resolve(__dirname + '/frontend/js'),
	entry: ['./main.js'],
	output: {
		path: path.resolve(__dirname + '/public/js'),
		filename: 'build.js',
		library: '[name]'
	},
	plugins: [
		new webpack.ProvidePlugin({
			jQuery: 'jquery',
			$: 'jquery',
			jquery: 'jquery',
			constants: './constants.js'
		})
	],
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	},
	devtool: NODE_ENV_DEV ? 'eval' : null,
	watch: NODE_ENV_DEV,
	watchOptions: {
		aggregateTimeout: 300
	}
};

if (NODE_ENV_PROD) {
	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	)
}