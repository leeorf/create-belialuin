# create-belialuin

> Starter kit package for my projects.

## Disclaimer

This project is a much simpler version of
[create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite),
but instead of forking, I've decided to implement by myself to understand their
code. I'd like to thank the vite team for taking the time to create this great
tool for the community!

## Scaffolding project

With NPM:

```bash
$ npm create belialuin@latest
```

With Yarn:

```bash
$ yarn create belialuin
```

With PNPM:

```bash
$ pnpm create belialuin
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use
via additional command line options. For example, to scaffold a React + Vite +
TS project, run:

```bash
# npm 6.x
npm create belialuin@latest my-app --template react-vite-ts

# npm 7+, extra double-dash is needed:
npm create belialuin@latest my-app -- --template react-vite-ts

# yarn
yarn create belialuin my-vue-app --template react-vite-ts

# pnpm
pnpm create vite my-vue-app --template react-vite-ts
```

Currently supported template presets include:

- `react-vite-ts`

You can use `.` for the project name to scaffold in the current directory.
