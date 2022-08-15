import * as path from 'path';
import { Configuration, EnvironmentPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as env from '../../src/common/utils/env';

const config: Configuration = {
    mode: env.isProd ? 'production' : 'development',
    entry: {
        'get-state': path.resolve('src/server/functions/get-state/index.ts'),
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
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
};

export default config;
