import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { ActionResult } from "@atomist/automation-client/action/ActionResult";

export interface Deployment extends ActionResult<LocalProject> {

    log: string;
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

export const PivotalWebServices = { //: Partial<CloudFoundryInfo> = {

    api: "https://api.run.pivotal.io",
};

// TODO maybe don't need this
export interface DeploymentChain {

    build<P extends LocalProject>(p: P): Promise<ActionResult<P>>;

    deploy<P extends LocalProject>(p: P): Promise<Deployment>;

}