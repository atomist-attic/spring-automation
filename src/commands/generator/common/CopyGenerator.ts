import { HandlerContext } from "@atomist/automation-client";
import { CommandHandler } from "@atomist/automation-client/decorators";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { ObjectStore } from "../../../web/ObjectStore";
import { AbstractRepoCreator } from "./AbstractRepoCreator";

/**
 * Creates a GitHub Repo and installs Atomist collaborator if necessary
 */
@CommandHandler("copy repo")
export class CopyGenerator extends AbstractRepoCreator {

    constructor(store: ObjectStore,
                collaborator?: string,
                collaboratorToken?: string) {
        super(store, collaborator, collaboratorToken);
    }

    public projectEditor(ctx: HandlerContext, params: this): AnyProjectEditor<this> {
        return p => Promise.resolve(p);
    }
}
