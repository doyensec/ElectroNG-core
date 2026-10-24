import logger from 'winston';
import path from 'path';
import asar from 'asar';

import { extension } from '../util';
import { Loader } from './loader_interface';
import { findOldestElectronVersion } from "../util/electron_version";

export class LoaderAsar extends Loader {
  constructor() {
    super();
  }

  // returns map filename -> content
  async load(archive) {
    this.archive = archive;

    var archived_files = asar.listPackage(archive);
    archived_files = archived_files.map((filepath) => {
      return path.join(archive, filepath)
    });

    logger.debug(`Files in ASAR archive: ${archived_files}`);

    for (const file of archived_files) {
      if(file.includes(`${path.sep}node_modules`)) continue;

      const f = file;
      switch (extension(f)) {
        case 'json':
          if (path.basename(f).toLowerCase().indexOf('package.json') < 0)
            continue;
        // eslint-disable-next-line no-fallthrough
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'htm':
        case 'html': {
          this._loaded.add(f);
          break;
        }
        default:
          break;
      }
    }

    const readAndOptionallyParse = (filename, shouldParse) => {
      try {
        const file = archived_files.find((f) => f.endsWith(filename));
        if (!file) return undefined;
        //const f = file.startsWith(path.sep) ? file.substr(1) : file;
        const f = file;
        if (!shouldParse) return this.load_buffer(f);
        return JSON.parse(this.load_buffer(f));
      } catch (e) {
        return undefined;
      }
    };

    const electronVersion = await findOldestElectronVersion({
      pjsonData: readAndOptionallyParse('package.json', true),
      plockData: readAndOptionallyParse('package-lock.json', true),
      yarnLockData: readAndOptionallyParse('yarn.lock', false),
    });
    if (electronVersion) this._electronVersion = electronVersion;

    logger.debug(`Discovered ${this.list_files.size} files`);
  }

  load_buffer(filename) {
    filename = path.relative(this.archive, filename);
    logger.debug(`Extracting file: ${filename}`);
    const buffer = asar.extractFile(this.archive, filename);
    return buffer;
  }
}
