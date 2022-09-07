import { execaCommandSync } from 'execa';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '..');
const fakeDirName = 'test-app';
const fakeDirPath = path.resolve(__dirname, fakeDirName);
const templateFiles = fs
  .readdirSync(path.resolve(CLI_PATH, 'template-react-vite-ts'))
  .map(file => (file.includes('gitignore') ? '.gitignore' : file))
  .sort();

const run = (args, options) => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(' ')}`, options);
};

const createFakeDir = (contents = []) => {
  fs.mkdirSync(fakeDirPath, { recursive: true });

  if (contents.legth) {
    contents.forEach(content => {
      fs.writeFileSync(content.name, content.content);
    });
  }
};

const createNonEmptyDir = () => {
  fs.mkdirSync(fakeDirPath, { recursive: true });

  // Create a package.json file
  const pkgJson = path.resolve(fakeDirPath, 'package.json');

  fs.writeFileSync(pkgJson, '{ "foo": "bar" }');
};

const removeFakeDir = () => {
  if (fs.existsSync(fakeDirPath)) {
    fs.rmSync(fakeDirPath, { recursive: true, force: true });
  }
};

describe('cli test', () => {
  beforeAll(removeFakeDir);
  afterEach(removeFakeDir);

  it('should prompts for the project name if none supplied', async () => {
    const { stdout } = run([]);

    expect(stdout).toContain('Project name:');
  });
  it('should prompts for the framework if none supplied when target dir is current directory', () => {
    createFakeDir();

    const { stdout } = run(['.'], { cwd: fakeDirPath });

    expect(stdout).toContain('Select project type:');
  });
  it('should prompts for the framework if none supplied', () => {
    const { stdout } = run([fakeDirName]);

    expect(stdout).toContain('Select project type:');
  });
  it('should prompts for the framework on not supplying a value for --template', () => {
    const { stdout } = run([fakeDirName, '--template']);

    expect(stdout).toContain('Select project type:');
  });
  it('should prompts for the framework on supplying invalid template', () => {
    const { stdout } = run([fakeDirName, '--template', 'invalid-template']);

    expect(stdout).toContain(
      `"invalid-template" is not a valid template. Please choose from below:`
    );
  });
  it('should ask to overwrite non-empty target directory', () => {
    createNonEmptyDir();

    const { stdout } = run([fakeDirName], {
      cwd: __dirname,
    });

    expect(stdout).toContain(`Target directory "${fakeDirName}" is not empty.`);
  });
  it('should ask to overwrite non-empty current directory', () => {
    createNonEmptyDir();

    const { stdout } = run(['.'], {
      cwd: fakeDirPath,
    });

    expect(stdout).toContain(`Current directory is not empty.`);
  });
  it('should successfully scaffolds a project based on react-vite-ts starter template', () => {
    const { stdout } = run([fakeDirName, '--template', 'react-vite-ts'], {
      cwd: __dirname,
    });

    const generatedFiles = fs.readdirSync(fakeDirPath).sort();

    expect(stdout).toContain(`Scaffolding project in ${fakeDirPath}`);
    expect(generatedFiles).toEqual(templateFiles);
  });
  it('should successfully scaffolds a project with -t alias', () => {
    const { stdout } = run([fakeDirName, '-t', 'react-vite-ts'], {
      cwd: __dirname,
    });

    const generatedFiles = fs.readdirSync(fakeDirPath).sort();

    expect(stdout).toContain(`Scaffolding project in ${fakeDirPath}`);
    expect(generatedFiles).toEqual(templateFiles);
  });

  it('should copy _gitigore file ranamed to .gitignore', () => {
    const { stdout } = run([fakeDirName, '--template', 'react-vite-ts'], {
      cwd: __dirname,
    });

    const generatedFiles = fs.readdirSync(fakeDirPath).sort();

    expect(generatedFiles).toContain('.gitignore');
  });
});
