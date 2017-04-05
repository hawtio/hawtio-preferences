## hawtio-preferences [![CircleCI](https://circleci.com/gh/hawtio/hawtio-preferences.svg?style=svg)](https://circleci.com/gh/hawtio/hawtio-preferences)

This plugin provides preferences functionality for hawtio, allowing custom plugins to register their own preference, which are then shown from the user preference menu.

### Basic usage

#### Running this plugin locally

First clone the source

    git clone https://github.com/hawtio/hawtio-preferences
    cd hawtio-preferences

Next you'll need to [install NodeJS](http://nodejs.org/download/) and then install the default global npm dependencies:

    npm install -g bower gulp slush slush-hawtio-javascript slush-hawtio-typescript typescript

Then install all local nodejs packages and update bower dependencies via:

    npm install
    bower update

Then to run the web application:

    gulp

#### Install the bower package

    bower install --save hawtio-preferences

#### Output build to a different directory

When developing this plugin in a dependent console you can change the output directory where the compiled `.js` and `.css` go.  Just use the `--out` flag to set a different output directory, for example:

    gulp watch --out=../fabric8-console/libs/hawtio-preferences/dist/

Whenever the build completes the compiled `.js` file will be put into the target directory.  Don't forget to first do a `gulp build` without this flag before committing changes!

#### Turn on source maps generation for debugging TypeScript

If you want to debug `.ts` using a browser developer tool such as Chrome DevTools, pass the `--sourcemap` flag to gulp:

    gulp --sourcemap

Do not use this flag when you are committing the compiled `.js` file, as it embeds source maps to the output file. Use this flag only during development.
