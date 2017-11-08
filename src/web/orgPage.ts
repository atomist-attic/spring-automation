import { logger } from "@atomist/automation-client/internal/util/logger";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import * as exp from "express";

export function orgPage(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for Spring Boot org page");

    express.get("/orgs/github/:owner", ...handlers, (req, res) => {

        // req.user.accessToken

        const owner = req.params.owner;
        const oinfo = {
            owner,
            // action: "Old version of Spring Boot",
        };
        return res.render("orgPage.html", oinfo);
    });

}
