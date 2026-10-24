import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { Config } from './config';
import { getHtml } from './get-html';
import { normalizePath } from '../file';

/**
 * Convert markdown to HTML.
 */
export const convertMdToHtml = async (input, config) => {

	const { headerTemplate, footerTemplate, displayHeaderFooter } = config.pdf_options;

	if ((headerTemplate || footerTemplate) && displayHeaderFooter === undefined) {
		config.pdf_options.displayHeaderFooter = true;
	}

	const arrayOptions = ['body_class', 'script', 'stylesheet'];

	// sanitize frontmatter array options
	for (const option of arrayOptions) {
		if (!Array.isArray(config[option])) {
			config[option] = [config[option]].filter(Boolean);
		}
	}

	const highlightStylesheet = normalizePath('md2html-stylesheets') + '/' + config.highlight_style + '.css';

	config.stylesheet = [...new Set([...config.stylesheet, highlightStylesheet])];

	const html = getHtml(input.content, config);

	return html;
};
