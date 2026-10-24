import { read_file, list_files, getRelativePath } from '../util';
import { Loader } from './loader_interface';
import { findOldestElectronVersion } from "../util/electron_version";
import * as ignoreParser from 'gitignore-parser';

export class LoaderDirectory extends Loader {
  constructor() {
    super();
  }

  async load(dir, excludeList) {
    const files = await list_files(dir);
    const exclusionsFilePath = files.find(path => path.endsWith(".electrong"));
    var ignore;
    if (exclusionsFilePath || excludeList) {
      var list = "";
      if (exclusionsFilePath && excludeList)
        list = excludeList.replace(/,/g, '\n') + '\n' + read_file(exclusionsFilePath)
      else if (exclusionsFilePath)
        list = read_file(exclusionsFilePath);
      else
        list = excludeList.replace(/,/g, '\n');

      ignore = ignoreParser.compile(list);
    }

    for (const file of files) {
      if (ignore) {
        if (ignore.accepts(getRelativePath(dir, file)))
          this._loaded.add(file);
      } else if (getRelativePath(dir, file))
          this._loaded.add(file);
    }

    const readAndOptionallyParse = (filename, shouldParse) => {
      try {
        const file = files.find(f => f.endsWith(filename));
        if (!file) return undefined;
        if (!shouldParse) return this.load_buffer(file);
        return JSON.parse(this.load_buffer(file));
      } catch (e) {
        return undefined;
      }
    };

    const electronVersion = await findOldestElectronVersion({
      pjsonData: readAndOptionallyParse('package.json', true),
      rootPath: dir,
      plockData: readAndOptionallyParse('package-lock.json', true),
      yarnLockData: readAndOptionallyParse('yarn.lock', false),
    });
    if (electronVersion) this._electronVersion = electronVersion;
  }

  async stash() {
    this._loaded.clear();
  }

  load_buffer(filename) {
    const buffer = read_file(filename);
    return buffer;
  }
}
