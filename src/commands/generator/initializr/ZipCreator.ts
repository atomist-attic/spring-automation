import { CommandHandler } from "@atomist/automation-client/decorators";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { HandlerResult, RedirectResult } from "@atomist/automation-client/HandlerResult";
import { generate, ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { AbstractSpringGenerator } from "./AbstractSpringGenerator";
import { writeZip, ZipWritingResult } from "./writeZip";
import { Project } from "@atomist/automation-client/project/Project";

@CommandHandler("generate spring boot seed")
export class ZipCreator extends AbstractSpringGenerator {

    public targetOwner;

    // Override to kill decorator
    public targetRepo;

    // Use the server's token
    public githubToken = process.env.GITHUB_TOKEN;

    public handle(ctx: HandlerContext, params: this): Promise<HandlerResult> {
        return generate(this.startingPoint(ctx, this),
            ctx,
            {token: params.githubToken},
            params.projectEditor(ctx, params),
            ZipPersister,
            params)
            .then(r => {
                    const zr = r as ZipWritingResult;
                    return {
                        code: 0,
                        redirect: `/serveFile?path=${zr.path}&name=${params.serviceClassName}`,
                    } as RedirectResult;
                }
            );
    }
}

export const ZipPersister: ProjectPersister = (p: Project) => {
    const path = "/Users/rodjohnson/temp/thing2.zip";
    return writeZip(p, path);
};
