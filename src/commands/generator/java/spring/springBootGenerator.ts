import { HandleCommand } from "@atomist/automation-client";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { generatorHandler } from "@atomist/automation-client/operations/generate/generatorToCommand";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import {
    doUpdatePom,
    inferStructureAndMovePackage,
    removeTravisBuildFiles,
} from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { inferSpringStructureAndRename } from "@atomist/automation-client/operations/generate/java/SpringBootSeed";
import { cleanReadMe, RemoveSeedFiles } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { curry } from "@typed/curry";
import { addSpringBootStarter } from "../../../editor/spring/addStarterEditor";
import { SpringBootProjectParameters } from "./SpringBootProjectParameters";

export function springBootGenerator(projectPersister: ProjectPersister = GitHubProjectPersister): HandleCommand<SpringBootProjectParameters> {
    return generatorHandler(
        springBootProjectEditor,
        SpringBootProjectParameters,
        "springBootGenerator",
        {
            tags: ["spring", "boot", "java"],
            projectPersister,
        });
}

export function springBootProjectEditor(params: SpringBootProjectParameters): AnyProjectEditor {
    const starterEditors: AnyProjectEditor[] =
        params.starters.map(starter =>
            addSpringBootStarter("spring-boot-starter-" + starter));
    logger.debug("Starters: [%s]. Editor count=%d", params.starters.join(), starterEditors.length);

    const editors: AnyProjectEditor[] = [
        RemoveSeedFiles,
        curry(cleanReadMe)(params.target.description),
        removeTravisBuildFiles,
        curry(doUpdatePom)(params),
        curry(inferStructureAndMovePackage)(params.rootPackage),
        curry(inferSpringStructureAndRename)(params.serviceClassNameToUse),
    ];
    return chainEditors(
        ...editors.concat(starterEditors),
    );
}
