import { ProjectAsync } from "@atomist/automation-client/project/Project";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";

/**
 * Record change to POM. Project will subsequently need flushing
 *
 * @param {Project} project
 * @param {string} artifactId
 * @param {string} groupId
 * @param {string} version
 * @param {string} description
 * @return project promise, project will need to be flushed
 */
export function updatePom<P extends ProjectAsync>(
    project: P,
    artifactId: string,
    groupId: string,
    version: string,
    description: string,
): Promise<P> {

    return doWithFiles(project, "pom.xml", f => {
        f.recordReplace(/<artifactId>[\S\s]*?<\/artifactId>/, `<artifactId>${artifactId}</artifactId>`)
            .recordReplace(/<name>[\S\s]*?<\/name>/, `<name>${project.name}</name>`)
            .recordReplace(/<groupId>[\S\s]*?<\/groupId>/, `<groupId>${groupId}</groupId>`)
            .recordReplace(/<version>[\S\s]*?<\/version>/, `<version>${version}</version>`)
            .recordReplace(/<description>[\S\s]*?<\/description>/, `<description>${description}</description>`);
    });
}
