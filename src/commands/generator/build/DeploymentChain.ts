import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { ActionResult } from "@atomist/automation-client/action/ActionResult";

export interface Deployment extends ActionResult<LocalProject> {

    log: string;
    url: string;
}

export interface DeploymentChain {

    build<P extends LocalProject>(p: P): Promise<ActionResult<P>>;

    deploy<P extends LocalProject>(p: P): Promise<Deployment>;

}