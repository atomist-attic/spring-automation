import { HandleCommand } from "@atomist/automation-client";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { generatorHandler } from "@atomist/automation-client/operations/generate/generatorToCommand";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { cleanReadMe, RemoveSeedFiles } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { curry } from "@typed/curry";
import { addSpringBootStarter } from "../../../editor/spring/addStarterEditor";
import { doUpdatePom, inferStructureAndMovePackage, removeTravisBuildFiles } from "../JavaProjectParameters";
import { inferSpringStructureAndRename, SpringBootGeneratorParameters } from "./SpringBootProjectParameters";

export function springBootGenerator(projectPersister: ProjectPersister = GitHubProjectPersister): HandleCommand<SpringBootGeneratorParameters> {
    return generatorHandler(
        springBootProjectEditor,
        SpringBootGeneratorParameters,
        "springBootGenerator",
        {
            intent: "generate spring",
            tags: ["spring", "boot", "java"],
            projectPersister,
        });
}

export function springBootProjectEditor(params: SpringBootGeneratorParameters): AnyProjectEditor {
    // TODO why does this fail without a guard?
    const starterEditors: AnyProjectEditor[] = [];
    // const starterEditors: AnyProjectEditor[] =
    //     params.starters.map(starter =>
    //             addSpringBootStarter("spring-boot-starter-" + starter));
    // logger.debug("Starters: [%s]. Editor count=%d", params.starters.join(), starterEditors.length);

    const editors: AnyProjectEditor[] = [
        RemoveSeedFiles,
        curry(cleanReadMe)(params.target.description),
        removeTravisBuildFiles,
        curry(doUpdatePom)(params),
        curry(inferStructureAndMovePackage)(params.rootPackage),
        curry(inferSpringStructureAndRename)(params.serviceClassName),
    ];
    return chainEditors(
        ...editors.concat(starterEditors),
    );
}
