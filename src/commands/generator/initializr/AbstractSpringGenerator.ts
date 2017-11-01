import { curry } from "@typed/curry";

import { SeedDrivenGenerator } from "@atomist/automation-client/operations/generate/SeedDrivenGenerator";
import { Parameter } from "@atomist/automation-client/decorators";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors, EditorChainable, ProjectOp } from "@atomist/automation-client/operations/edit/projectEditorOps";
import {
    doUpdatePom,
    inferStructureAndMovePackage,
    removeTravisBuildFiles
} from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { addSpringBootStarter } from "../../editor/spring/addStarterEditor";

/**
 * Superclass for all Spring generators
 */
export abstract class AbstractSpringGenerator extends SeedDrivenGenerator {

    @Parameter({
        displayName: "Maven Artifact ID",
        description: "Maven artifact identifier, i.e., the name of the jar without the version," +
        " it is often the same as the project name",
        pattern: /^([a-z][-a-z0-9_]*|\$\{projectName\})$/,
        validInput: "a valid Maven artifact ID, which starts with a lower-case letter and contains only " +
        " alphanumeric, -, and _ characters, or `${projectName}` to use the project name",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 51,
    })
    public artifactId: string = "${projectName}";

    @Parameter({
        displayName: "Maven Group ID",
        description: "Maven group identifier, often used to provide a namespace for your project," +
        " e.g., com.pany.team",
        pattern: /^.*$/,
        validInput: "a valid Maven group ID, which starts with a letter, -, or _ and contains only" +
        " alphanumeric, -, and _ characters and may having leading period separated identifiers starting" +
        " with letters or underscores and containing only alphanumeric and _ characters.",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 50,
    })
    public groupId: string;

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
    public version: string = "0.1.0-SNAPSHOT";

    @Parameter({
        displayName: "Root Package",
        description: "root package for your generated source, often this will be namespaced under the group ID",
        pattern: /^.*$/,
        validInput: "a valid Java package name, which consists of period-separated identifiers which" +
        " have only alphanumeric characters, $ and _ and do not start with a number",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 53,
    })
    public rootPackage: string;

    @Parameter({
        displayName: "Class Name",
        description: "name for the service class",
        pattern: /^.*$/,
        validInput: "a valid Java class name, which contains only alphanumeric characters, $ and _" +
        " and does not start with a number",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public serviceClassName: string = "RestService";

    // TODO should be an array parameter
    @Parameter({
        displayName: "starters",
        pattern: /.*/,
        required: true,
        //type: FreeChoices,
    })
    public startersCsv: string = "";

    get starters(): string[] {
        return this.startersCsv.split(",");
    }

    constructor() {
        super();
        this.sourceOwner = "atomist-seeds";
        this.sourceRepo = "spring-rest-seed";
    }

    public projectEditor(ctx: HandlerContext, params: this): AnyProjectEditor<this> {
        const starterEditors: ProjectOp[] =
            this.starters.map(starter =>
                addSpringBootStarter("spring-boot-starter-" + starter));
        logger.debug("Starters: [%s]. Editor count=%d", params.starters.join(), starterEditors.length);

        const editors: EditorChainable[] = [
            removeTravisBuildFiles,
            curry(doUpdatePom)(params),
            curry(inferStructureAndMovePackage)(params.rootPackage),
        ];
        return chainEditors(
            ...editors.concat(starterEditors)
        );
    }

}