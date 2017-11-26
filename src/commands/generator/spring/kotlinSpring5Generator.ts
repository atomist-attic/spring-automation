import { HandleCommand } from "@atomist/automation-client";
import { HandlerContext } from "@atomist/automation-client/Handlers";
import { generatorHandler } from "@atomist/automation-client/operations/generate/generatorToCommand";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";
import { camelize } from "tslint/lib/utils";
import { movePackage } from "../java/javaProjectUtils";
import { updatePom } from "../java/updatePom";
import { AllKotlinFiles, inferFromKotlinSource } from "../kotlin/kotlinUtils";
import { SpringBootGeneratorParameters } from "./SpringBootProjectParameters";
import { SpringBootProjectStructure } from "./SpringBootProjectStructure";

const DefaultSourceOwner = "johnsonr";
const DefaultSourceRepo = "flux-flix-service";

export class KotlinSpring5Parameters extends SpringBootGeneratorParameters {

    constructor() {
        super();
        this.source.owner = DefaultSourceOwner;
        this.source.repo = DefaultSourceRepo;
    }
}

export function kotlinSpring5Generator(projectPersister: ProjectPersister = GitHubProjectPersister): HandleCommand<KotlinSpring5Parameters> {
    return generatorHandler(
        () => kotlinSeedTransformation,
        SpringBootGeneratorParameters,
        "kotlinSpring5",
        {
            description: "Generate a Spring 5.0 reactive web project using Kotlin",
            intent: "generate spring",
            tags: ["spring", "boot", "kotlin", "reactive"],
            projectPersister,
        });
}

export const kotlinSeedTransformation = (project: Project, ctx: HandlerContext, params: KotlinSpring5Parameters) => {
    const smartArtifactId = (params.artifactId === "${projectName}") ? project.name : params.artifactId;
    let appName = camelize(smartArtifactId);
    appName = appName.charAt(0).toUpperCase() + appName.substr(1);
    return updatePom(project, smartArtifactId, params.groupId, params.version, params.description)
        .then(inferFromKotlinSource)
        .then(structure =>
            !!structure ?
                renameAppClass(project, structure, appName)
                    .then(p =>
                        movePackage(p, structure.applicationPackage, params.rootPackage, AllKotlinFiles)) :
                project)
        .then(() => project);
};

function renameAppClass(project: Project,
                        structure: SpringBootProjectStructure,
                        appName: string): Promise<Project> {
    return doWithFiles(project, AllKotlinFiles, file =>
        file.replaceAll(structure.applicationClassStem, appName)
            .then(f => f.path.includes(structure.applicationClassStem) ?
                f.setPath(f.path.replace(structure.applicationClassStem, appName)) :
                f,
            ),
    );
}
