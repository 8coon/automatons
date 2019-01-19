import NodeResolve from 'rollup-plugin-node-resolve';

const baseConfig = format => ({
	input: 'lib/index.js',
	output: {
		file: `dist/automatons.${format}.js`,
		name: 'automatons',
		format,
	},
	plugins: [NodeResolve()]
});

export default [
	'amd', 'cjs', 'esm'
].map(baseConfig);
