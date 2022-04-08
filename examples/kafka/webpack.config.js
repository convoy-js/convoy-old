const typeCompiler = require('@deepkit/type-compiler');

module.exports = config => {
  config.module.rules[0] = {
    test: /\.tsx?$/,
    use: {
      loader: 'ts-loader',
      options: {
        // this enables @deepkit/type's type compiler
        getCustomTransformers: (program, getProgram) => ({
          before: [typeCompiler.transformer],
          afterDeclarations: [typeCompiler.declarationTransformer],
        }),
      },
    },
    exclude: /node_modules/,
  };

  config.plugins.shift();

  return config;
};
