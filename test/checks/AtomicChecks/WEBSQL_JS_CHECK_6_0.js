const app = new Application({
  path,
  args,
  env: {
    NODE_ENV: environment,
  },
  requireName: 'unused',
});