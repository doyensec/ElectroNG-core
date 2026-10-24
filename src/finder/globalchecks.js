import { ELECTRON_GLOBAL_UPGRADE_CHECKS } from './checks/GlobalChecks/ElectronGlobalUpgradeChecks';
import { GLOBAL_CHECKS } from './checks/GlobalChecks';
import { v4 as uuidv4 } from 'uuid';

export class GlobalChecks {
    constructor(customScan, excludeFromScan, electronUpgrade) {
        let candidateChecks = Array.from(GLOBAL_CHECKS);

        // init electron-upgrade specific checks given user-provided version numbers
        if (electronUpgrade) {
          const [currentVersion, targetVersion] = electronUpgrade.split('..');
          if (currentVersion && targetVersion) {
            this._enabled_checks = [];
            Object.keys(ELECTRON_GLOBAL_UPGRADE_CHECKS).forEach(versionToCheck => {
              if (versionToCheck > currentVersion && versionToCheck <= targetVersion) {
                candidateChecks = candidateChecks.concat(ELECTRON_GLOBAL_UPGRADE_CHECKS[versionToCheck]);
              }
            })
          } else {
            throw Error(`When specifying the upgrade options please specify your current version and target version like this: x..y (eg 7..8)`);
          }
        }

        // if the user is trying to start a custom check scan, we first load all the available checks (candidateChecks) and then we splice those who don't match the user-provided list
        this._enabled_checks = candidateChecks;
        if (customScan && customScan.length > 0) {
          var globalChecksNames = this._enabled_checks.map(globalCheck => globalCheck.name.toLowerCase());
          var customGlobals = customScan.filter(r => r.includes('globalcheck'));
          if (customGlobals.length > 0 && !customGlobals.some(r => globalChecksNames.includes(r))) {
            throw Error(`You have an error in your custom checks list. Maybe you misspelt some check names?`);
          } else {
          for (var i = globalChecksNames.length - 1; i >= 0; i--) 
            if (!customGlobals.includes(globalChecksNames[i]))
            this._enabled_checks.splice(i, 1);
          }
        }

        // the exclusion list has the last word over the list of loaded checks
        if (excludeFromScan && excludeFromScan.length > 0) {
          var globalChecksNames = this._enabled_checks.map(globalCheck => globalCheck.name.toLowerCase());
          var customGlobals = excludeFromScan.filter(r => r.includes('globalcheck'));
          if (customGlobals.length > 0 && !customGlobals.some(r => globalChecksNames.includes(r))) {
            throw Error(`You have an error in your custom checks list. Maybe you misspelt some check names?`);
          } else {
          for (var i = globalChecksNames.length - 1; i >= 0; i--) 
            if (customGlobals.includes(globalChecksNames[i]))
            this._enabled_checks.splice(i, 1);
          }
        }
        this._constructed_checks = [];
        this.dependencies = [];
        this.init_checks_list();
    }

    init_checks_list() {
      for (const check of this._enabled_checks) {
        const checkInstance = new check();
        this._constructed_checks.push(checkInstance);
        this.dependencies = [...this.dependencies, ...checkInstance.depends];
      }
      // useful in case some globalcheck dependency on the list has non-lowercase characters
      this.dependencies = this.dependencies.map(dependency => dependency.toLowerCase());
    }

    async getResults(issues, output) {
      var result = [];
      // we use the `processed` flag to track down which issues will be left untouched by the global checks (i.e. non-dependencies)
      issues.forEach(issue => issue.processed = false);

      await this._constructed_checks.reduce(async (promise, check) => {
              await promise;
              issues.forEach(issue => {
                if (check.depends.includes(issue.constructorName))
                  issue.processed = true
              });

              var targetedIssues = issues.filter(issue => check.depends.includes(issue.constructorName) && !issue.visibility.inlineDisabled);
              var globalIssues = await check.perform(targetedIssues);

              globalIssues.forEach((issue, index) => {
                globalIssues[index].uuid = uuidv4();
                if (check.decorator)
                  globalIssues[index].isDecorator = true;
                else
                  globalIssues[index].isDecorator = false;
              });

              result = [...result, ...globalIssues].filter((issue, index, self) =>
                index === self.findIndex((t) => (
                  t.uuid === issue.uuid
                ))
              )
        }, Promise.resolve());


      // in the end we merge the results of the global checks with the other untouched checks
      var final = [...result, ...issues.filter(issue => !issue.processed)];
      return final;
    }

}