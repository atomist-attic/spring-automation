import { logger } from "@atomist/automation-client/internal/util/logger";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import axios from "axios";
import * as exp from "express";
import * as fs from "fs";
import { RepoCreator } from "../commands/generator/initializr/RepoCreator";
import { ZipCreator } from "../commands/generator/initializr/ZipCreator";
import { InMemoryStore } from "./InMemoryObjectStore";

export function springBootProjectPage(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for Spring Boot project page");

    express.get("/projects/:owner/:repo", ...handlers, (req, res) => {
        //const id = InMemoryStore.put(req.body);

        // req.user.accessToken

        const owner = req.params.owner;
        const repo = req.params.repo;
        const pinfo: ProjectInfo = {
            owner,
            repo,
            action: "Old version of Spring Boot",
        };
        return res.render("projectPage.html", pinfo);
    });

}

export interface ProjectInfo extends RepoId {

    action? : string;

}
