import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { Project } from "@atomist/automation-client/project/Project";
import { DevNullProgressLog, ProgressLog } from "../../generator/build/DeploymentChain";

/**
 * Add a Cloud Foundry manifest to the given Maven project
 * @param {VersionedArtifact} va
 */
export function addManifest<P extends Project>(va: VersionedArtifact,
                                               log: ProgressLog = DevNullProgressLog): (p:P) => Promise<P> {
    return p =>
        p.findFile("manifest.yml")
            .catch(() => {
                logger.info("Adding Cloud Foundry manifest to project %j", va);
                log.write(`Adding Cloud Foundry manifest to project ${JSON.stringify(va)}...\n`);
                return p.addFile("manifest.yml", manifest(va));
            })
            .then(f => {
                logger.info("No need to add manifest to project %j as it exists", va);
                log.write(`No need to add Cloud Foundry manifest to project ${JSON.stringify(va)} as it exists\n`);

                return p;
            });
}

export function manifest(va: VersionedArtifact,
                         buildPack: string = "java_buildpack"): string {
    return `---
applications:
  - name: ${va.artifact}
    buildpack: ${buildPack}
    path: ${toJar(va)}`;
}

export function toJar(ai: VersionedArtifact) {
    return `target/${ai.artifact}-${ai.version}.jar`;
}