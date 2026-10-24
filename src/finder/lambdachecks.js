import { Finder } from '../finder';
import { LoaderFile, LoaderAsar, LoaderDirectory } from '../loader';
import { extension, input_exists, is_directory, writeIssues, getRelativePath, read_file } from '../util';
import { Parser } from '../parser';
import chalk from 'chalk';

export class LambdaChecks {
    constructor(lambda, parserPlugins = []) {
        //let candidateCheck = Array.from(LAMBDA_CHECKS)[lambda];
        this._current_lambda = lambda.toLowerCase();
        // Parser options initialization
        const parser = new Parser(false, true);
        if (global.setOptions)
          global.setOptions.parserPlugins.forEach(plugin => parser.addPlugin(plugin)) 
        this.parser = parser;
        this.finder = {};
    }

    async getResults(target) {
        var errors = [];
        var issues = [];
        let loader;
        this.finder = await new Finder(this._current_lambda);

        try {
          if (is_directory(target)) {
            loader = new LoaderDirectory();
          } else {
            loader = (extension(target) === 'asar') ? new LoaderAsar() : new LoaderFile();
          }
        } catch (error) {
          // preload couldn't be resolved, we should report this error somehow
          console.log(chalk.yellow(`Failed to resolve a preload path: "${target}"`));
          return issues;
        }

        await loader.load(target);
        const filenames = [...loader.list_files];

        for (const file of filenames) {
            try {
              const [type, data, content, warnings] = this.parser.parse(file, loader.load_buffer(file));
              if (data === null)
                continue;

              if (warnings !== undefined) {
                for (const warning of warnings) {
                  errors.push({ file: file, message: warning.message, tolerable: true });
                }
              }

              const result = await this.finder.find(file, data, type, content);
              issues.push(...result);
            } catch (error) {
              errors.push({ file: file, message: error.message, tolerable: false });
            }
        }

        return issues;
      }
}