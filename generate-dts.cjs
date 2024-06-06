const { generateDtsBundle } = require('dts-bundle-generator');
const path = require('path');
const fs = require('fs');

const output = generateDtsBundle([
    {
        filePath: path.resolve(__dirname, './src/index.ts'),
        output: {
            noBanner: true,
        },
    },
]);

const outputPath = path.resolve(__dirname, './dist/index.d.ts');
fs.writeFileSync(outputPath, output.join('\n'));
