import { Finder } from './finder';
import { GlobalChecks } from './globalchecks';
import { LambdaChecks } from './lambdachecks';
import { severity, confidence, triage } from './attributes';

module.exports.Finder = Finder;
module.exports.GlobalChecks = GlobalChecks;
module.exports.LambdaChecks = LambdaChecks;
module.exports.severity = severity;
module.exports.confidence = confidence;
module.exports.triage = triage;