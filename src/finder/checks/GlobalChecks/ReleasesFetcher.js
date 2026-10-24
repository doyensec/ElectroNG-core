import fs from 'fs';
import got from 'got';
import chalk from 'chalk';
import path from 'path'
import tempDirectory from 'temp-dir';
import crypto from 'crypto';

export default class ReleasesFetcher {

  constructor() {
    this.releasesFilePath = path.resolve(require('temp-dir'), 'electro-ng');
    this.releaseNoteSecurityFixRegex = [ /# Security/i, /\[security\]/i ];
  }

  async updateReleasesList() {

    var shouldUpdate = false;
    var ElectronReleaseData;
    var remoteEtag = "";
    var localEtag;
    var latest;

    if (!shouldUpdate) {
      var releaseFile = fs.readdirSync(this.releasesFilePath).filter(fn => fn.startsWith('releases.'));
      if (releaseFile.length > 0) { // file exists, we should check the etag
        try {
          ElectronReleaseData = await got('https://releases.electronjs.org/releases.json', { responseType: 'json' });
        } catch (e) {
          console.log(chalk.yellow(`Something went wrong while fetching Electron's releases. No connectivity?`));
          return false;
        }
        if (ElectronReleaseData.body == null) {
          console.log(chalk.yellow(`Something went wrong while fetching Electron's releases. Etag returned from Github was not recognized.`));
          return false;
        }
        try {
          latest = ElectronReleaseData.body[0].version;
        } catch (e) {
          console.log(chalk.yellow(`Something went wrong while fetching Electron's releases. No connectivity?`));
          console.log(ElectronReleaseData.body);
          return false;
        }
          // Hash etag since we don't know the exact etag format 
        remoteEtag = crypto.createHash('sha256').update(latest).digest('hex').substring(0,40);
        localEtag = releaseFile[0].split('.')[1];

        //check if it corresponds to our local version
        if (localEtag === remoteEtag)
          shouldUpdate = false;
        else {
          shouldUpdate = true;
          //remove the old releases.json file(s)
          try {
            for (let file of releaseFile.values())
              fs.unlinkSync(path.join(this.releasesFilePath, file));
          } catch (e) {
            console.log(chalk.yellow(`Something went wrong while trying to delete Electron's releases.`));
            console.log(e)
          }
        }

      } else {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      console.log(chalk.green(`Fetching Electron's new releases, this may take a while...`));
      try {
        ElectronReleaseData = await got('https://releases.electronjs.org/releases.json', { responseType: 'json' });
      } catch (e) {
        console.log(chalk.yellow(`Something went wrong while fetching Electron's releases. No connectivity?`));
        return false;
      }
      if (ElectronReleaseData.body == null) {
        console.log(chalk.yellow(`Something went wrong while fetching Electron's releases. Etag returned from Github was not recognized.`));
        return false;
      }

      try {
        latest = ElectronReleaseData.body[0].version;
      } catch (e) {
        console.log(chalk.yellow(`Something went wrong while fetching Electron's releases. No connectivity?`));
        console.log(ElectronReleaseData.body);
        return false;
      }
      remoteEtag = crypto.createHash('sha256').update(latest).digest('hex').substring(0,40);
      var outputFileContent = [];
      for (let release of ElectronReleaseData.body) {
        let essentialInfo = {};
        essentialInfo.version = release.version;
        essentialInfo.node = release.node;
        essentialInfo.chrome = release.chrome;
        essentialInfo.date = release.date;
        outputFileContent.push(essentialInfo);
      }
      fs.writeFileSync(path.resolve(this.releasesFilePath, 'releases.'+remoteEtag+'.json'), JSON.stringify(outputFileContent, null, 1));
      console.log(chalk.green(`Updated releases list to ${latest}!:${path.resolve(this.releasesFilePath, 'releases.'+remoteEtag+'.json')}`));
      return true;
    } else {
      console.log(chalk.green(`Releases list is up to date.`));
    }
  }

  async getLatestReleaseNumber() {
    var releases;
    var latestRelease;
    var releasesFileName = fs.readdirSync(this.releasesFilePath).filter(fn => fn.startsWith('releases.'));

    if (releasesFileName.length > 0) {
          var rawReleasesFile = fs.readFileSync(path.resolve(this.releasesFilePath, releasesFileName[0]));
          releases = JSON.parse(rawReleasesFile);
          latestRelease = releases[0].version;
          return latestRelease;
    }
  }
    
}