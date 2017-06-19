# hawtio-preferences

[![CircleCI](https://circleci.com/gh/hawtio/hawtio-preferences.svg?style=svg)](https://circleci.com/gh/hawtio/hawtio-preferences)

This plugin provides preferences functionality for hawtio, allowing custom plugins to register their own preference, which are then shown from the user preference menu.

## Installation

```
yarn add @hawtio/preferences
```

## Set up development environment

### Clone the repository

```
git clone https://github.com/hawtio/hawtio-preferences
cd hawtio-preferences
```

### Install development tools

* [Node.js](http://nodejs.org)
* [Yarn](https://yarnpkg.com)
* [gulp](http://gulpjs.com/)

### Install project dependencies

```
yarn install:dev
```

### Run the demo web application

```
gulp
```

### Change the default proxy port

To proxy to a local JVM running on a different port than `8282` specify the `--port` CLI arguement to gulp:
```
gulp --port=8181
```
### Output build to a different directory

When developing this plugin in a dependent console you can change the output directory where the compiled `.js` and `.css` go.  Just use the `--out` flag to set a different output directory, for example:

    gulp watch --out=../fabric8-console/libs/hawtio-preferences/dist/

Whenever the build completes the compiled `.js` file will be put into the target directory.  Don't forget to first do a `gulp build` without this flag before committing changes!

### Turn on source maps generation for debugging TypeScript

If you want to debug `.ts` using a browser developer tool such as Chrome DevTools, pass the `--sourcemap` flag to gulp:

    gulp --sourcemap

Do not use this flag when you are committing the compiled `.js` file, as it embeds source maps to the output file. Use this flag only during development.
