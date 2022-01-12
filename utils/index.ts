export const requireEnvVariables = (envVars: string[]) => {
    for (const envVar of envVars) {
      if (!process.env[envVar]) {
        throw new Error(`Error: set'${envVar}' in .env `);
      }
    }
};
