import { HandleCommand } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { commandHandlerFrom, OnCommand } from "@atomist/automation-client/onCommand";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { SmartParameters } from "@atomist/automation-client/SmartParameters";

import * as assert from "power-assert";
import { FallbackReposParameters } from "../commands/editor/FallbackReposParameters";
import { GoalExecutor } from "./GoalExecutor";
import { CommandDetails } from "@atomist/automation-client/operations/CommandDetails";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { defaultRepoLoader } from "@atomist/automation-client/operations/common/defaultRepoLoader";

/**
 * Parameters with fallback
 */
@Parameters()
export class GoalsParameters extends BaseEditorOrReviewerParameters implements SmartParameters {

    constructor() {
        super(new FallbackReposParameters());
    }

    public bindAndValidate() {
        const targets = this.targets as FallbackReposParameters;
        if (!targets.repo) {
            assert(!!targets.repos, "Must set repos or repo");
            targets.repo = targets.repos;
        }
    }

}

function defaultDetails(name: string): CommandDetails {
    return {
        description: name,
        //repoLoader: defaultRepoLoader()
    };
}

// TODO should take command details
function handler(goalExecutor: GoalExecutor, commandDetails: CommandDetails): OnCommand<GoalsParameters> {
    return (ctx, parameters) => {
        return commandDetails.repoLoader(parameters)(new GitHubRepoRef(parameters.targets.owner, parameters.targets.repo))
            .then(p =>
                goalExecutor.execute(p, ctx, {showSatisfied: true})
            );
    };
}

export function goalsCommand(goalExecutor: GoalExecutor): HandleCommand {
    return commandHandlerFrom(
        handler(goalExecutor, null),
        GoalsParameters,
        "SetGoals",
        "Set goals",
        ["achieve goals"],
        // No tags as we only want to run from the bot
        [],
    );
}
