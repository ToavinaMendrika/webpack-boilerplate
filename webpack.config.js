const path = require('path')
const fs = require('fs')
const { argv } = require('yargs')
/**
 *  Webpack plugins
 */
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
/**
 * Environment
 */
const __env = process.env.NODE_ENV
const __hmr = argv.hot

const paths = {
    scss: './src/scss/styles.scss',
    js: './src/js/app.js',
    publicPath: path.resolve(__dirname, 'public'),
    outputDir: path.resolve(__dirname, 'public/assets')
}

let isDev = __env === 'dev'

let utils = {

    /**
     * Clean directory
     * @param {striny} directory path to directory to clean up
     */
    cleanup(directory) {
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach((file, index) => {
                const curPath = path.join(directory, file);
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.cleanup(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directory);
        }
    }
}

console.log('clean up ...')
utils.cleanup(paths.outputDir)
console.log('generate assets ...')

let webpackConfig = {
    mode: 'development',
    
    entry: [paths.scss, paths.js],
    devtool: isDev ? 'source-map' : 'none',

    output: {
        publicPath: '/assets/',
        path: paths.outputDir,
        sourceMapFilename: '[file].map[query]',
        filename: isDev ? 'js/[name].js' :  'js/[name]-[hash:8].js'
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader', 
                    MiniCssExtractPlugin.loader ,
                    'css-loader', 'postcss-loader', 'sass-loader',
                ]
            },
            {
                exclude: /node_modules/,
                test: /\.js$/,
                use: ['babel-loader'],
                enforce: "pre"
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img',
                        }
                    }
                ]
            }
            
        ]
    },
    plugins: [
        new MiniCssExtractPlugin (
            {
                filename:  isDev ? 'css/[name].css' :  'css/[name]-[hash:8].css',
            }
        ),
        new ManifestPlugin({
            seed: {
                env: __env,
                hmr: __hmr
            },
            fileName: 'assets.json',
            filter: file => file.path.match(/.*.(css|js|ttf|woff2?)$/)
        })
    ]
}

if(isDev && __hmr) {
    webpackConfig.devServer = {
        contentBase: paths.outputDir,
        compress: true,
        port: 9000,
        hot: true
    }
}

module.exports = webpackConfig