import { Deployment, DeploymentChain } from "./DeploymentChain";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { ActionResult, successOn } from "@atomist/automation-client/action/ActionResult";
import { logger } from "@atomist/automation-client/internal/util/logger";

export function build<P extends LocalProject>(p: P): Promise<ActionResult<P>> {
    return runCommand("mvn package", {
        cwd: p.baseDir,
        maxBuffer: 1024 * 1000,
    })
        .then(r => {
            logger.info("Maven build completed OK");
            return r;
        })
        .then(r => successOn(p));
}

export function deploy<P extends LocalProject>(ar: ActionResult<P>): Promise<Deployment> {

    const api = "https://api.run.pivotal.io";
    const username = "rod@atomist.com";
    const password = "sfatomist2016!X";
    const space = "development";
    const org = "springrod";

    // TODO get names from Maven pom.
    const name = "pong-matcher-spring";
    const version = "1.0.0";

    logger.info("Deploying app [%s] to Cloud Foundry at [%s]", name, api);

    return runCommand(`cf login -a ${api} -o ${org} -u ${username} -p "${password}" -s ${space}`,
        {cwd: ar.target.baseDir})// [-o ORG] [-s SPACE]`)
        .then(_ => {
            console.log("Successfully logged into Cloud Foundry as [%s]", username);
            return _;
        })
        .then(() =>
            // TODO function to return name
            runCommand(`cf push ${name} -p target/${name}-${version}.BUILD-SNAPSHOT.jar --random-route`,
                {cwd: ar.target.baseDir})
                .catch(err => {
                    logger.warn("Failed to deploy to cloud foundry: %j", err);
                    return Promise.reject(err);
                })
                .then(r => ({
                    success: r.success,
                    log: r.stdout,
                    target: ar.target,
                    url: toUrl(name),
                }))
        );
}

function toUrl(name: string) {
    return `http://${name}.cfapps.io/`;
}