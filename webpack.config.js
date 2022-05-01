const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// Необходимо установить пакет cross-env. Смотри файл package.json->scripts.
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`

const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
    ];

    if (isDev) {
        loaders.push('eslint-loader')
    }

    return loaders
}

module.exports = {
    context: path.resolve(__dirname, 'src'), // Отвечает за то, где лежать исходники приложения.
    mode: 'development',
    entry: ['@babel/polyfill', './index.js'], // Точки входа в приложение.
    output: { // Куда необходимо складывать результат работы webpack (можно использовать паттерны).
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@core': path.resolve(__dirname, 'src/core')
        }
    },
    devtool: isDev ? 'source-map' : false,
    devServer: {
        port: 3000,
        hot: isDev
    },
    plugins: [ // Дополнительный функционал, в виде классов, которые можно добавить к базовой конфигурации webpack.
        new CleanWebpackPlugin(), // Для чистки папки dist.
        new HTMLWebpackPlugin({
            template: 'index.html', // Откуда брать шаблон для html. Папку не указывать т.к. context.
            minify: {
                removeComments: isProd,
                collapseWhitespace: isProd
            }
        }),
        new CopyPlugin([ // Перенос статических файлов из директории в директорию.
            {
                from: path.resolve(__dirname, 'src/favicon.ico'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
        new MiniCssExtractPlugin({ // Для того чтобы вынести css в отдельный файл.
            filename: filename('css')
        })
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        // Лоадер - возможность добавлять к webpack функционал, позволяющий работать с другими типами файлов.
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        }
                    },
                    'css-loader', // Затем этот.
                    'sass-loader' // Сначала через sass loader. Препроцессор сначала компилирует в css.
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            }
        ]
    }
}
