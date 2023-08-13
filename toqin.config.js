import { css, tailwind } from '@beerush/toqin';

const minify = process.argv.includes('--minify');

const cssConfig = {
  postcss: minify,
  cssnano: minify,
  sourceMap: !minify ? 'inline' : false,
};

export default {
  token: './src/tokens/index.toqin',
  outDir: './styles',
  plugins: [ css(cssConfig), tailwind({ useCssVariable: false }) ]
};
