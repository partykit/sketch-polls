# sketch-polls

Implements a collection of web components under the 'poll-party' project name.

The single component is also called 'poll-party' and it can be used to add a live poll to any web page, given a PartyKit server to connect to.

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
