#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';

import minimist from 'minimist';
import {
  blue,
  cyan,
  green,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from 'kolorist';
import prompts from 'prompts';

// always treat project name (first argument ( _ )) as string
const argv = minimist(process.argv.slice(2), { string: ['_'] });

const PROJECT_TYPE = [
  {
    name: 'devtools',
    color: yellow,
    variants: [
      {
        name: 'devtools',
        color: yellow,
      },
      {
        name: 'devtools-ts',
        color: blue,
      },
    ],
  },
  {
    name: 'devtools-belialuin',
    color: red,
    variants: [
      {
        name: 'devtools-belialuin',
        color: yellow,
      },
      {
        name: 'devtools-belialuin-ts',
        color: blue,
      },
    ],
  },
];

const TEMPLATES = PROJECT_TYPE.map(
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
              : `Target directory ${targetDir}`) +
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
          name: 'projectTemplate',
          message:
            typeof template === 'string' && !TEMPLATES.includes(template)
              ? `"${template}" is not a valid template. Please choose from below:`
              : 'Select project type:',
          initial: 0,
          choices: PROJECT_TYPE.map(projectTemplate => {
            const displayColor = projectTemplate.color;
            return {
              title: displayColor(projectTemplate.name),
              value: projectTemplate,
            };
          }),
        },
        {
          type: projectTemplate =>
            projectTemplate && projectTemplate.variants ? 'select' : null,
          name: 'variant',
          message: 'Select a variant:',
          choices: projectTemplate =>
            projectTemplate.variants.map(variant => {
              const displayColor = variant.color;
              return {
                title: displayColor(variant.name),
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
};

/**
 * @param {string | undefined} targetDir
 */
const formatTargetDir = targetDir => {
  return targetDir?.trim().replace(/\/+$/g, '');
};

/**
 * @param {string} path
 */
const isEmpty = path => {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
};

/**
 * @param {string} projectName
 */
const isValidPackageName = projectName => {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
};

/**
 * @param {string} projectName
 */
const toValidPackageName = projectName => {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');
};

main().catch(e => {
  console.error(e);
});
