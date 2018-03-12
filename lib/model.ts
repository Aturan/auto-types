export interface PackageInfo {
  name: string;
  version: string;
}

export interface TypesAwerePackageInfo {
  dependency: PackageInfo;
  dependencyTypes: PackageInfo;
}
