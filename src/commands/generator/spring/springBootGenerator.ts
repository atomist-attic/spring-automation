import { HandleCommand } from "@atomist/automation-client";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { generatorHandler } from "@atomist/automation-client/operations/generate/generatorToCommand";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { cleanReadMe } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { curry } from "@typed/curry";
import { addSpringBootStarter } from "../../editor/spring/addStarterEditor";
import { cleanTravisBuildFiles, doUpdatePom, inferStructureAndMovePackage } from "../java/JavaProjectParameters";
import { inferSpringStructureAndRename, SpringBootGeneratorParameters } from "./SpringBootProjectParameters";

export function springBootGenerator(projectPersister: ProjectPersister = GitHubProjectPersister): HandleCommand<SpringBootGeneratorParameters> {
    return generatorHandler<SpringBootGeneratorParameters>(
        springBootProjectEditor,
        SpringBootGeneratorParameters,
        "springBootGenerator",
        {
            intent: "generate spring",
            tags: ["spring", "boot", "java"],
            projectPersister,
        });
}

// TODO detyping here is nasty
export function springBootProjectEditor(params: SpringBootGeneratorParameters): AnyProjectEditor<any> {
    const starterEditors: AnyProjectEditor<any>[] =
        params.starters.map(starter =>
            addSpringBootStarter("spring-boot-starter-" + starter));
    logger.debug("Starters: [%s]. Editor count=%d", params.starters.join(), starterEditors.length);

    const editors: AnyProjectEditor<SpringBootGeneratorParameters>[] = [
        curry(cleanReadMe)(params.target.description),
        curry(cleanTravisBuildFiles)(slackTeamTravisWebhookUrl(params.slackTeam)),
        curry(doUpdatePom)(params),
        curry(inferStructureAndMovePackage)(params.rootPackage),
        curry(inferSpringStructureAndRename)(params.serviceClassName),
    ];
    return chainEditors(
        ...editors.concat(starterEditors),
    );
}

function slackTeamTravisWebhookUrl(teamId: string): string {
    return `https://webhook.atomist.com/atomist/travis/teams/${teamId}`;
}
