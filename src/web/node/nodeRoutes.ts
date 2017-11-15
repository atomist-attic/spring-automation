import { logger } from "@atomist/automation-client/internal/util/logger";

import axios from "axios";

import * as exp from "express";
import { NodeGenerator } from "../../commands/generator/node/NodeGenerator";
import { InMemoryStore } from "../InMemoryObjectStore";
import { toCommandHandlerGetUrl } from "../spring/initializerHandoff";

const CreateRepoCommandPath = "/command/node-generator";

export function addNodeRoutes(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for node");

    express.get("/node/create", ...handlers, (req, res) => {
        const defaults = new NodeGenerator(InMemoryStore);
        return res.render("node/fillInNodeProject.html", {
            orgs: req.user.orgs,
            message: req.flash("error"),
            sourceOwner: defaults.sourceOwner,
            sourceRepo: defaults.sourceRepo,
        });
    });

    express.get("/node/createRepo", ...handlers, (req, res) => {
        const owner = req.query.targetOwner;
        const repo = req.query.targetRepo;

        axios.get(`https://api.github.com/repos/${owner}/${repo}`,
            {headers: {Authorization: `token ${req.user.accessToken}`}})
            .then(() => {
                req.flash("error", `Repository ${owner}/${repo} already exists. Please use a different name!`);
                // TODO fix this
                return res.redirect(`/fillInRepo`);
            })
            .catch(err => {
                // Populate the generator itself to ensure we get the right names,
                // then take out the data
                const generator = new NodeGenerator(InMemoryStore);
                generator.targetOwner = req.query.targetOwner;
                generator.targetRepo = req.query.targetRepo;
                generator.appName = req.query.appName;
                generator.description = req.query.description || generator.appName;

                generator.visibility = !!req.query.public ? "public" : "private";
                generator.sourceOwner = req.query.sourceOwner;
                generator.sourceRepo = req.query.sourceRepo;
                generator.sourceBranch = req.query.sourceBranch || "master";
                const uri = toCommandHandlerGetUrl(CreateRepoCommandPath, generator) +
                    `&mp_targetOwner=${generator.targetOwner}&` +
                    encodeURIComponent("s_github://user_token?scopes=repo,user") + "=" + req.user.accessToken;
                return res.redirect(uri);
            });
    });
}
