import { execaCommandSync } from 'execa';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '..');
const projectName = 'test-app';
const genPath = path.resolve(__dirname, projectName);
const templateFiles = fs
  .readdirSync(path.resolve(CLI_PATH, 'template-react-vite-ts'))
  .sort();

describe('cli test', () => {
  beforeAll(() => {
    if (fs.existsSync(genPath)) {
      fs.rmSync(genPath, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(genPath)) {
      fs.rmSync(genPath, { recursive: true, force: true });
    }
  });

  it('should prompts for the project name if none supplied', async () => {
    const { stdout } = execaCommandSync(`node ${CLI_PATH}`);

    expect(stdout).toContain('Project name:');
  });
  it('should prompts for the framework if none supplied when target dir is current directory', () => {
    fs.mkdirSync(genPath, { recursive: true });

    const { stdout } = execaCommandSync(`node ${CLI_PATH} .`, { cwd: genPath });

    expect(stdout).toContain('Select project type:');
  });
  it('should prompts for the framework if none supplied', () => {
    const { stdout } = execaCommandSync(`node ${CLI_PATH} ${projectName}`);

    expect(stdout).toContain('Select project type:');
  });
  it('should prompts for the framework on not supplying a value for --template', () => {
    const { stdout } = execaCommandSync(
      `node ${CLI_PATH} ${projectName} --template`
    );

    expect(stdout).toContain('Select project type:');
  });
  it('should prompts for the framework on supplying invalid template', () => {
    const { stdout } = execaCommandSync(
      `node ${CLI_PATH} ${projectName} --template=invalid-template`
    );

    expect(stdout).toContain(
      `"invalid-template" is not a valid template. Please choose from below:`
    );
  });
  it('should ask to overwrite non-empty target directory', () => {
    fs.mkdirSync(genPath, { recursive: true });

    // Create a package.json file
    const pkgJson = path.resolve(genPath, 'package.json');

    fs.writeFileSync(pkgJson, '{ "foo": "bar" }');

    const { stdout } = execaCommandSync(`node ${CLI_PATH} ${projectName}`, {
      cwd: __dirname,
    });

    expect(stdout).toContain(`Target directory "${projectName}" is not empty.`);
  });
  it('should ask to overwrite non-empty current directory', () => {
    fs.mkdirSync(genPath, { recursive: true });

    // Create a package.json file
    const pkgJson = path.resolve(genPath, 'package.json');

    fs.writeFileSync(pkgJson, '{ "foo": "bar" }');

    const { stdout } = execaCommandSync(`node ${CLI_PATH} .`, {
      cwd: genPath,
    });

    expect(stdout).toContain(`Current directory is not empty.`);
  });
  it('should successfully scaffolds a project based on react-vite-ts starter template', () => {
    const { stdout } = execaCommandSync(
      `node ${CLI_PATH} ${projectName} --template=react-vite-ts`,
      {
        cwd: __dirname,
      }
    );

    const generatedFiles = fs.readdirSync(genPath).sort();

    expect(stdout).toContain(`Scaffolding project in ${genPath}`);
    expect(generatedFiles).toEqual(templateFiles);
  });
  it('should successfully scaffolds a project with -t alias', () => {
    const { stdout } = execaCommandSync(
      `node ${CLI_PATH} ${projectName} --t=react-vite-ts`,
      {
        cwd: __dirname,
      }
    );

    const generatedFiles = fs.readdirSync(genPath).sort();

    expect(stdout).toContain(`Scaffolding project in ${genPath}`);
    expect(generatedFiles).toEqual(templateFiles);
  });
});
