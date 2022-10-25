/**
 * Retrieve environment variables for given list of string keys. If the variables are missing,
 * the process will exit as the program won't be usable without the keys.
 *
 * @param envNames A list of environment names you expect to exists as a list of strings
 * @param exitOnMissingVariable Optional: Whether to process.exit if missing environment. Defaults to true
 * @returns A list of string values based on the given environment variable list
 */
export function requireEnv(
  envNames: string[],
  exitOnMissingVariable = true
): string[] {
  const envValues: string[] = [];

  envNames.forEach((env) => {
    const value = process.env[env];

    if (value === undefined) {
      console.error(`Missing required system environment variable '${env}'`);
      const winSetEnv = `
In CMD

set ${env}="<yourValue>"

or PS

$Env.${env} = "<yourValue>"
      `.trim();
      const otherSetEnv = `$ export ${env}="<yourValue>"`;
      console.error(
        `
To set the variable, run the following in the command line for a session wide set of the variable:

${process.platform === "win32" ? winSetEnv : otherSetEnv}

Replace <yourValue> with a value that makes sense for the variable

      `.trim()
      );
      if (exitOnMissingVariable) {
        process.exit(1);
      }
    }

    envValues.push(value ?? "");
  });

  return envValues;
}
