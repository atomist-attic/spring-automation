import {
    EventFired,
    EventHandler,
    HandleEvent,
    HandlerContext,
    HandlerResult,
    Secret,
    Secrets,
    Tags,
} from "@atomist/automation-client/Handlers";
import axios from "axios";

@EventHandler("Notify channel on new issue and add comment to issue", `subscription CommentOnIssue
{
  Issue {
    number
    title
    repo {
      owner
      name
      channels {
        name
      }
    }
  }
}`)
@Tags("issue", "comment")
export class CommentOnIssue implements HandleEvent<any> {

    @Secret(Secrets.OrgToken)
    public githubToken: string;

    public handle(e: EventFired<any>, ctx: HandlerContext): Promise<HandlerResult> {
        const issue = e.data.Issue[0];

        return ctx.messageClient.addressChannels(`Got a new issue \`${issue.number}# ${issue.title}\``,
            issue.repo.channels.map(c => c.name))
            .then(() => {
                // tslint:disable-next-line:max-line-length
                return axios.post(`https://api.github.com/repos/${issue.repo.owner}/${issue.repo.name}/issues/${issue.number}/comments`,
                    { body: "Hey, I saw your issue!" },
                    { headers: { Authorization: `token ${this.githubToken}` } });
            })
            .then(() => {
                return Promise.resolve({ code: 0 });
            });
    }
}
