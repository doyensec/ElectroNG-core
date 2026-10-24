import { resolve } from 'path';
import { normalizePath } from '../file';

export const defaultConfig = {
	basedir: process.cwd(),
	// stylesheet: [resolve(__dirname, 'stylesheets/markdown.css')],
	stylesheet: [normalizePath('md2html-stylesheets') + '/markdown.css'],
	script: [],
	css: '',
	document_title: '',
	body_class: [],
	page_media_type: 'screen',
	highlight_style: 'github',
	marked_options: {},
	pdf_options: {
		printBackground: true,
		format: 'a4',
		margin: {
			top: '30mm',
			right: '40mm',
			bottom: '30mm',
			left: '20mm',
		},
	},
	launch_options: {},
	gray_matter_options: {
		engines: {
			js: () =>
				new Error(
					'The JS engine for front-matter is disabled by default for security reasons. You can enable it by configuring gray_matter_options.',
				),
		},
	},
	md_file_encoding: 'utf-8',
	stylesheet_encoding: 'utf-8',
	as_html: false,
	devtools: false,
};