import * as exp from "express";
import { GitCommandGitProject } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { build, deploy } from "../commands/generator/build/DefaultDeploymentChain";
import { CloudFoundryInfo, PivotalWebServices } from "../commands/generator/build/DeploymentChain";

const CloudFoundryTarget: CloudFoundryInfo = {
    ...PivotalWebServices,
    username: "rod@atomist.com",
    password: "sfatomist2016!X",
    space: "development",
    org: "springrod",
};

export function addDeployRoutes(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    express.get("/deploy/:owner/:repo", ...handlers, (req, res) => {

        const owner = req.params.owner;
        const repo = req.params.repo;

        const clone = GitCommandGitProject.cloned(
            {token: req.user.accessToken},
            new GitHubRepoRef(owner, repo)
        );

        return clone.then(build)
            .then(ar => deploy(ar.target, CloudFoundryTarget))
            .then(res.json);
    });
}