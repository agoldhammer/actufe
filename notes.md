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

codepen gridprac

css
.pagewrapper {
display: grid;
border: 2px solid blue;
height: 600px;
grid-template-columns: auto 1fr;
grid-template-rows: 50px 1fr;
gap: 0.3em;
}

.aside {
grid-column-start: 1;
grid-column-end: 2;
border: 1px solid magenta;
width: 100px;
margin-left: 2px;
color: red;
display: flex;
flex-direction: column;
gap: 1rem;
}

.header {
border: 1px solid orange;
border-radius: 10px;
grid-column-start: 1;
grid-column-end: 3;
margin: 2px;
padding: 4px;
display: flex;
flex-direction: row;
gap: 15px;
}

button {
height: 60%;
}

.content {
grid-column-start: 2;
grid-column-end: 3;
color: green;
border: 1px groove magenta;
margin-right: 2px;
padding: 1em;
}

checkbox {
padding: 10px;
margin: 10px;
width: 0.5rem;
height: 0.5rem;
background-color: gray;
}
