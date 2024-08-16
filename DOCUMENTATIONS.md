# Documentations

This document records all the findings related to this project.

## Cloudflare deployment Issues

When deploying the website to Cloudflare Pages via the the adapter `@remix-run/cloudflare-pages`, it will output an error of **`Error: Script startup exceeded CPU time limit`** after the cloudflare has finished building your Remix App and were about to deploy it to the CDN.

This issue arise due to the bundle size of the server of the Remix App being too big, so that the cloudflare worker (serverless functions) would spend too much time on running the bundle. Cloudflare worker has a hard limit startup time of `400ms`, and exceeding the limit will throw the error. This hard limit is impose on all plans (free/paid) and can be [found here](https://developers.cloudflare.com/workers/platform/limits/#worker-startup-time).

The server bundle size of the Remix application can be somewhat hard/troublesome to control, as a large portion of the dependency is being used up by third party dependency which we have no control over. Although using dynamic import and invest some time into the bundling process may be able to do some fine tuning to turn the size down or split it into more smaller bundler, life is too short for me to investigate.

## Netlify Function deployment issue

When deploying Remix to Netlify, there are two routes on how the application can be deployed:

1. Netlify Function (Runs on the deployed Data Center)
2. Netlify Edge Function (Runs on each CDN server closest to the user, uses Deno)

### Edge deployment issue

When deploying to Edge functions, the following error occurred when bundling the server side code of the Remix application into edge:

```console
10:44:59 PM:  - remix-server
10:45:14 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
10:45:13 PM: TypeError: Cannot read properties of undefined (reading 'href')
10:45:13 PM:     at computeWalletConnectMetaData (file:///opt/build/repo/build/server/assets/en_US-GVTNWC62-Bz87xbdy.js:50570:69)
10:45:13 PM:     at getDefaultConfig$1 (file:///opt/build/repo/build/server/assets/en_US-GVTNWC62-Bz87xbdy.js:51179:20)
10:45:13 PM:     at file:///opt/build/repo/build/server/assets/en_US-GVTNWC62-Bz87xbdy.js:51893:18
10:45:13 PM: ​
10:45:13 PM: Bundling of edge function failed
10:45:13 PM: ────────────────────────────────────────────────────────────────
10:45:13 PM: ​
10:45:13 PM:   Error message
10:45:13 PM:   Could not load edge function at '/opt/build/repo/.netlify/edge-functions/remix-server.mjs'. More on the Edge Functions API at https://ntl.fyi/edge-api.
10:45:13 PM: ​
10:45:13 PM:   Error location
10:45:13 PM:   While bundling edge function
```

The application is able to build the vite bundle without issues but fails to bundle/execute it for edge function. After checking the code that the Netlify console is not happy at, which is at line `50570`.

```javascript
50561:  var computeWalletConnectMetaData = ({
50562:    appName,
50563:    appDescription,
50564:    appUrl,
50565:    appIcon
50566:  }) => {
50567:    return {
50568:      name: appName,
50569:      description: appDescription ?? appName,
50570:      url: appUrl ?? (typeof window !== "undefined" ? window.location.href : ""),
50571:      icons: [...appIcon ? [appIcon] : []]
50572:    };
50573:  };
```

My best guess regarding the issue is that since the code is being deployed to Deno and not Nodejs, the window object could potentially be the root cause as Deno does have `window` object unlike Nodejs. So that the code execute and found that `window` is not undefined but failed to find the `location.href` property as the code is being executed on Deno and not browser environment.

### Serverless function deployment issue

When deploying to Netlify functions, I have also met several issues on having success to deployment. When the project is configured just as what the [netlify template](https://github.com/netlify/remix-template) does. The application either results in `error 404` or `error decoding lambda response: error decoding lambda response: unexpected end of JSON input`.

The root cause of these error is:

1. Having [[redirects]] specified in the `netlify.toml` configuration file. Remix deployment does not need to redirect all path to `./index.html` nor to `netlify/functions`. Configuring redirects is the root cause of having error 404.
2. Using pnpm. It seems that remix/vite does not really like pnpm as the pnpm choice's of storing the node_modules is an issue for remix/vite to find and bundle the package correctly. To solve this:
   1. `shamefully-hoist=true` is required to set in the `.npmrc`
   2. `node_modules` needs to be removed completely and reinstall cleanly
   3. re-generate `app/entry.client.tsx` and `app/entry.server.tsx` file by running `pnpx remix reveal`
