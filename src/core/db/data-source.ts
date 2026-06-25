import { envs } from "src/config/envs";
import { Incident } from "./entities/incident.entity";
import { DataSource, DataSourceOptions } from "typeorm";


export const dataSourceOptions : DataSourceOptions = {
    host: envs.DB_HOST,
    type: 'postgres',
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    username: envs.DB_USER,
    password: envs.DB_PASSWORD,
    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
    synchronize: true,
    migrations: ["dist/core/db/migrations/*"]
}

export const dataSource = new DataSource(dataSourceOptions);