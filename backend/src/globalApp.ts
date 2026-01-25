import { INestApplication } from "@nestjs/common";

let app: INestApplication
export const getApp = (): INestApplication => {
    return app;
}

export const setApp = (appInstance: any) => {
    app = appInstance;
}   