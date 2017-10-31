import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { NodeFsLocalProject } from "@atomist/automation-client/project/local/NodeFsLocalProject";
import * as tmp from "tmp";

import { LoggingConfig } from "@atomist/automation-client/internal/util/logger";

LoggingConfig.format = "cli";

export function tempProject(): LocalProject {
    const dir = tmp.dirSync();
    return new NodeFsLocalProject("temp", dir.name);
}
