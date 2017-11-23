import * as tmp from "tmp";

import * as fs from "fs-extra";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { generate, ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { NodeFsLocalProject } from "@atomist/automation-client/project/local/NodeFsLocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import { diagnosticDump } from "@atomist/automation-client/project/util/diagnosticUtils";
import { SpringRepoCreator } from "../../../../src/commands/generator/spring/SpringRepoCreator";

export class TestGenerator extends SpringRepoCreator {

    public created: LocalProject;

    public handle(ctx: HandlerContext, params: this) {
        const seed = this.startingPoint(ctx, this);
        return generate(seed.then(diagnosticDump("seed", "**/*.java")),
            ctx,
            {token: params.githubToken},
            params.projectEditor(ctx, params),
            this.localFilePersister,
            params)
            .then(r => {
                return {
                    code: 0,
                    redirect: "foo",
                }
            });
    }

    public localFilePersister: ProjectPersister = (p: Project) => {
        const dir = tmp.dirSync();
        fs.removeSync(dir.name + "/" + p.name);
        return diagnosticDump("before persistence")(p)
            .then(p1 => NodeFsLocalProject.copy(p1, dir.name)
                .then(lp => {
                    this.created = lp;
                    return successOn(lp);
                }));
    }

}
