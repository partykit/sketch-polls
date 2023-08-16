import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import tailwind, {
  tailwindHMR,
  setPluginConfigurationDefaults,
} from "stencil-tailwind-plugin";
import tailwindcss from "tailwindcss";
import tailwindConf from "./tailwind.config";
import autoprefixer from "autoprefixer";

setPluginConfigurationDefaults({
  tailwindConf,
  tailwindCssPath: "./src/styles/tailwind.css",
  postcss: {
    plugins: [tailwindcss(), autoprefixer()],
  },
});

export const config: Config = {
  namespace: "poll-party",
  plugins: [sass(), tailwind(), tailwindHMR()],
  devServer: {
    reloadStrategy: "pageReload",
  },
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "dist-custom-elements",
    },
    {
      type: "docs-readme",
    },
    {
      type: "www",
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: "new",
  },
};
