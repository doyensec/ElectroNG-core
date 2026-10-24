import hljs from 'highlight.js';
import { marked } from 'marked';

export const getMarked = (options) => {

	const renderer = new marked.Renderer();
	const linkRenderer = renderer.link;

	// modify the anchor element when we're linking to an external host
	renderer.link = (href, title, text) => {

		let localLink;

		try {
			// const localLink = href.startsWith(`${location.protocol}//${location.hostname}`);
			const url = new URL(href);
			localLink = !href.startsWith(`${url.protocol}//${url.hostname}`);
		}
		catch (e) {
			console.error(e)
			localLink = true;
		}


		const html = linkRenderer.call(renderer, href, title, text);
	  return localLink ? html : html.replace(/^<a /, `<a target="_blank" rel="noreferrer noopener nofollow" `);
	};

	marked.setOptions(
		Object.assign({},
		{
		highlight: (code, languageName) => {
			const language = hljs.getLanguage(languageName) ? languageName : 'plaintext';

			return hljs.highlight(code, { language }).value;
		},
		langPrefix: 'hljs '},
		options)
	);

	return { "marked": marked, "renderer": renderer };
};
