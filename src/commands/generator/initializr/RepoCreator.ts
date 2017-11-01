import axios from "axios";

import { CommandHandler, MappedParameter, Secret } from "@atomist/automation-client/decorators";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { generate } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import { AbstractSpringGenerator } from "./AbstractSpringGenerator";
import { MappedParameters, Secrets } from "@atomist/automation-client/Handlers";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { ObjectStore } from "../../../web/ObjectStore";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

@CommandHandler("generate spring boot seed")
export class RepoCreator extends AbstractSpringGenerator implements RepoId {

    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken;

    @MappedParameter(MappedParameters.GitHubOwner)
    public targetOwner: string;

    get owner() {
        return this.targetOwner;
    }

    get repo() {
        return this.targetRepo;
    }

    constructor(private store: ObjectStore,
                private collaborator?: string) {
        super();
    }

    public handle(ctx: HandlerContext, params: this): Promise<HandlerResult> {
        return generate(this.startingPoint(ctx, this),
            ctx,
            {token: params.githubToken},
            params.projectEditor(ctx, params),
            GitHubProjectPersister,
            params)
            .then(r => {
                // Store the repo we created
                const ref = new GitHubRepoRef(params.owner, params.repo);
                params.store.put(ref);
                logger.info("Remembering we created repo %j", ref);
                return ref;
            })
            .then(ref => this.addAtomistCollaborator(params, ref))
            .then(r => ({
                code: 0,
                redirect: `https://github.com/${params.targetOwner}/${params.targetRepo}`,
            }));
    }

    private addAtomistCollaborator(params: this, ref: GitHubRepoRef): Promise<any> {
        if (!!params.collaborator) {
            const url = `${ref.apiBase}/repos/${ref.owner}/${ref.repo}/collaborators/${params.collaborator}`;
            logger.info("Attempting to install %s as a collaborator on %s:%s calling URL [%s]",
                params.collaborator, ref.owner, ref.repo, url);
            return axios.put(
                url,
                {permission: "push"},
                {headers: {Authorization: `token ${params.githubToken}`}})
                .catch(err => {
                    logger.warn("Unable to install %s as a collaborator on %s:%s - Failed with %s", params.collaborator, ref.owner, ref.repo, err)
                })
        } else {
            logger.warn("No collaborator configured on %s:%s - Not installing", ref.owner, ref.repo);
            return Promise.resolve(true);
        }
    }

}
