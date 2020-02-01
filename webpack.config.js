const path = require('path')
const fs = require('fs')

/**
 *  Webpack plugins
 */
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

/**
 * Environment
 */
const __env = process.env.NODE_ENV
const __hmr = false

const paths = {
    scss: './src/scss/styles.scss',
    js: './src/js/app.js',
    publicPath: path.resolve(__dirname, 'public'),
    outputDir: path.resolve(__dirname, 'public/assets')
}



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

module.exports = {
    mode: 'development',
    
    entry: [paths.scss, paths.js],
    devtool: 'source-map',
    output: {
        publicPath: 'public/assets/',
        path: paths.outputDir,
        sourceMapFilename: '[file].map[query]',
        filename: __env === 'dev'? 'js/[name].js' :  'js/[name]-[hash:8].js'
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
                use: ['source-map-loader'],
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
                            publicPath: '/assets/img',
                        }
                    }
                ]
            }
            
        ]
    },
    plugins: [
        new MiniCssExtractPlugin (
            {
                filename:  __env === 'dev'? 'css/[name].css' :  'css/[name]-[hash:8].css',
                chunkFilename: "[id].css"
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