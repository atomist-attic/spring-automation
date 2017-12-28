import { ExecutionOptions, GoalExecutor } from "./GoalExecutor";
import { GoalRegistry } from "./GoalRegistry";
import { Goal, GoalEvaluation } from "./Goal";
import { HandlerContext } from "@atomist/automation-client";

export abstract class AbstractGoalExecutor implements GoalExecutor {

    constructor(protected goalRegistry: GoalRegistry) {
    }

    public execute(o: any, ctx: HandlerContext, opts: ExecutionOptions): Promise<any> {
        const actOnGoals: Array<Promise<any>> = this.goalRegistry.goals
            .map(goal => {
                return goal.appliesTo(o)
                    .then(applicable => {
                        return applicable ?
                            goal.evaluate(o, ctx)
                                .then(ge => {
                                    return ge.satisfied ?
                                        opts.showSatisfied ? this.onSatisfied(ge, ctx) : false :
                                        this.onUnsatisfied(ge, ctx);
                                }) :
                            this.onInapplicable(o, goal, ctx);
                    });
            });
        return Promise.all(actOnGoals);
    }

    protected onInapplicable(o: any, g: Goal<any>, ctx: HandlerContext): Promise<any> {
        return Promise.resolve();
    }

    protected onSatisfied(ge: GoalEvaluation<any>, ctx: HandlerContext): Promise<any> {
        return Promise.resolve();
    };

    protected abstract onUnsatisfied(ge: GoalEvaluation<any>, ctx: HandlerContext): Promise<any>;

}
