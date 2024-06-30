const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const historyApiFallback = require('connect-history-api-fallback')

module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, 'src/index.js'), 
        map: path.resolve(__dirname, 'src/map.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'), 
        filename: '[name][contenthash].js', 
        clean: true, 
        assetModuleFilename: '[name][ext]'
    }, 
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        }, 
        open: true, 
        hot: true, 
        compress: true, 
        historyApiFallback: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }, 
            {
                test: /\.(png|svg|jpg|jpeg)$/i,
                type: 'asset/resource'
            }, 
            {
                test: /\.html$/, 
                use: ['html-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'test',
            filename: 'index.html',
            template: 'src/home.html',
            chunks: ['index'], 
            inject: true
        }), 
        new HtmlWebpackPlugin({
            title: 'Map',
            filename: 'map.html',
            template: 'src/map.html', 
            chunks: ['map'],
            inject: true


        })
    ]
}

