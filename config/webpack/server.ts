import * as path from 'path';
import { Configuration, EnvironmentPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import * as env from '../../src/common/utils/env';

const config: Configuration = {
    mode: env.isProd ? 'production' : 'development',
    entry: {
        'get-state': path.resolve('src/server/functions/get-state/index.ts'),
        login: path.resolve('src/server/functions/login/index.ts'),
        auth: path.resolve('src/server/functions/auth/index.ts'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve('dist/server'),
        filename: '[name].js',
        library: {
            type: 'commonjs',
        },
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /node_modules\/ydb-sdk\/build\/cjs\/version\.js$/,
                loader: 'string-replace-loader',
                options: {
                    search: 'path_1.default.join(getRelTopLevelPath(), \'package.json\')',
                    replace: '\'../../package.json\'',
                },
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
    plugins: [
        new EnvironmentPlugin({
            APP_ENV: 'development',
            NODE_ENV: env.isProd ? 'production' : 'development',
            YDB_SSL_ROOT_CERTIFICATES_FILE: '/function/code/dist/server/certs/system.pem',
        }),
        new ForkTsCheckerWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: 'node_modules/ydb-sdk/certs/system.pem', to: path.resolve('dist/server/certs') },
            ],
        }),
    ],
};

export default config;
