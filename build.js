import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { generateDtsBundle } from 'dts-bundle-generator';

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build the project for the browser
build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'browser',
  format: 'esm',  // Change format to 'esm' for browser compatibility
  outfile: 'dist/bundle.js',
  sourcemap: true,
  external: ['fs', 'path', 'ejs'], // Exclude Node.js built-in modules and ejs
  target: ['es6'],  // Target modern browsers
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.browser': 'true',
  },
}).catch(() => process.exit(1));

// Generate a single .d.ts bundle
const dtsBundle = generateDtsBundle([
  {
    filePath: 'src/index.ts',
    output: {
      noBanner: true,
    },
  }
]);

const distDir = resolve(__dirname, 'dist');
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'bundle.d.ts'), dtsBundle[0]);

console.log('Build and type bundling complete.');
