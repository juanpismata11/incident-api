import * as dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

export const envs = {
    MAPBOX_TOKEN: env.get("MAPBOX_TOKEN").default("pk_dummy").asString(),
    MAILER_EMAIL: env.get("MAILER_EMAIL").default("noreply@app.com").asString(),
    MAILER_PASSWORD: env.get("MAILER_PASSWORD").default("dummy").asString(),
    MAILER_SERVICE: env.get("MAILER_SERVICE").default("gmail").asString(),
    DB_PASSWORD: env.get("DB_PASSWORD").required().asString(),
    DB_NAME: env.get("DB_NAME").required().asString(),
    DB_PORT: env.get("DB_PORT").required().asPortNumber(),
    DB_HOST: env.get("DB_HOST").required().asString(),
    DB_USER: env.get("DB_USER").required().asString(),
    PORT: env.get("PORT").default("3000").asPortNumber(),
    APPINSIGHTS_CONNECTION_STRING: env.get("APPINSIGHTS_CONNECTION_STRING").default("").asString(),
    REDIS_HOST: env.get("REDIS_HOST").required().asString(),
    REDIS_PORT: env.get("REDIS_PORT").required().asPortNumber()
};