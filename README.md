## VUE-HER
Automatic routing for vue projects

- Generate the webpack configuration through the configuration file <code>her.config.js</code>
- Generate routing through the project directory

### use
make project folder and create a directory like the one below
  - assets
  - components
  - entries
    * module-1
      - pages
      - store
      - index.html
    * module-2
  - layouts
  - styles

### install
```
npm install vue-her --save-dev
```
### run

package.json

```
"dev": "her dev",
"build": "her build",
"publish": "cross-env NODE_ENV=production npm run build"
```

### her.config.js

```js
module.exports = {
  server: {
    host: '0.0.0.0',
    port: '3000',
    middlewares: []
  },
  entry: '',
  statics: [
    'static',
    'public',
    // ... other
  ],
  styleLoader:{
    // eg:
    // stylus: {
    //   import: [
    //     path.join(__dirname, './src/styles/vars.styl')
    //   ]
    // }
  },
  // Static file storage path
  assetsPath: '__her__/'
}
```
### Update Log

v0.0.13 update
- 2018/1/23
  将babel插件vue-app的useBuiltIns参数设置为false,自动加载pollyfill
- 2018/1/24
  添加了proxy代理配置
v0.0.15 update
- 2018/2/11
  移除了 LodashModuleReplacementPlugin 插件以解决外部使用引起的问题
v0.0.16 update
- 2018/2/28
  将APP实例，router以及store置入全局变量
```js
   // 全局根实例对象
   global.__vm__
   // 全局路由对象
   global.__router__
   // 全局状态对象
   global.__store__
```
  router实例可通过import router from '@@@/entries/<%=入口模块 %>/router'引用
  修改store返回vuex实例
  