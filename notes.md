# advice

[side drawer:](https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sidenav)

js-joda for time stuff

## Hooking mongo to svelte

[Hook mongo to svelte](https://www.youtube.com/watch?v=gwktlvFHLMA)

## zod for schemas

[zod for schemas](https://zod.dev/?id=ip-addresses)

## using netlify functions

[video on netlify fns](https://www.youtube.com/watch?v=qHUMu7ZGQwo)

### Where am I

filter out images or find way to limit display size
add netlify adapter
[home routing in sveltekit:](https://stackoverflow.com/questions/68187584/how-to-route-programmatically-in-sveltekit)
[on spinner](https://www.ratamero.com/blog/showing-a-loading-spinner-when-navigation-is-delayed-in-sveltekit)
[sidebar](https://svelte-sidebar.vercel.app/)
[sidebars](https://devdevout.com/css/css-sidebar-menus)

In css, can toggle class list with onclick=this.classList.toggle(...)

[add tooltips with tippy, see svelte tutorial](https://learn.svelte.dev/tutorial/adding-parameters-to-actions)

[sliding sidebar](https://codepen.io/dphrag/pen/JeayLw)
[svelte sliding sidebar](https://svelte.dev/repl/03f0be0c4dc54eb4af5a168f644f5c31?version=3.19.1)

[group inputs](https://svelte.dev/examples/group-inputs)

need to fix listk of pubnames so it updates with timeshift

[scroll into view](https://stackoverflow.com/questions/13412918/scroll-to-a-particular-element-in-a-ul-list-with-dynamic-ids)
[intersection observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

## Todos

save initial logon time

## 2026-07-16: Deploying to tiny (subpath serving + proxy fix)

Got the SPA fully working at http://tiny:8080/news/ (served by the altsvr
site out of /var/www/html/altsvr/news). Two separate problems:

1. **404s under /_app/** — the build had no base path, so index.html
   referenced assets at the server root (/_app/...) while the app lives under
   /news/. Fix: `svelte.config.js` now reads `BASE_PATH`, so a tiny build is
   `BASE_PATH=/news npm run build`, then
   `rsync -a --delete build/ /var/www/html/altsvr/news/`.
   A plain `npm run build` still produces a root-path build (con1 style).
   Also prefixed the hardcoded favicon/manifest links in
   `src/routes/+page.svelte` with `{base}`.

2. **500 after login** — tiny's nginx proxied /api/articles to
   news.ghmr.net, the *old Netlify frontend*, whose connProxy function was
   deleted in 41512c0; it returned HTML, and +page.ts choked on it. The real
   backend is actuproxy: runs on con1 under supervisor
   (/etc/supervisor/conf.d/actur-cloud.conf), bun on 127.0.0.1:33433, exposed
   publicly as https://www.ghmr.net/actu/api/v1/. Tiny's
   /etc/nginx/sites-available/altsvr now has:

       location = /api/articles {
           proxy_pass https://www.ghmr.net/actu/api/v1/;
           proxy_ssl_server_name on;
       }

   (No `proxy_set_header Host` override — it must default to $proxy_host or
   the upstream vhost routing breaks. Scheme must be https or con1 answers
   with its 80→443 redirect.)

Also added to tiny's altsvr config: an SPA fallback
(`location /news/ { try_files $uri $uri/ /news/index.html; }`) so hard
reloads of client-side routes work, and `location = / { return 302 /news/; }`
so the root URL lands on the app. All verified end-to-end (page, /_app
assets, api with and without txtquery, /news/about hard reload, root
redirect). `deploy/nginx.conf` documents all of this for next time.
