import * as fs from 'fs';
import { getDependencies, getInvalidPackagesTypesInfo, packageJsonPath, sortObjectKeys, isSetupValid, getInvalidTypeDependencies, initConfig } from './util';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default async function main() {
  const [isValid, message] = isSetupValid();
  if (!isValid) {
    console.log(chalk.red(message));
    return;
  }

  initConfig();

  const dependencies = getDependencies();
  const invalidTypeDependencies = getInvalidTypeDependencies();
  const packageTypes = await getInvalidPackagesTypesInfo(dependencies);

  if (invalidTypeDependencies.length > 0) {
    const packageNames = invalidTypeDependencies.reduce
  }

  const packageJson = require(packageJsonPath);
  const oldDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  if (Object.keys(oldDependencies).length === 0) {
    console.log(chalk.yellow('There are no dependencies in package.json'));
    return;
  }

  const newTypeDependencies = packageTypes
    .filter(_ => {
      // add only not present types
      const oldDependenciesNames = Object.keys(oldDependencies);
      return !oldDependenciesNames.includes(_.dependencyTypes.name);
    });

  if (newTypeDependencies.length === 0) {
    console.log(chalk.yellow('No new types was found to match dependencies'));
    return;
  }

  const newTypeDependenciesMap = newTypeDependencies
    .map(({ dependencyTypes }) => dependencyTypes)
    .reduce(
      (agg, { name, version }) => ({ ...agg, [name]: version }),
      {}
    );

  const newPackageJson = {
    ...packageJson,
    devDependencies: sortObjectKeys({
      ...packageJson.devDependencies,
      ...newTypeDependenciesMap
    })
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

  console.log(chalk.green('Installed types:'));
  newTypeDependencies
    .forEach(dep => {
      const { name, version } = dep.dependencyTypes;
      console.log(chalk.green(`\t${name}:${version}`));
    });
  console.log(chalk.green('package.json updated, run npm install'));
}
