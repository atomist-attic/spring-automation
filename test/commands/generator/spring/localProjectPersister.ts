/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
