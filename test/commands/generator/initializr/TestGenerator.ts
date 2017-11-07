import * as tmp from "tmp";

import * as fs from "fs-extra";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { generate, ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { succeed } from "@atomist/automation-client/operations/support/contextUtils";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { NodeFsLocalProject } from "@atomist/automation-client/project/local/NodeFsLocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import { diagnosticDump } from "@atomist/automation-client/project/util/diagnosticUtils";
import { AbstractSpringGenerator } from "../../../../src/commands/generator/initializr/AbstractSpringGenerator";

export class TestGenerator extends AbstractSpringGenerator {

    public created: LocalProject;

    // We need a real GitHub token to read the source repo
    public githubToken = process.env.GITHUB_TOKEN;

    public targetOwner;

    public handle(ctx: HandlerContext, params: this): Promise<HandlerResult> {
        const seed = this.startingPoint(ctx, this);
        return generate(seed.then(diagnosticDump("seed", "**/*.java")),
            ctx,
            {token: params.githubToken},
            params.projectEditor(ctx, params),
            this.localFilePersister,
            params)
            .then(succeed);
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
