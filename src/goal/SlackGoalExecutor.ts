import { GoalRegistry } from "./GoalRegistry";
import { GoalEvaluation } from "./Goal";
import { buttonForCommand } from "@atomist/automation-client/spi/message/MessageClient";
import { Attachment, SlackMessage } from "@atomist/slack-messages";
import { HandlerContext } from "@atomist/automation-client";
import { successOn } from "@atomist/automation-client/action/ActionResult";
import { AbstractGoalExecutor } from "./AbstractGoalExecutor";

export class SlackGoalExecutor extends AbstractGoalExecutor {

    constructor(goalRegistry: GoalRegistry) {
        super(goalRegistry);
    }

    protected onSatisfied(ge: GoalEvaluation<any>, ctx: HandlerContext): Promise<any> {
        return ctx.messageClient.respond(`${ge.goal.name} satisfied`);
    }

    protected onUnsatisfied(ge: GoalEvaluation<any>, ctx: HandlerContext): Promise<any> {
        const mesg: SlackMessage = {
            text: ge.goal.name,
            attachments: [goalToAttachment(ge)],
        };
        return ctx.messageClient.respond(mesg)
            .then(() => successOn(ge));
    }
}

function goalToAttachment(ge: GoalEvaluation<any>): Attachment {
    const fix = !!ge.goal.fix ? ge.goal.fix(ge.target) : undefined;
    return {
        color: "#ff0000",
        author_name: ge.goal.name,
        author_icon: "https://image.shutterstock.com/z/stock-vector-an-image-of-a-red-grunge-x-572409526.jpg",
        text: `${ge.message}`,
        mrkdwn_in: ["text"],
        fallback: "error",
        actions: !!fix ? [
            buttonForCommand({text: "Fix"}, fix.command, fix.params),
        ] : [],
    };
}
