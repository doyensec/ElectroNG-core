#!/usr/bin/env node

import { defaultConfig } from './config';
import { convertMdToHtml } from './md-to-html';

/**
 * Convert a markdown file to HTML.
 */
export async function mdToHtml(input, config) {

	const mergedConfig = Object.assign({}, defaultConfig, config);

	const html = await convertMdToHtml(input, mergedConfig);

	return html;
}

export default mdToHtml;