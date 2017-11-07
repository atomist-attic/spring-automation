
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { Project } from "@atomist/automation-client/project/Project";
import { writeZip } from "./writeZip";

import * as tmp from "tmp";

/**
 * Persist to a randomly named zip file
 * @param {Project} p
 * @return {Promise<ZipWritingResult>}
 * @constructor
 */
export const ZipPersister: ProjectPersister = (p: Project) => {
    // TODO shouldn't be synchronous
    // TODO what about concurrency?
    const path = tmp.fileSync({ keep: false});
    return writeZip(p, path.name);
};
