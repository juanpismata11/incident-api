import * as appInsights from "applicationinsights";
import winston from "winston";
import { envs } from "./envs";

let aiClient: appInsights.TelemetryClient | undefined;

if (envs.APPINSIGHTS_CONNECTION_STRING) {
    appInsights
        .setup(envs.APPINSIGHTS_CONNECTION_STRING)
        .setSendLiveMetrics(true)
        .setAutoCollectConsole(false)
        .start();
    aiClient = appInsights.defaultClient;
}

const appInsightsTransports = new winston.transports.Console({
    level: "info",
    format: winston.format.printf((obj) => {
        const level = obj.level;
        const message = obj.message;
        const timestamp = obj.timestamp;
        
        if (aiClient) {
            aiClient.trackTrace({
                message: `[${level}] ${message} ${timestamp}`,
                properties: { timestamp }
            });
        }

        return `[${timestamp}] [${level}] ${message}`;
    })
});

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        appInsightsTransports
    ]
});