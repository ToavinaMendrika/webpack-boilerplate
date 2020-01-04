const path = require('path')

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
        path: paths.outputDir,
        sourceMapFilename: '[file].map[query]',
        filename: 'js/[name].js'
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                       loader: 'file-loader',
                       options: {
                           name: 'css/[name].css'
                       } 
                    },
                    'extract-loader','source-map-loader', 'css-loader?sourceMap', 'postcss-loader', 'sass-loader?sourceMap'
                ]
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: "pre"
            }
            
        ]
    }
}