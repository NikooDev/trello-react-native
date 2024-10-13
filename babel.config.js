module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx'],
        alias: {
          '@Action': './src/actions',
          '@Asset': './src/assets',
          '@Component': './src/components',
          '@Config': './src/config',
          '@Context': './src/contexts',
          '@Hook': './src/hooks',
          '@Navigator': './src/navigators',
          '@Screen': './src/screens',
          '@Service': './src/services',
          '@Store': './src/store',
          '@Type': './src/types',
          '@Util': './src/utils',
          'react-native-linear-gradient': './node_modules/react-native-linear-gradient/index.js'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]
};
