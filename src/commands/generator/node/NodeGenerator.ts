import { CommandHandler } from "@atomist/automation-client/decorators";
import { ObjectStore } from "../../../web/ObjectStore";
import { AbstractRepoCreator } from "../common/AbstractRepoCreator";
import { HandlerContext, Parameter } from "@atomist/automation-client";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { updatePackageJsonIdentification } from "../../editor/node/updatePackageJsonIdentification";

/**
 * Creates a GitHub Repo and installs Atomist collaborator if necessary
 */
@CommandHandler("generate node seed")
export class NodeGenerator extends AbstractRepoCreator {

    @Parameter({
        displayName: "App name",
        description: "Application name",
        pattern: /^([a-z][-a-z0-9_]*)$/,
        validInput: "a valid Maven artifact ID, which starts with a lower-case letter and contains only " +
        " alphanumeric, -, and _ characters, or `${projectName}` to use the project name",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 51,
    })
    public appName: string;

    @Parameter({
        displayName: "Version",
        description: "initial version of the project, e.g., 1.2.3-SNAPSHOT",
        pattern: /^.*$/,
        validInput: "a valid semantic version, http://semver.org",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 52,
    })
    public version: string = "0.1.0";

    constructor(store: ObjectStore,
                collaborator?: string,
                collaboratorToken?: string) {
        super(store, collaborator, collaboratorToken);
        this.sourceOwner = "blove";
        this.sourceRepo = "typescript-express-starter";
    }

    public projectEditor(ctx: HandlerContext, params: this): AnyProjectEditor<this> {
        return updatePackageJsonIdentification(params.appName, params.version);
    }
}
