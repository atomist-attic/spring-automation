import { logger } from "@atomist/automation-client/internal/util/logger";

import * as exp from "express";
import { InMemoryStore } from "../InMemoryObjectStore";

export function addNodeRoutes(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for node");

    express.get("/node/create", ...handlers, (req, res) => {
        return res.render("node/fillInNodeProject.html", {
            orgs: req.user.orgs,
            message: req.flash("error"),
        });
    });

    express.post("/node/requestRepoCreation", (req, res) => {
        logger.debug("POST for repo creation: BODY is [" + JSON.stringify(req.body) + "]");
        const id = InMemoryStore.put(req.body);
        res.redirect("fillInRepo/" + id);
    });

    /*
    express.get("/createRepo", ...handlers, (req, res) => {
        const id = req.query.id;
        logger.debug("cache: pointer is [" + id + "]");

        const owner = req.query.org;
        const repo = req.query.repo;

        axios.get(`https://api.github.com/repos/${owner}/${repo}`,
            {headers: {Authorization: `token ${req.user.accessToken}`}})
            .then(() => {
                req.flash("error", `Repository ${owner}/${repo} already exists. Please use a different name!`);
                return res.redirect(`/fillInRepo/${id}`);
            })
            .catch(err => {
                // Populate the generator itself to ensure we get the right names,
                // then take out the data
                const initializrData = InMemoryStore.get(id);
                const generator = new SpringRepoCreator(null);
                generator.targetOwner = owner;
                generator.targetRepo = repo;
                generator.startersCsv = (initializrData.style || []).join();
                generator.rootPackage = initializrData.packageName;
                generator.artifactId = initializrData.artifactId;
                generator.groupId = initializrData.groupId;
                generator.version = initializrData.version;
                generator.serviceClassName = initializrData.name;
                generator.visibility = "public";
                if (!!initializrData.sourceOwner && !!initializrData.sourceRepo) {
                    generator.sourceOwner = initializrData.sourceOwner;
                    generator.sourceRepo = initializrData.sourceRepo;
                    generator.sourceBranch = initializrData.sourceBranch || "master";
                }
                const uri = toCommandHandlerGetUrl(CreateRepoCommandPath, generator) +
                    `&mp_targetOwner=${generator.targetOwner}&` +
                    encodeURIComponent("s_github://user_token?scopes=repo,user") + "=" + req.user.accessToken;
                return res.redirect(uri);

            });
    });
    */
}
