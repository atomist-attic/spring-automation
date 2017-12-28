import { HandlerContext } from "@atomist/automation-client";

export interface ExecutionOptions {

    showSatisfied: boolean;
}

export interface GoalExecutor {

    execute(o: any, ctx: HandlerContext, opts: ExecutionOptions): Promise<any>;

}
