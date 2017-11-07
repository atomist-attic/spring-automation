import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { GitCommandGitProject } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import * as exp from "express";
import * as fs from "fs";
import { build, deploy } from "../commands/generator/build/DefaultDeploymentChain";
import { CloudFoundryInfo, PivotalWebServices } from "../commands/generator/build/DeploymentChain";

const CloudFoundryTarget: CloudFoundryInfo = {
    ...PivotalWebServices,
    username: "rod@atomist.com",
    password: process.env.PIVOTAL_PASSWORD,
    space: "development",
    org: "springrod",
};

export function addDeployRoutes(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    express.get("/deploy/:owner/:repo/", ...handlers, (req, res) => {
        const owner = req.params.owner;
        const repo = req.params.repo;

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-control": "no-cache",
        });

        res.write(`Cloning GitHub project ${owner}/${repo}...\n`);
        const clone = GitCommandGitProject.cloned(
            {token: req.user.accessToken},
            new GitHubRepoRef(owner, repo),
        );

        return clone
            .then(p => {
                return new Promise<LocalProject>((resolve, reject) => {
                    const childProcess = build(p);
                    res.write("Running Maven build...\n");
                    childProcess.stdout.on("data", what => res.write(what));
                    childProcess.on("error", err => reject(err));
                    childProcess.on("exit", code => {
                        return code === 0 ? resolve(p) : reject("Build failure");
                    });
                });
            })
            .then(p => deploy(p, CloudFoundryTarget, res))
            .then(deployment => {
                res.write(`Build of project completed OK\n`);
                res.write(`Deployment to ${CloudFoundryTarget.api} org '${CloudFoundryTarget.org}' in progress...\n`);
                deployment.childProcess.addListener("close", () => res.end());
                //deployment.childProcess.addListener("exit", closeListener);
                deployment.childProcess.stdout.on("data", what => res.write(what));
            })
            .catch(err => {
                res.end(`${err}: Failure`);
            });
    });

}
