import typescript from 'rollup-plugin-typescript2';
import NodeResolve from 'rollup-plugin-node-resolve';
import closureCompiler from '@ampproject/rollup-plugin-closure-compiler';
import visualizer from 'rollup-plugin-visualizer';
import sizes from 'rollup-plugin-sizes';
import jsCleanup from 'js-cleanup';

const baseConfig = mode => ({
    input: 'src/index.ts',
    output: {
        file: `dist/automatons.${mode}.js`,
        name: 'automatons',
        format: 'umd',
    },
    plugins: [
        typescript(),
        NodeResolve(),
        mode === 'min' && (
            closureCompiler({
                compilation_level: 'SIMPLE',
            })
        ),
        // Deleting all comments from output file
        mode === 'min' && (
            function cleanupBundle() {
                return {
                    renderChunk(code, chunk) {
                        return jsCleanup(code, null, {
                            comments: 'none',
                        }).code;
                    }
                }
            }({
                comments: ['none'],
            })
        ),
        mode === 'min' && (
            sizes()
        ),
        mode === 'min' && (
            visualizer({
                filename: 'dist/stats.html',
            })
        ),
    ].filter(Boolean),
});

export default [
    'umd', 'min'
].map(baseConfig);
