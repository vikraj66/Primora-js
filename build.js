import { build } from 'esbuild';
import { mkdirSync, readdirSync, copyFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { generateDtsBundle } from 'dts-bundle-generator';

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build the project
build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',  // Change format to 'cjs'
  outfile: 'dist/bundle.cjs',
  sourcemap: true,
  external: ['node_modules/*'],
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
