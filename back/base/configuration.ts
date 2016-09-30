module Configuration {

export interface Config {
  is_development_env: boolean;
  ip_address: string;
  port: number;
  psql_settings: string;
}

export function IsProductionEnvironment(): boolean {
  return process.env.OPENSHIFT_NODEJS_IP && process.env.OPENSHIFT_NODEJS_PORT;
}

export function GetConfig(): Config {
  // Default to development environment.
  let config: Config = {
    is_development_env: true,
    ip_address: "0.0.0.0",
    port: 8080,
    psql_settings: "",
  }
  let authentication_string = "";
  let psql_host = "localhost";
  if (IsProductionEnvironment()) {
    config.is_development_env = false;
    config.ip_address = process.env.OPENSHIFT_NODEJS_IP;
    config.port = parseInt(process.env.OPENSHIFT_NODEJS_PORT);
    authentication_string = process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME +
        ":" + process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD + "@";
    psql_host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST;
  }
  config.psql_settings =
      `postgres://${authentication_string}${psql_host}/netnote`;
  return config;
}

}  // module Configuration

export = Configuration;
