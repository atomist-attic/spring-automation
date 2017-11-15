import { logger } from "@atomist/automation-client/internal/util/logger";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import * as exp from "express";

import { hasFile } from "@atomist/automation-client/util/gitHub";

export function projectPage(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for project page");

    express.get("/projects/github/:owner/:repo", ...handlers, (req, res) => {
        const owner = req.params.owner;
        const repo = req.params.repo;
        hasFile(req.user.accessToken, owner, repo, "pom.xml")
            .then(isMaven => {
                const pinfo: ProjectInfo = {
                    owner,
                    repo,
                    // action: "Old version of Spring Boot",
                };
                return res.render(
                    isMaven ? "spring/projectPage.html" : "node/projectPage.html",
                    pinfo);
            });
    });

}

export interface ProjectInfo extends RepoId {

    action?: string;

}
