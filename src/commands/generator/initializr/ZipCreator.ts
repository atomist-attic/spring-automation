import {
    CommandHandler,
    HandlerContext,
    HandlerResult,
    RedirectResult,
} from "@atomist/automation-client/Handlers";
import {
    generate,
    ProjectPersister,
} from "@atomist/automation-client/operations/generate/generatorUtils";
import { Project } from "@atomist/automation-client/project/Project";
import { AbstractSpringGenerator } from "./AbstractSpringGenerator";
import {
    writeZip,
    ZipWritingResult,
} from "./writeZip";

@CommandHandler("generate spring boot seed")
export class ZipCreator extends AbstractSpringGenerator {

    public targetOwner;

    // Override to kill decorator
    public targetRepo;

    // Use the server's token
    public githubToken = process.env.GITHUB_TOKEN;

    public handle(ctx: HandlerContext, params: this): Promise<HandlerResult> {
        // TODO cd adding any here doesn't make any sense but makes the compiler happy
        return generate<any>(this.startingPoint(ctx, this),
            ctx,
            {token: params.githubToken},
            params.projectEditor(ctx, params),
            ZipPersister,
            params)
            .then(r => {
                    const zr = r as ZipWritingResult;
                    const encodedPath = encodeURIComponent(zr.path);
                    return {
                        code: 0,
                        redirect: `serveFile?path=${encodedPath}&name=${params.serviceClassName}`,
                    } as RedirectResult;
                },
            );
    }
}

export const ZipPersister: ProjectPersister = (p: Project) => {
    const path = "/Users/rodjohnson/temp/thing2.zip";
    return writeZip(p, path);
};
