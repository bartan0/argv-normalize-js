const { resolve } = require('path')

const isProduction = process.env.NODE_ENV === 'production'


module.exports = {
	entry: './index.js',
	context: resolve('.'),
	mode: isProduction ? 'production' : 'development',
	target: 'node',

	output: {
		filename: 'index.js',
		path: resolve(isProduction ? 'dist' : 'build'),
		libraryTarget: 'commonjs2'
	},

	module: {
		rules: [ {
			test: /\.js$/,
			use: [
				{ loader: 'babel-loader', options: {
					presets: [ [
						'@babel/preset-env',
						{ targets: { node: '10' } }
					] ]
				} }
			]
		} ]
	}
}
