
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { Project } from "@atomist/automation-client/project/Project";
import { writeZip } from "./writeZip";

/**
 * Persist to a randomly named zip file
 * @param {Project} p
 * @return {Promise<ZipWritingResult>}
 * @constructor
 */
export const ZipPersister: ProjectPersister = (p: Project) => {
    // TODO fix this
    const path = "/Users/rodjohnson/temp/thing2.zip";
    return writeZip(p, path);
};