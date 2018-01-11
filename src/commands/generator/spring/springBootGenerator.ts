import { HandleCommand } from "@atomist/automation-client";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { AnyProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { generatorHandler } from "@atomist/automation-client/operations/generate/generatorToCommand";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { cleanReadMe } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { doWithRetry } from "@atomist/automation-client/util/retry";
import { curry } from "@typed/curry";
import { addSpringBootStarter } from "../../editor/spring/addStarterEditor";
import { GitHubTagRouter } from "../../tag/gitHubTagRouter";
import { springBootTagger } from "../../tag/springTagger";
import {
    cleanTravisBuildFiles, doUpdatePom, inferStructureAndMovePackage,
    JavaGeneratorParameters,
} from "../java/JavaProjectParameters";
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
            afterAction: (p, params: JavaGeneratorParameters) =>
                springBootTagger(p)
                    .then(tags => {
                        console.log("Tagging with " + tags.tags.join());
                        const edp = new BaseEditorOrReviewerParameters({
                            credentials: { token: params.target.githubToken },
                        });
                        // TODO this is hacky but we need the different parameter format
                        // Anyway, we don't want this to be part of generation long term
                        return doWithRetry(() => GitHubTagRouter(tags, edp, undefined),
                            "Publish tags", {
                                randomize: true,
                                retries: 30,
                            });
                    }),
        });
}

// TODO detyping here is nasty
export function springBootProjectEditor(params: SpringBootGeneratorParameters): AnyProjectEditor<any> {
    const starterEditors: Array<AnyProjectEditor<any>> =
        params.starters.map(starter =>
            addSpringBootStarter("spring-boot-starter-" + starter));
    logger.debug("Starters: [%s]. Editor count=%d", params.starters.join(), starterEditors.length);

    const editors: Array<AnyProjectEditor<SpringBootGeneratorParameters>> = [
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
