# sketch-polls

Implements a collection of web components under the 'poll-party' project name.

The single component is also called 'poll-party' and it can be used to add a live poll to any web page, given a PartyKit server to connect to.

## Experimental!

This component was created during [Matt](https://interconnected.org)'s summer 2023 residency. The purpose is to experiment with multiplayer interactions, and simultaneously see what PartyKit can do. It's called a sketch because it's lightweight and quick, and because we learn something in making it.

## What you'll find here

The web component allows you to create a live poll straight from HTML. You import the component, and give it a question and some options.

![image](/assets/source.png)

You also have to provide a host. That's where your PartyKit back-end will run. You can use a dev server: leave the host as `127.0.0.1:1999` and, from this repo, run:

`npx partykit dev`

The poll comes to life and looks like this:

![image](/assets/poll.png)

You can vote. It records the fact that you've voted in localStorage on your browser, and sends your option to the PartyKit server.

The results look like this:

![image](/assets/results.png)

...and they update in realtime as other people vote.

To create a new poll: change the HTML. The PartyKit server doesn't know about the question or options specifically -- it stores the votes against a hash of the poll text. So if you change the question or options, it's a new poll.

## To do

- [ ] Publish the web component to npmjs so anyone can use it
- [ ] Deploy the PartyKit server so that there's a public host to use
- [ ] Add a mini front-end on the server to see all current polls

## Notes

On how this repo was set up...

From an empty directory:

`npm stencil init` (select 'component')

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
