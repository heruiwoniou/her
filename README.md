## VUE-HER
Automatic routing for vue projects

- Generate the webpack configuration through the configuration file
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

