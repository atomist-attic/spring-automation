import { runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { ChildProcess, spawn } from "child_process";
import { identification } from "../../../../test/commands/editor/spring/pomParser";
import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { addManifest, toJar } from "../../editor/pcf/addManifestEditor";
import { AppInfo, CloudFoundryInfo, Deployment, ProgressLog } from "./DeploymentChain";

export function build<P extends LocalProject>(p: P): ChildProcess {
    return spawn("mvn", [
        "package",
        "-DskipTests",
    ], {
        cwd: p.baseDir,
    });
}

export function deploy<P extends LocalProject>(p: P, cfi: CloudFoundryInfo, log: ProgressLog): Promise<Deployment> {
    log.write("Analyzing application...\n");
    const appId: Promise<AppInfo & VersionedArtifact> =
        p.findFile("pom.xml")
            .then(pom => pom.getContent()
                .then(content => identification(content)))
            .then(va => ({...va, name: va.artifact}));

    return appId.then(ai => {
        logger.info("Deploying app [%j] to Cloud Foundry [%j]", ai, cfi);
        log.write(`Logging into Cloud Foundry as ${cfi.username}...\n`);

        return addManifest<LocalProject>(ai, log)(p)
            .then(p => runCommand(`cf login -a ${cfi.api} -o ${cfi.org} -u ${cfi.username} -p "${cfi.password}" -s ${cfi.space}`,
                {cwd: p.baseDir})// [-o ORG] [-s SPACE]`)
                .then(_ => {
                    console.log("Successfully logged into Cloud Foundry as [%s]", cfi.username);
                    return _;
                })
                .then(() => {
                    const childProcess = spawn("cf",
                        [
                            "push",
                            ai.name,
                            "-p",
                            toJar(ai),
                            "--random-route",
                        ],
                        {
                            cwd: p.baseDir,
                        });
                    return {
                        childProcess,
                        url: toUrl(ai.name),
                    };
                }));
    });
}

function toUrl(name: string) {
    return `http://${name}.cfapps.io/`;
}
