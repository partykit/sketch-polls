# sketch-polls

This web component adds a new 'poll-party' element which is used to add a live poll to any web page, given a PartyKit server to connect to.

Built using [Stencil](https://stenciljs.com/).

![image](/assets/poll-party.gif)

## Experimental!

This component was created during [Matt](https://interconnected.org)'s summer 2023 residency. The purpose is to experiment with multiplayer interactions, and simultaneously see what PartyKit can do. It's called a sketch because it's lightweight and quick, and because we learn something in making it.

## Usage

The web component allows you to create a live poll straight from HTML, from otherwise static websites. You import the component, and give it a question and some options.

![image](/assets/source.png)

You also have to provide a host. That's where your PartyKit back-end will run. See below.

The poll comes to life and looks like this:

![image](/assets/poll.png)

You can vote. It records the fact that you've voted in localStorage on your browser, and sends your option to the PartyKit server.

The results look like this:

![image](/assets/results.png)

...and they update in realtime as other people vote.

To create a new poll: change the HTML. The PartyKit server doesn't know about the question or options specifically -- it stores the votes against a hash of the poll text. So if you change the question or options, it's a new poll.

### Importing the component

The component is published [on npm as poll-party](https://www.npmjs.com/package/poll-party).

In production, add this script tag to your HTML head:

`<script type='module' src='https://unpkg.com/poll-party@0.0.1'></script>`

### The Partykit back-end

In development: use `127.0.0.1:1999` and, from this repo, run:

`npx partykit dev`

In production: use the host of your own PartyKit server (you'll be given it when you run `npx partykit deploy`) or use: `poll-party.genmon.partykit.dev`.

If you'd like to add features (e.g. poll expiry dates) start by building on the server in `partykit/polls.ts`.

## To do

- [ ] Add a mini front-end on the server to see all current polls
- [ ] The component doesn't show an error if it can't connect to PartyKit: it should, as votes won't be counted
- [ ] If the poll-party element has a `styles="false"` attribute, it should not use the default styles, and instead rely on the host page to style it

## Using StencilJS

Follow these instructions to start developing a new component.

From an empty directory:

`npm init stencil` (select 'component')

The project was named 'poll-party' and then the files moved to the top-level directory.

We also use local storage, so:

`npm i stencil-store-storage`

`npm install partykit@beta partysocket@beta`

...for PartyKit.

We want to use Tailwind CSS, so use [stencil-tailwind-plugin](https://www.npmjs.com/package/stencil-tailwind-plugin).

Install:

```
npm install -D stencil-tailwind-plugin tailwindcss
npm install @stencil/sass --save-dev
tailwindcss init
```

Then copy the `stencil.config.ts` from this repo, and also copy `src/styles/tailwind.css` into place (with the top three `@tailwind` lines).

Finally delete the directory `src/components/my-component` and run `stencil generate` to create a new component called `poll-party` (or whatever).

`npm run build` will create the `dist` etc directory.

During development, use `npm start` to run the test server and look at `index.html` from your `src/` directory.

Don't forget to also run `npx partykit dev` for the server.
