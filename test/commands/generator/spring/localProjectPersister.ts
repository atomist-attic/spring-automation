import * as tmp from "tmp";

import * as fs from "fs-extra";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import { RepoRef } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { NodeFsLocalProject } from "@atomist/automation-client/project/local/NodeFsLocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import { diagnosticDump } from "@atomist/automation-client/project/util/diagnosticUtils";

export let createdProject: LocalProject;

export const localProjectPersister: ProjectPersister = (p: Project, creds?: any, targetId?: RepoRef) => {
    const dir = tmp.dirSync();
    fs.removeSync(dir.name + "/" + p.name);
    return diagnosticDump("before persistence")(p)
        .then(p1 => NodeFsLocalProject.copy(p1, dir.name)
            .then(lp => {
                if (targetId) {
                    lp.id = {
                        ...lp.id,
                        ...targetId,
                    };
                }
                createdProject = lp;
                return successOn(lp);
            }));
};
