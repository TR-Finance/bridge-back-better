// eslint-disable-next-line import/prefer-default-export
export const requireEnvVariables = (envVars: string[]) =>
  envVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Error: set'${envVar}' in .env `);
    }
  });
