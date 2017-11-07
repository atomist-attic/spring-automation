import { logger } from "@atomist/automation-client/internal/util/logger";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import * as exp from "express";

export function springBootProjectPage(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for Spring Boot project page");

    express.get("/projects/:owner/:repo", ...handlers, (req, res) => {

        // req.user.accessToken

        const owner = req.params.owner;
        const repo = req.params.repo;
        const pinfo: ProjectInfo = {
            owner,
            repo,
            // action: "Old version of Spring Boot",
        };
        return res.render("projectPage.html", pinfo);
    });

    express.get("/pcfDeploy/:owner/:repo", ...handlers, (req, res) => {

        // req.user.accessToken

        const owner = req.params.owner;
        const repo = req.params.repo;
        const pinfo: ProjectInfo = {
            owner,
            repo,
        };
        return res.render("pcfDeploy.html", pinfo);
    });

}

export interface ProjectInfo extends RepoId {

    action?: string;

}
