import { input_exists, read_file, extension, is_directory, list_files, getRelativePath, getHTMLDetailForFinding } from './file';
import fs from 'fs';
import path from 'path';
import si from 'systeminformation';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';
import { writeIssues } from './';
import uuidTime from 'uuid-time'
import tar from 'tar';

export default class Project {

  constructor(projectPath) {
    this.projectPath = projectPath;
    this.index = null;
    this.scans = [];
    this.label = false;
    this.getTopIssues = this._getTopIssues;
    this.getTopFiles = this._getTopFiles;
    this.generateReport = this._generateReport;
    this.generateReportForFinding = this._generateReportForFinding;
    this.generateDetailsViewForFinding = this._generateDetailsViewForFinding;
    this.getDocsForIssue = this._getDocsForIssue;
    this.getFileArtifact = this._getFileArtifact;
    this.lastDetails = null;
    this.formatVersion = 1;
    this.tmpPath = path.resolve(require('temp-dir'), 'electro-ng', uuidv4());

    if (!fs.existsSync(this.tmpPath)){
        fs.mkdirSync(this.tmpPath, { recursive: true });
    }
  }

  async save(scanId) {
        // Should be already fully unpacked
        // await this.extractEngFile(details.options.projectFile);

        // Should not try to re-save the artifacs via `storeScannedFileArtifacts` since this method is usually used for metadata edits of a scan. The `updateProject` method is used for new project initializations instead.

        // update index.json's details
        fs.writeFileSync(path.resolve(this.tmpPath, 'index.json'), JSON.stringify(this.index));

        if (scanId) {
          var scan = this.scans.find(scan => scan.id == scanId);
          scan = await this.storeScannedFileArtifacts(scan);
          fs.writeFileSync(path.resolve(this.tmpPath, `${scan.id}.json`), JSON.stringify(scan));
        } else {
          for (var scan of this.scans) {
            scan = await this.storeScannedFileArtifacts(scan);
            fs.writeFileSync(path.resolve(this.tmpPath, `${scan.id}.json`), JSON.stringify(scan));
          }
        }
        // write project to user-controlled location
        await this.createEngFile(this.projectPath);
  }

  async _getDocsForIssue(issue) {
    if (issue && issue.id) {
      var kbPath = path.resolve('ElectroNG-core/kb');
      return fs.readFileSync(path.join(kbPath, `${issue.id}.md`), "utf8")
    } else throw Error("Not a valid issue object")

  }

  async _generateReport(scanId, options) {
    if (!scanId) throw Error("Whole project exports are not yet supported.");
    var scan = this.scans.find(scan => scan.id == scanId);
    var report = await writeIssues(scan.options.input, options.outputOptions, options.outputPath, scan.issues, options.outputFileFormat, this.label);
    return report;
  }

  async _generateReportForFinding(scanId, findingId, options) {
    if (!scanId || !findingId) throw Error("You must specify a project and a finding ID to export.");
    var scan = this.scans.find(scan => scan.id == scanId);
    var finding = scan.issues.find(issue => issue.uuid == findingId);
    if (!finding) throw Error(`Could not locate finding UUID "${findingId}" in scan "${scanId}"`);
    options.outputOptions = Object.assign({}, options.outputOptions, { showTableSummary: false, showFindings: true });
    var report = await writeIssues(scan.options.input, options.outputOptions, options.outputPath, [finding], options.outputFileFormat, this.label);
    return report;
  }

  
  /**
   * New method for showing the details of the findings in the electrong UI
   * @param {} scanId 
   * @param {*} findingId 
   * @param {*} options 
   * @returns 
   */
  async _generateDetailsViewForFinding(scanId, findingId, options) {

    if (!scanId || !findingId) throw Error("You must specify a project and a finding ID to export.");
    var scan = this.scans.find(scan => scan.id == scanId);
    var finding = scan.issues.find(issue => issue.uuid == findingId);
    if (!finding) throw Error(`Could not locate finding UUID "${findingId}" in scan "${scanId}"`);
    options.outputOptions = Object.assign({}, options.outputOptions, { showTableSummary: false, showFindings: true });
    let report = getHTMLDetailForFinding([finding])
    return report;
  }


  _getFileArtifact(sha) {
    // we assume that the project is unpacked
    if (!sha) throw Error("You must specify a SHA2 for a file (fileAttr.sha2) to get it from the artifacts cache of the project file.");
    var requestedArtifactPath = path.resolve(this.tmpPath, 'artifacts', sha);
    if (input_exists(requestedArtifactPath)) {
      return fs.readFileSync(requestedArtifactPath);
    } else throw Error(`Could not locate artifact with SHA2 "${sha}" in this project file`);
  }


  _getTopFiles(scanId, max = 10) {

    var filesList;
    if (scanId) {
      var scan = this.scans.find(scan => scan.id == scanId)
      var basePath = scan.options.input;

      filesList = scan.issues.reduce(function(obj, item) {
           let filePath = item.file != "N/A" ? path.relative(basePath, item.file) : item.file;
           obj[filePath] = (obj[filePath] || 0) + 1;
           return obj;
       }, {});
    } else {

      for (var scan of this.scans) {
        var basePath = scan.options.input;

        var ladder = scan.issues.reduce(function(obj, item) {
           let filePath = item.file != "N/A" ? path.relative(basePath, item.file) : item.file;
           obj[filePath] = (obj[filePath] || 0) + 1;
           return obj;
        }, {});

        if (!filesList)
          filesList = ladder;
        else {
          for (var filePath of Object.keys(ladder)) {
            if (filesList[filePath])
              filesList[filePath] += ladder[filePath]
            else
              filesList[filePath] = ladder[filePath];
          }
        }
      };
    }

      var sortable = [];

      for (var issue in filesList) {
          sortable.push([issue, filesList[issue]]);
      }

      //descending
      sortable.sort(function(a, b) {
          return b[1] - a[1];
      });

      return sortable.slice(0, max);

  }

  _getTopIssues(scanId, max = 10) {

    var issuesList;
    if (scanId) {
      var scan = this.scans.find(scan => scan.id == scanId)
      issuesList = scan.issues.reduce(function(obj, item) {
           obj[item.id] = (obj[item.id] || 0) + 1;
           return obj;
       }, {});
    } else {

      for (var scan of this.scans) {
        var ladder = scan.issues.reduce(function(obj, item) {
           obj[item.id] = (obj[item.id] || 0) + 1;
           return obj;
        }, {});

        if (!issuesList)
          issuesList = ladder;
        else {
          for (var issueId of Object.keys(ladder)) {
            if (issuesList[issueId])
              issuesList[issueId] += ladder[issueId]
            else
              issuesList[issueId] = ladder[issueId];
          }
        }

      };

    }

      var sortable = [];

      for (var issue in issuesList) {
          sortable.push([issue, issuesList[issue]]);
      }

      //descending
      sortable.sort(function(a, b) {
          return b[1] - a[1];
      });

      return sortable.slice(0, max);
  }

  async add(details) {
    this.lastDetails = details;
    if (!input_exists(this.projectPath))
      await this.initializeProject();
    
    await this.updateProject(details).catch(e => {throw new Error(e)});
 }

  async initializeProject(input) {
    var lastKnownLocation;
    
    if (input)
      lastKnownLocation = input;
    else
      lastKnownLocation = this.lastDetails.options.input

    var info = await this.getSystemInfo();

    var projectIndex = {
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastKnownLocation: lastKnownLocation,
        formatVersion: this.formatVersion,
        label: this.label,
        systemInfo: info,
        createdWith: this.lastDetails ? this.lastDetails.scannerVersion : require('../../package.json').version
    };

    this.index = projectIndex;

    fs.writeFileSync(path.resolve(this.tmpPath, 'index.json'), JSON.stringify(projectIndex));
  }

  async storeScannedFileArtifacts(details) {
    var artifactsDir = path.resolve(this.tmpPath, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir);
    }

    var promises = details.issues.map(async (promise, i, issues) => {
              if (issues[i].file !== "N/A") {
                var currentArtifactFilePath = path.resolve(artifactsDir, issues[i].fileAttr.sha2);
                if (!fs.existsSync(currentArtifactFilePath)){
                  fs.writeFileSync(currentArtifactFilePath, issues[i].fileAttr.content)
                }
                delete issues[i].fileAttr.content;
              }
              return issues[i];
        });

    details.issues = await Promise.all(promises)
    return details;
  }

  async updateProject(details, scanUUID) {
    if (!scanUUID)
      scanUUID = uuidv1();

    var tmpPath = this.tmpPath;
    
    if (input_exists(path.resolve(tmpPath, 'index.json'))) {
    // freshly initialized project
        details = await this.storeScannedFileArtifacts(details);

        fs.writeFileSync(path.resolve(tmpPath, `${scanUUID}.json`), JSON.stringify(details));
        await this.createEngFile(details.options.projectFile);
    } else {
    // project must be unpacked first!

        await this.extractEngFile(details.options.projectFile);

        // update index.json's details
        var rawIndexFile = fs.readFileSync(path.resolve(tmpPath, 'index.json'));
        var projectIndex = JSON.parse(rawIndexFile);

        projectIndex.updatedAt = new Date();
        projectIndex.lastKnownLocation = details.options.input;

        fs.writeFileSync(path.resolve(tmpPath, 'index.json'), JSON.stringify(projectIndex));
        details = await this.storeScannedFileArtifacts(details);

        // This try-catch is necessary because sometimes the results of a scan are too big for the JSON.stringify method.
        // Catching and throwing the error up in the callstack avoid the scan hungs (especially in the frontend UI)
        try {
          // write project to user-controlled location
          fs.writeFileSync(path.resolve(tmpPath, `${scanUUID}.json`), JSON.stringify(details));

          await this.createEngFile(details.options.projectFile);
  
        } catch (error) {
          throw Error(error);
        }
    }
  }


  async deleteScan(scanUUID) {
    if (!scanUUID)
      throw Error("You need to pass a scan UUID to delete it!")

    var tmpPath = this.tmpPath;
    
    if (input_exists(path.resolve(tmpPath, 'index.json'))) {
      // freshly initialized project
        fs.unlinkSync(path.resolve(tmpPath, `${scanUUID}.json`));
        await this.createEngFile(this.projectPath);
    } else {
    // project must be unpacked first!

        await this.extractEngFile(this.projectPath);

        // update index.json's details
        var rawIndexFile = fs.readFileSync(path.resolve(tmpPath, 'index.json'));
        var projectIndex = JSON.parse(rawIndexFile);

        projectIndex.updatedAt = new Date();
        projectIndex.lastKnownLocation = details.options.input;

        // delete scan to user-controlled location, but check first if it's there in the first place. If not, we probably have a race and since it's a destructive action we make it pass
        if (input_exists(path.resolve(tmpPath, `${scanUUID}.json`)))
          fs.unlinkSync(path.resolve(tmpPath, `${scanUUID}.json`));

        fs.writeFileSync(path.resolve(tmpPath, 'index.json'), JSON.stringify(projectIndex));

        await this.createEngFile(this.projectPath);
    }
  }


  async createEngFile(projectFile) {
    tar.c({
      gzip: false,
      file: projectFile,
      cwd: this.tmpPath,
      sync: true,
      portable: true,
      preservePaths: false
    }, [ '.' ]);
  }

  async extractEngFile(projectFile) {
    tar.x({
      strip: 1,
      cwd: this.tmpPath,
      sync: true,
      file: projectFile
    });
  }

  async load() {
    await this.extractEngFile(this.projectPath);
    // update index.json's details
    var rawIndexFile = fs.readFileSync(path.resolve(this.tmpPath, 'index.json'));
    this.index = JSON.parse(rawIndexFile);
    fs.readdirSync(this.tmpPath).forEach(file => {
        if (file != "index.json") { // we discard the index
          if (path.extname(file) == ".json") { // we don't read the artifacts dir
            let scan = JSON.parse(fs.readFileSync(path.resolve(this.tmpPath, file)));
            scan.id = file.split(".")[0];
            scan.createdAt = new Date(uuidTime.v1(scan.id));
            this.scans.push(scan);
          }
        }
    })
    return this;
  }


  async getSystemInfo() {
    var os = await si.osInfo();

    return {
        os: {
            name: os.distro,
            version: os.release
        }
    };
  }

}