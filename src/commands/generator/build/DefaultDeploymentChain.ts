import { AppInfo, CloudFoundryInfo, Deployment } from "./DeploymentChain";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { ActionResult, successOn } from "@atomist/automation-client/action/ActionResult";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { identification } from "../../../../test/commands/editor/spring/pomParser";

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

function toJar(ai: AppInfo) {
    return `target/${ai.name}-${ai.version}.jar`;
}

export function deploy<P extends LocalProject>(p: P, cfi: CloudFoundryInfo): Promise<Deployment> {

    // const ai: AppInfo = {
    //     name: "pong-matcher-spring",
    //     version: "1.0.0",
    // };

    const appId: Promise<AppInfo> =
        p.findFile("pom.xml")
            .then(pom => pom.getContent()
                .then(content => identification(content)))
            .then(va => ({...va, name: va.artifact}));


    return appId.then(ai => {
        logger.info("Deploying app [%j] to Cloud Foundry [%j]", ai, cfi);
        return runCommand(`cf login -a ${cfi.api} -o ${cfi.org} -u ${cfi.username} -p "${cfi.password}" -s ${cfi.space}`,
            {cwd: p.baseDir})// [-o ORG] [-s SPACE]`)
            .then(_ => {
                console.log("Successfully logged into Cloud Foundry as [%s]", cfi.username);
                return _;
            })
            .then(() =>
                // TODO function to return name
                runCommand(`cf push ${ai.name} -p ${toJar(ai)} --random-route`,
                    {cwd: p.baseDir})
                    .catch(err => {
                        logger.warn("Failed to deploy to cloud foundry: %j", err);
                        return Promise.reject(err);
                    })
                    .then(r => ({
                        success: r.success,
                        log: r.stdout,
                        target: p,
                        url: toUrl(name),
                    }))
            )
    });
}

function toUrl(name: string) {
    return `http://${name}.cfapps.io/`;
}