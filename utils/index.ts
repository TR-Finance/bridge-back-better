// eslint-disable-next-line import/prefer-default-export
export const requireEnvVariables = (envVars: string[]) =>
  envVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable was not set. Set '${envVar}' in .env`);
    }
  });
