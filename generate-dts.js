import { generateDtsBundle } from 'dts-bundle-generator';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate the bundle
const output = generateDtsBundle([
    {
        filePath: path.resolve(__dirname, './src/index.ts'),
        output: {
            noBanner: true,
        },
    },
]);

// Write the output to a single file
const outputPath = path.resolve(__dirname, './dist/index.d.ts');
fs.writeFileSync(outputPath, output.join('\n'));
