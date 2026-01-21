module.exports = function (options, webpack) {
  const lazyImports = [
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'cache-manager',
    'class-validator',
    'class-transformer',
  ];

  return {
    ...options,
    externals: [
      ...(Array.isArray(options.externals) ? options.externals : []),
      'crypto',
      'stream',
      'buffer',
      'fs',
      'path',
      'os'
    ],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
