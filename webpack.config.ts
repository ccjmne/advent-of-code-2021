import { resolve } from 'path';

import { BannerPlugin, Configuration } from 'webpack';

const src = resolve(__dirname, 'src');
const tools = resolve(__dirname, 'tools');
const dist = resolve(__dirname, 'dist');

export default (): Configuration => ({
  entry: {
    run: resolve(tools, 'run.ts'),
  },
  experiments: { topLevelAwait: true },
  output: { path: dist, clean: true },
  target: 'node',
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: 'ts-loader',
    }, {
      test: /input$/,
      include: src,
      use: 'raw-loader',
    }],
  },
  plugins: [
    /**
     * Add shebang.
     * See https://whitescreen.nicolaas.net/programming/windows-shebangs
     */
    new BannerPlugin({ banner: `#! node`, raw: true }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '...'],
    // IMPORTANT: prioritise "global" node modules, for extending modules (e.g.: d3-selection-multi enhances d3-selection)
    modules: [tools, src, resolve(__dirname), resolve(__dirname, 'node_modules'), 'node_modules'],
    mainFields: ['webpack', 'module', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
  },
  devtool: 'source-map',
  // optimization: {
  //   runtimeChunk: {
  //     name: (entrypoint: EntryObject) => `runtime~${entrypoint.name}`,
  //   },
  // },
});
