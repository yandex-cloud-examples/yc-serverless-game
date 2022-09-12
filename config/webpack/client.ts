import * as path from 'path';
import { Configuration, EnvironmentPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as env from '../../src/common/utils/env';
import { getEnv } from '../../src/server/utils/get-env';

import 'webpack-dev-server'; // for typings augmentation only

const PROXY_TARGET_HOST = getEnv('DEV_SERVER_PROXY_TARGET', 'https://localhost');
const WS_PROXY_TARGET_HOST = getEnv('DEV_SERVER_WS_PROXY_TARGET', 'wss://localhost');

const config: Configuration = {
    mode: env.isProd ? 'production' : 'development',
    entry: {
        index: path.resolve('src/client/entries/index.ts'),
        login: path.resolve('src/client/entries/login.ts'),
        stats: path.resolve('src/client/entries/stats.ts'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve('dist/client'),
        filename: `static/[name]${env.isProd ? '-[contenthash]' : ''}.js`,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                },
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'static/images',
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[contenthash].[ext]',
                },
            },
            {
                test: /\.pcss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'postcss-preset-env',
                                    'postcss-nested',
                                    'postcss-import',
                                    'postcss-url',
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve('src/client/assets/index.html.ejs'),
            chunks: [
                'index',
            ],
        }),
        new HtmlWebpackPlugin({
            filename: 'login.html',
            template: path.resolve('src/client/assets/login.html.ejs'),
            chunks: [
                'login',
            ],
        }),
        new HtmlWebpackPlugin({
            filename: 'stats.html',
            template: path.resolve('src/client/assets/stats.html.ejs'),
            chunks: [
                'stats',
            ],
        }),
        new EnvironmentPlugin({
            APP_ENV: 'development',
            NODE_ENV: env.isProd ? 'production' : 'development',
            LOG_LEVEL: 'warn',
        }),
    ],
    devServer: {
        port: 443,
        server: 'https',
        allowedHosts: 'all',
        proxy: {
            '/api': {
                target: PROXY_TARGET_HOST,
                secure: false,
                changeOrigin: true,
            },
            '/proxy': {
                target: PROXY_TARGET_HOST,
                secure: false,
                changeOrigin: true,
            },
            '/websocket': {
                target: WS_PROXY_TARGET_HOST,
                secure: false,
                changeOrigin: true,
                ws: true,
            },
        },
    },
};

export default config;
