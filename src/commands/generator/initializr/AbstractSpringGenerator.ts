import { HandlerContext, Parameter } from "@atomist/automation-client/Handlers";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors, EditorChainable, ProjectOp } from "@atomist/automation-client/operations/edit/projectEditorOps";
import {
    doUpdatePom, inferStructureAndMovePackage,
    removeTravisBuildFiles,
} from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { inferSpringStructureAndRename } from "@atomist/automation-client/operations/generate/java/SpringBootSeed";
import { SeedDrivenGenerator } from "@atomist/automation-client/operations/generate/SeedDrivenGenerator";
import { cleanReadMe, RemoveSeedFiles } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { curry } from "@typed/curry";
import { camelize } from "tslint/lib/utils";
import { addSpringBootStarter } from "../../editor/spring/addStarterEditor";

/**
 * Superclass for all Spring Boot generators. Defines editing behavior
 * and common parameters.
 */
export abstract class AbstractSpringGenerator extends SeedDrivenGenerator implements RepoId {

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
    public serviceClassName: string;

    get serviceClassNameToUse() {
        return (!!this.serviceClassName) ?
            toInitialCap(this.serviceClassName) :
            toInitialCap(camelize(this.artifactId));
    }

    // TODO should be an array parameter
    @Parameter({
        displayName: "starters",
        pattern: /.*/,
        required: true,
        // type: FreeChoices,
    })
    public startersCsv: string = "";

    get starters(): string[] {
        return this.startersCsv.split(",");
    }

    get owner() {
        return this.targetOwner;
    }

    get repo() {
        return this.targetRepo;
    }

    constructor() {
        super();
        this.visibility = "public";
        this.sourceOwner = "atomist-seeds";
        this.sourceRepo = "spring-rest-seed";
        // Stable version that has a controller
        this.sourceBranch = "b3d23de0b23745994f44f192866cc0bb3c4a2224";
    }

    public projectEditor(ctx: HandlerContext, params: this): AnyProjectEditor<this> {
        const starterEditors: ProjectOp[] =
            this.starters.map(starter =>
                addSpringBootStarter("spring-boot-starter-" + starter));
        logger.debug("Starters: [%s]. Editor count=%d", params.starters.join(), starterEditors.length);

        const editors: EditorChainable[] = [
            RemoveSeedFiles,
            curry(cleanReadMe)(this.description),
            removeTravisBuildFiles,
            curry(doUpdatePom)(params),
            curry(inferStructureAndMovePackage)(this.rootPackage),
            curry(inferSpringStructureAndRename)(this.serviceClassNameToUse),
        ];
        return chainEditors(
            ...editors.concat(starterEditors),
        );
    }

}

function toInitialCap(s: string) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}
