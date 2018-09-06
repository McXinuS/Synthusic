# Synthusic

## Description

![Interface of main screen](/docs/main_win.jpg?raw=true "Interface of main screen")

Multi-user note editor with additive synthesizers as instruments. The app is built on Angular 5 on frontend and Node.js + Express on backend. The app relies on WebSockets to maintain real-time users connection, [Verovio](https://www.verovio.org) library to display stave and WebAudio API to generate sound on client side.

![Interface of instrument configuration](/docs/cfg_win.jpg?raw=true "Interface of instrument settings")

Instruments are additive synthesizers, placed on a virtual scene. They have wave and envelope configuration and location on the scene.

## Project status

The project is currently under developement. Features, such as stave editing, routing and user login are unfinished at the moment.

## Website

Available at [synthusic.herokuapp.com](http://synthusic.herokuapp.com)

## Development server
Run `npm run-script start:dev` for a dev server. Navigate to `http://localhost:5000/`. Reload browser tab if you change any of the source files.
