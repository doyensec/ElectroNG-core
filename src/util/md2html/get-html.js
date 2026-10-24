import { getMarked } from './get-marked-with-highlighter';

/**
 * Generates a HTML document from a markdown string and returns it as a string.
 */
export const getHtml = function (md, config) {
	var html = `<!DOCTYPE html>
					<html>
						<head><title>${config.document_title}</title>
						<meta charset="utf-8">
					`;

	for (const stylesheet of config.stylesheet) {
		html += `<link rel="stylesheet" href="${stylesheet}">\n`
	}

	if (config.css) {
		html += `<style>${config.css}</style>\n`
	}
	var markedInit = getMarked(config.marked_options);
	var marked = markedInit["marked"];
	var renderer = markedInit["renderer"];

	html += `
			</head>
			<body class="${config.body_class.join(' ')}">
				${marked(md, { renderer })}
			</body>
		</html>
	`;

	return html;
}