const path = require('path');
const fs = require('fs');
const { argv } = require('yargs');
/**
 *  Webpack plugins
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const StyleLintWebpackPlugin = require('stylelint-webpack-plugin');
/**
 * Environment
 */
const __env = process.env.NODE_ENV;
const __hmr = argv.hot;

const paths = {
    scss: './src/scss/styles.scss',
    js: './src/js/app.js',
    assetsPath: './src',
    publicPath: path.resolve(__dirname, 'public'),
    outputDir: path.resolve(__dirname, 'public/assets')
}

let isDev = __env === 'dev';

let utils = {

    /**
     * Clean directory
     * @param {string} directory path to directory to clean up
     */
    cleanup (directory) {
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
};

console.log('clean up ...');
utils.cleanup(paths.outputDir);
console.log('generate assets ...');

let webpackConfig = {
    mode: 'development',

    entry: [
        paths.scss,
        paths.js
    ],
    devtool: 'eval-source-map',

    output: {
        publicPath: isDev && __hmr ? 'http://localhost:3000/assets/' : '/assets/',
        path: paths.outputDir,
        sourceMapFilename: '[file].map[query]',
        filename: isDev ? 'js/[name].js' : 'js/[name]-[fullhash:8].js',
        assetModuleFilename: '[name][ext][query]'
    },

    optimization: { usedExports: true },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                // include: path.resolve(paths.assetsPath, 'scss'),
                use: [
                    { loader: __hmr ? 'style-loader' : MiniCssExtractPlugin.loader },
                    {
                        loader: 'css-loader',
                        options: { sourceMap: isDev }
                    },
                    {
                        loader: 'postcss-loader',
                        options: { sourceMap: isDev }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDev,
                            implementation: require('sass')
                        }
                    }
                ]
            },
            {
                exclude: /node_modules/,
                test: /\.js$/,
                use: [
                    'babel-loader',
                    {
                        loader: 'eslint-loader',
                        options: { fix: isDev && !__hmr }
                    }
                ],
                enforce: 'pre'
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                type: 'asset/resource',
                generator: { filename: 'img/[name][ext][query]' }
            },
            {
                test: /\.(otf|ttf|eot|woff)$/,
                type: 'asset/resource',
                generator: { filename: 'font/[name][ext][query]' }
            }

        ]
    },
    plugins: [
        new MiniCssExtractPlugin(
            { filename: isDev ? 'css/[name].css' : 'css/[name]-[fullhash:8].css' }
        ),
        new WebpackManifestPlugin({
            seed: {
                env: __env,
                hmr: __hmr
            },
            fileName: 'assets.json',
            filter: file => file.path.match(/.*.(css|js)$/)
        }),
        new StyleLintWebpackPlugin({
            configFile: '.stylelintrc',
            fix: isDev && !__hmr,
            quiet: false,
            files: [ `${paths.assetsPath}/styles/**/*.{css,scss}` ],
            syntax: 'scss'
        })
    ],
};

if (isDev && __hmr) {
    webpackConfig.devServer = {
        host: '0.0.0.0',
        allowedHosts: 'all',
        static: { directory: path.join(__dirname, 'dist') },
        headers: { 'Access-Control-Allow-Origin': '*' },
        compress: true,
        port: 3000,
        hot: true,
        liveReload: false,
        client: { overlay: true },
        devMiddleware: { writeToDisk: true }
    };
}

module.exports = webpackConfig;