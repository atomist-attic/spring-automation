import { ChildProcess } from "child_process";

export interface ProgressLog {
    write(what: string): void;
}

export const DevNullProgressLog: ProgressLog = {
    write() {
        // Do nothing
    },
};

export interface Deployment {

    childProcess: ChildProcess;
    url: string;
}

export interface CloudFoundryInfo {

    api: string;
    username: string;
    password: string;
    space: string;
    org: string;

}

/**
 * Info to send up for a cloud foundry deployment
 */
export interface AppInfo {

    name: string;
    version: string;
}

export const PivotalWebServices = { // : Partial<CloudFoundryInfo> = {

    api: "https://api.run.pivotal.io",
};
