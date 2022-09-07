#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import minimist from 'minimist';
import { blue, cyan, red } from 'kolorist';
import prompts from 'prompts';

// always treat project name (first argument ( _ )) as string
const argv = minimist(process.argv.slice(2), { string: ['_'] });
const cwd = process.cwd();

const FRAMEWORKS = [
  {
    name: 'react-vite',
    display: 'React Vite',
    color: cyan,
    variants: [
      {
        name: 'react-vite-ts',
        display: 'Typescript',
        color: blue,
      },
    ],
  },
];

const TEMPLATES = FRAMEWORKS.map(
  f => (f.variants && f.variants.map(v => v.name)) || f.name
).reduce((a, b) => a.concat(b), []);

const main = async () => {
  let targetDir = formatTargetDir(argv._[0]);
  let template = argv.template || argv.t;

  const defaultTargetDir = 'basic-project';
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir;

  let result = {};

  try {
    result = await prompts(
      [
        {
          type: targetDir ? null : 'text',
          name: 'projectName',
          message: 'Project name:',
          initial: defaultTargetDir,
          onState: state => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
          name: 'overwriteDir',
          message: () =>
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ' is not empty. Remove existing files and continue?',
        },
        {
          type: (_, { overwriteDir = {} }) => {
            if (!overwriteDir) {
              throw new Error(red('✖') + ' Operation cancelled');
            }
            return null;
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: 'Package name:',
          initial: () => toValidPackageName(getProjectName()),
          validate: dir =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },
        {
          type: template && TEMPLATES.includes(template) ? null : 'select',
          name: 'framework',
          message:
            typeof template === 'string' && !TEMPLATES.includes(template)
              ? `"${template}" is not a valid template. Please choose from below:`
              : 'Select project type:',
          initial: 0,
          choices: FRAMEWORKS.map(framework => {
            const displayColor = framework.color;
            return {
              title: displayColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
        {
          type: framework =>
            framework && framework.variants ? 'select' : null,
          name: 'variant',
          message: 'Select a variant:',
          choices: framework =>
            framework.variants.map(variant => {
              const displayColor = variant.color;
              return {
                title: displayColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled');
        },
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    return;
  }

  const userPromptsChoice = result;
  const { overwriteDir, packageName, framework, variant } = userPromptsChoice;

  const root = path.join(cwd, targetDir);

  if (overwriteDir) {
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  template = variant || framework || template;

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm';
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.');

  console.log(`\nScaffolding project in ${root}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '..',
    `template-${template}`
  );

  const write = (file, content) => {
    const targetPath = path.join(root, file);

    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);

  files
    .filter(file => file !== 'package.json')
    .forEach(file => {
      write(file);
    });

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8')
  );

  pkg.name = packageName || getProjectName();

  write('package.json', JSON.stringify(pkg, null, 2));

  console.log(`\nDone. Now run:\n`);

  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`);
  }

  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn');
      break;
    default:
      console.log(`  ${pkgManager} install`);
      break;
  }

  console.log();
};

/**
 * @param {string | undefined} targetDir
 * @returns {string | undefined}
 */
const formatTargetDir = targetDir => {
  return targetDir?.trim().replace(/\/+$/g, '');
};

/**
 * @param {string} path
 * @returns {boolean}
 */
const isEmpty = path => {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
};

/**
 * @param {string} projectName
 * @returns {boolean}
 */
const isValidPackageName = projectName => {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
};

/**
 * @param {string} projectName
 * @returns {string}
 */
const toValidPackageName = projectName => {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');
};

/**
 * @param {string} src
 * @param {string} dest
 * @returns {void}
 */
const copy = (src, dest) => {
  const srcInfo = fs.statSync(src);

  if (srcInfo.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};

/**
 * @param {string} srcDir
 * @param {string} destDir
 * @returns {void}
 */
const copyDir = (srcDir, destDir) => {
  fs.mkdirSync(destDir, { recursive: true });

  fs.readdirSync(srcDir).forEach(file => {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  });
};

/**
 * @param {string | undefined} userAgent process.env.npm_config_user_agent
 * @returns object | undefined
 */
const pkgFromUserAgent = userAgent => {
  if (!userAgent) {
    return undefined;
  }
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
};

main().catch(e => {
  console.error(e);
});
