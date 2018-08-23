# Synthusic

## Description

![Interface of main screen](/docs/main_win.jpg?raw=true "Interface of main screen")

Multi-user note editor with additive synthesizers as instruments. The app is built on Angular 5 on frontend and Node.js + Express on backend. The app relies on WebSockets to maintain real-time users connection, [Verovio](https://www.verovio.org) library to display stave and WebAudio API to generate sound on client side.

![Interface of instrument configuration](/docs/cfg_win.jpg?raw=true "Interface of instrument settings")

Instruments are additive synthesizers, placed on a virtual scene. They have wave and envelope configuration and location on the scene.

## Website

Available at [synthusic.herokuapp.com](http://synthusic.herokuapp.com)

---

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.24.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
