import { Fix } from "@atomist/automation-client/operations/review/ReviewResult";
import { HandlerContext } from "@atomist/automation-client";

export interface Goal<T> {

    name: string;

    // TODO what about querying for it? Not always need to do it

    /**
     * Return the object as a goal if it is a potential target
     * @param o
     * @return {T}
     */
    asTarget(o: any): T | undefined;

    /**
     * What objects does this goal apply to?
     * @param {T} t
     * @return {Promise<boolean>}
     */
    appliesTo(t: T): Promise<boolean>;

    evaluate(t: T, ctx: HandlerContext): Promise<GoalEvaluation<T>>;

    fix?(t: T): Fix;

}

/**
 * Result of evaluating a goal
 */
export interface GoalEvaluation<T> {

    goal: Goal<T>,
    target: T;
    satisfied: boolean;
    message?: string;
}

export class SatisfiedGoal<T> implements GoalEvaluation<T> {

    public satisfied: true;

    constructor(public goal: Goal<T>, public target: T) {}
}

export class UnsatisfiedGoal<T> implements GoalEvaluation<T> {

    public satisfied: false;

    constructor(public goal: Goal<T>, public target: T, public message: string) {}
}
