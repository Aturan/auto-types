import fetch from 'node-fetch';
import * as path from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs';
import { TypesAwerePackageInfo, PackageInfo } from './model';

// constants
export const packageJsonPath = path.resolve(process.cwd(), './package.json');
export const configPath = path.resolve(process.cwd(), './types-rc.json');

export function initConfig() {
  if (!fs.existsSync(configPath)) {
    fs.copyFileSync(path.join(__dirname, 'sample.json'), configPath);
  }
}

// util functions
export function getPackageTypes(packageName: string): Promise<PackageInfo> {
  const typeName = '@' + encodeURIComponent(`types/${packageName}`);

  return fetch(`http://registry.npmjs.org/${typeName}`)
    .then(res => res.json())
    .then(json => ({
      name: `@types/${packageName}`,
      version: json['dist-tags'].latest
    }))
    .catch(_ => null);
}

export function isSetupValid(): [boolean, string] {
  if (!fs.existsSync(packageJsonPath)) {
    return [false, 'package.json is missing'];
  } else {
    return [true, null];
  }
}

export function getInvalidPackagesTypesInfo(packages: PackageInfo[]): Promise<TypesAwerePackageInfo[]> {
  console.log(packages);
  const getTypesForAll = packages.map((dependency) => {
    return getPackageTypes(dependency.name)
      .then(dependencyTypes => ({
        dependencyTypes,
        dependency
      }));
  });

  return Promise.all(getTypesForAll)
    .then(dependenciesAndTypes => dependenciesAndTypes.filter(_ => !!_.dependencyTypes));
}

export function getDependencies(): PackageInfo[] {
  const packageJson = require(packageJsonPath);
  const dependencies: { [key: string]: string } = { ...(packageJson.dependencies || {}) };

  return Object.entries(dependencies)
    .map(([name, version]) => ({ name, version }))
    .filter(({ name }) => !name.includes('@types/'));
}

export function getInvalidTypeDependencies(): PackageInfo[] {
  const packageJson = require(packageJsonPath);
  const devDependencies: { [key: string]: string } = { ...(packageJson.devDependencies || {}) };
  const dependencies: { [key: string]: string } = { ...(packageJson.dependencies || {}) };

  return Object.entries(devDependencies)
    .map(([name, version]) => ({ name, version }))
    .filter(({ name }) => name.includes('@types/'))
    .filter(({name}) => {
      const namesOfdevDependencies = Object.keys(devDependencies);
      const namesOfDependencies = Object.keys(dependencies);
      console.log(namesOfDependencies);
      return devDependencies;
    });
}

export function sortObjectKeys(obj: object) {
  return Object.entries(obj)
    .sort(([key1], [key2]) => {
      if (key1 > key2) {
        return 1;
      } else if (key1 < key2) {
        return -1;
      } else {
        return 0;
      }
    })
    .reduce(
      (agg, [key, value]) => ({ ...agg, [key]: value }),
      {}
    );
}
