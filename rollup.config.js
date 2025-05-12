import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import gzip from 'rollup-plugin-gzip';

const input = 'index.js';
const name = 'expressHttpClient';

// Shared plugins
const plugins = [
  resolve(),
];

// Production plugins (for minification)
const prodPlugins = [
  terser(),
  gzip(),
];

export default [
  // ESM build
  {
    input,
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
    },
    plugins,
  },
  
  // CommonJS build
  {
    input,
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
    },
    plugins,
  },
  
  // Minified ESM build
  {
    input,
    output: {
      file: 'dist/index.esm.min.js',
      format: 'esm',
    },
    plugins: [...plugins, ...prodPlugins],
  },
  
  // Minified CommonJS build
  {
    input,
    output: {
      file: 'dist/index.cjs.min.js',
      format: 'cjs',
      exports: 'named',
    },
    plugins: [...plugins, ...prodPlugins],
  },
];