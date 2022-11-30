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
        'get-config': path.resolve('src/server/functions/get-config/index.ts'),
        move: path.resolve('src/server/functions/move/index.ts'),
        capture: path.resolve('src/server/functions/capture/index.ts'),
        'state-change': path.resolve('src/server/functions/state-change/index.ts'),
        'ws-connect': path.resolve('src/server/functions/ws-connect/index.ts'),
        'ws-message': path.resolve('src/server/functions/ws-message/index.ts'),
        'ws-disconnect': path.resolve('src/server/functions/ws-disconnect/index.ts'),
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
