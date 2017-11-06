import * as exp from "express";
import { GitCommandGitProject } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { build, deploy } from "../commands/generator/build/DefaultDeploymentChain";
import { CloudFoundryInfo, PivotalWebServices } from "../commands/generator/build/DeploymentChain";
import * as fs from "fs";

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
            new GitHubRepoRef(owner, repo)
        );

        function closeListener(code) {
            res.write(code === 0 ? "Success" : "Failure");
            res.end();
        }

        return clone.then(p => build(p, res))
            .then(ar => deploy(ar.target, CloudFoundryTarget, res))
            .then(deployment => {
                res.write(`Build of project completed OK\n`);
                res.write(`Deployment to ${CloudFoundryTarget.api} org '${CloudFoundryTarget.org}' in progress...\n`);
                deployment.childProcess.addListener("close", closeListener);
                deployment.childProcess.addListener("exit", closeListener);
                return res.pipe(deployment.childProcess.stdout);
            });
    });


    express.get("/stream", (req, res) => {
        res.writeHead(200, {"Content-Type": "text/event-stream"});
        const stream = fs.createReadStream("/Users/rodjohnson/.atomist-working/cloudfoundry-samples/pong_matcher_spring/pom.xml");
        return stream.pipe(res);
    });

}