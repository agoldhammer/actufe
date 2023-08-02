export const ssr = false;

export const load = async function ({fetch, params}) {
	console.log("conn: params: ", params)
	const response = await fetch('/.netlify/functions/conn?time=3')
          .then(response => response.json()
          )
	// console.dir(response)
	// const retval = {arts: data, count: data.length}
	return {arts: response.articles,
			count: response.count}
}
