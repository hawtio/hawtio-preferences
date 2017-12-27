# DEPRECATED

**This project has been moved to [hawtio-core](https://github.com/hawtio/hawtio-core)**

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
yarn install
```

### Run the demo web application

```
yarn start
```

### Turn on source maps generation for debugging TypeScript

If you want to debug `.ts` using a browser developer tool such as Chrome DevTools, pass the `--sourcemap` flag:
```
yarn start -- --sourcemap
```
Do not use this flag when you are committing the compiled `.js` file, as it embeds source maps to the output file. Use this flag only during development.
