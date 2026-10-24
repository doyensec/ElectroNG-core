import AffinityGlobalCheck from './AffinityGlobalCheck';
import AvailableSecurityFixesGlobalCheck from './AvailableSecurityFixesGlobalCheck';
import CSPGlobalCheck from './CSPGlobalCheck';
import LimitNavigationGlobalCheck from './LimitNavigationGlobalCheck';
import PermissionRequestHandlerGlobalCheck from './PermissionRequestHandlerGlobalCheck';
import HTTPResourcesAndNodeIntegrationGlobalCheck from './HTTPResourcesAndNodeIntegrationGlobalCheck';
import UnsupportedVersionGlobalCheck from './UnsupportedVersionGlobalCheck';
import CertificatePinningGlobalCheck from './CertificatePinningGlobalCheck';
import FileHandlerGlobalCheck from './FileHandlerGlobalCheck';
import PreloadGlobalCheck from './PreloadGlobalCheck';
import SecureKeyboardEntryGlobalCheck from './SecureKeyboardEntryGlobalCheck';
import FrameworkVulnerabilityGlobalCheck from './FrameworkVulnerabilityGlobalCheck';

const GLOBAL_CHECKS = [
  AffinityGlobalCheck,
  AvailableSecurityFixesGlobalCheck,
  CSPGlobalCheck,
  LimitNavigationGlobalCheck,
  PermissionRequestHandlerGlobalCheck,
  HTTPResourcesAndNodeIntegrationGlobalCheck,
  UnsupportedVersionGlobalCheck,
  CertificatePinningGlobalCheck,
  FileHandlerGlobalCheck,
  PreloadGlobalCheck,
  SecureKeyboardEntryGlobalCheck,
  FrameworkVulnerabilityGlobalCheck
];

module.exports.GLOBAL_CHECKS = GLOBAL_CHECKS;
