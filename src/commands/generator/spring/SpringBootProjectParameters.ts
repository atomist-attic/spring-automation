import { Parameter } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { Project } from "@atomist/automation-client/project/Project";
import { camelize } from "tslint/lib/utils";
import { JavaGeneratorParameters } from "../java/JavaProjectParameters";
import { renameClass } from "../java/javaProjectUtils";
import { SpringBootProjectStructure } from "./SpringBootProjectStructure";

/**
 * Spring Boot seed parameters.
 */
@Parameters()
export class SpringBootGeneratorParameters extends JavaGeneratorParameters {

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

    // TODO should be an array parameter
    @Parameter({
        displayName: "starters",
        pattern: /.*/,
        required: false,
        // type: FreeChoices,
    })
    public startersCsv: string = "";

    get starters(): string[] {
        return this.startersCsv.split(",");
    }

    constructor() {
        super();
        this.source.owner = "spring-team";

        // TODO should be this, need to change after demo
        // this.source.owner = "atomist-seeds";
        this.source.repo = "spring-rest-seed";
    }

    public bindAndValidate() {
        super.bindAndValidate();
        this.serviceClassName = !!this.serviceClassName ?
            toInitialCap(this.serviceClassName) :
            toInitialCap(camelize(this.artifactId));
    }

}

export function inferSpringStructureAndRename(serviceClassName: string, p: Project): Promise<Project> {
    return SpringBootProjectStructure.inferFromJavaSource(p)
        .then(structure => {
            if (structure) {
                return renameClass(p, structure.applicationClassStem, serviceClassName);
            } else {
                console.log("WARN: Spring Boot project structure not found");
                return p;

            }
        });
}

function toInitialCap(s: string) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}
