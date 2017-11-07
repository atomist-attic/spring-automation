import { HandlerContext, HandlerResult, RedirectResult, } from "@atomist/automation-client/Handlers";
import { generate, } from "@atomist/automation-client/operations/generate/generatorUtils";
import { AbstractSpringGenerator } from "./AbstractSpringGenerator";
import { ZipWritingResult, } from "./writeZip";
import { ZipPersister } from "./zipPersister";

export class ZipCreator extends AbstractSpringGenerator {

    public targetOwner;

    // Override to kill decorator
    public targetRepo;

    // Use the server's token. We only need to read the source repo
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
                    // Return the zip path if we can.
                    // We may test it without the zip result
                    const zr = r as ZipWritingResult;
                    const encodedPath = encodeURIComponent(zr.path);
                    return {
                        code: 0,
                        redirect: `serveFile?path=${encodedPath}&name=${params.serviceClassNameToUse}`,
                    } as RedirectResult;
                },
            );
    }
}

