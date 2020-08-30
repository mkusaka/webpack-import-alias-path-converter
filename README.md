# webpack-import-alias-path-converter

convert relative alias into absolute path defined as webpack's alias format.

# usage
1. install `jscodeshift`
  - `npm i -g jscodeshift`
2. copy `transformer.js` into project root directory
3. change `pathAlias` to your webpack config's path alias format.
4. run `jscodeshift -t transformer.js --extensions=js,ts,tsx /path/to/dir_or_file`
