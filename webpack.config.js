const path = require('path')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')

const paths = {
    scss: './src/scss/styles.scss',
    js: './src/js/app.js',
    outputDir: path.resolve(__dirname, 'public')
}

module.exports = {
    mode: 'development',
    
    entry: [paths.scss, paths.js],
    devtool: 'source-map',
    output: {
        publicPath: 'public',
        path: paths.outputDir,
        sourceMapFilename: '[file].map[query]',
        filename: 'js/[name].js'
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader', 
                    MiniCssExtractPlugin.loader ,
                    'css-loader?sourceMap', 'postcss-loader', 'sass-loader?sourceMap',
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
                            name: 'img/[name].[ext]'
                        }
                    }
                ]
            }
            
        ]
    },
    plugins: [
        new MiniCssExtractPlugin (
            {
                filename: "css/[name].css",
                chunkFilename: "[id].css"
            }
        )
    ]
}