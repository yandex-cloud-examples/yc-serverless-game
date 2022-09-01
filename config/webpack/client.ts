import * as path from 'path';
import { Configuration, EnvironmentPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as env from '../../src/common/utils/env';
import { getEnv } from '../../src/server/utils/get-env';

import 'webpack-dev-server'; // for typings augmentation only

const PROXY_TARGET_HOST = getEnv('DEV_SERVER_PROXY_TARGET', 'https://localhost');

const config: Configuration = {
    mode: env.isProd ? 'production' : 'development',
    entry: path.resolve('src/client/index.ts'),
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve('dist/client'),
        filename: `static/index${env.isProd ? '-[hash]' : ''}.js`,
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
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'static/images',
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
        }),
        new HtmlWebpackPlugin({
            filename: 'login.html',
            template: path.resolve('src/client/assets/login.html.ejs'),
            inject: false,
        }),
        new EnvironmentPlugin({
            APP_ENV: 'development',
            NODE_ENV: env.isProd ? 'production' : 'development',
            LOG_LEVEL: 'warn',
        }),
    ],
    devServer: {
        port: 443,
        https: true,
        allowedHosts: 'all',
        proxy: {
            '/api': {
                target: `${PROXY_TARGET_HOST}`,
                secure: false,
                changeOrigin: true,
            },
            '/proxy': {
                target: `${PROXY_TARGET_HOST}`,
                secure: false,
                changeOrigin: true,
            },
        },
    },
};

export default config;
