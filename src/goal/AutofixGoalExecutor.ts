
import { AbstractGoalExecutor } from "./AbstractGoalExecutor";
import { GoalRegistry } from "./GoalRegistry";
import { GoalEvaluation } from "./Goal";
import { HandlerContext } from "@atomist/automation-client";

/**
 * Automatically fix what can be fixed
 */
export class AutofixGoalExecutor extends AbstractGoalExecutor {

    constructor(goalRegistry: GoalRegistry) {
        super(goalRegistry);
    }

    protected onUnsatisfied(ge: GoalEvaluation<any>, ctx: HandlerContext): Promise<any> {
        const fix = !!ge.goal.fix ? ge.goal.fix(ge.target) : undefined;
        if (!!fix) {
            // TODO run the fix command - Is it local?
            throw new Error("How do I invoke a command automatically?");
        }
        return Promise.resolve();
    }
}