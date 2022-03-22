# CPU Profile Webpack Plugin

Webpack provides a really detailed `webpack.debug.ProfilingPlugin`, but it only does CPU Profiling. Further, it doesn't seem to work with config arrays. We can do much better. We can leverage the work of @lahmatiy - the excellent cpupro: https://github.com/lahmatiy/cpupro CPU Profiler to generate a much better visualization of hot paths in our webpack plugins

## How to configure

Plug this into your webpack configuration like so:

```js
const CPUProfileWebpackPlugin = require("cpupro-webpack-plugin");

module.exports = {
  plugins: [
    new CPUProfileWebpackPlugin();
  ]
}
```

You may want to specify an option with this plugin:

```js
new CPUProfileWebpackPlugin({
  outputPath: "/some/place/my.cpuprofile"
})
```