import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import pathBrowserify from 'path-browserify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    mode: 'production', // Set mode to production or development
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "http": 'stream-http',
            "buffer": 'buffer',
            "url": 'url',
            "path": 'path-browserify',
            "fs": false // Mock fs module with an empty object
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin()
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: true,
                },
                output: {
                    comments: false,
                },
                mangle: {
                    toplevel: true,
                },
            },
        })],
    },
};
