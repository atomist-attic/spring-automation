import { logger } from "@atomist/automation-client/internal/util/logger";
import axios from "axios";
import * as exp from "express";
import * as fs from "fs";
import { RepoCreator } from "../commands/generator/initializr/RepoCreator";
import { ZipCreator } from "../commands/generator/initializr/ZipCreator";
import { InMemoryStore } from "./InMemoryObjectStore";

const CreateZipPath = "command/zip-creator";

const CreateRepoCommandPath = "command/repo-creator";

export function addInitializrHandoffRoute(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    logger.debug("Adding express routes for Spring Initialzr");

    express.post("/requestRepoCreation", (req, res) => {
        logger.debug("POST for repo creation: BODY is [" + JSON.stringify(req.body) + "]");
        const id = InMemoryStore.put(req.body);
        res.redirect("fillInRepo/" + id);
    });

    express.post("/requestZipCreation", ...handlers, (req, res) => {
        logger.debug("POST for zip creation: BODY is [" + JSON.stringify(req.body) + "]");
        res.redirect(zipGeneratorUri(req.body));
    });

    express.get("/serveFile", ...handlers, (req, res) => {
        const path = req.params.path;
        const name = req.params.name;

        const readStream = fs.createReadStream(path);
        res.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-disposition": `attachment; filename=${name}.zip`,
        });
        readStream.pipe(res);
    });

    // Render the form that captures additional information for repo creation
    express.get("/fillInRepo/:id", ...handlers, (req, res) => {
        const id = req.params.id;
        logger.debug("GET: pointer is [" + id + "]");
        return res.render("fillInRepo.html", {
            id,
            ...InMemoryStore.get(id),
            orgs: req.user.orgs,
            message: req.flash("error"),
        });
    });

    // Take parameters from our additional form and
    // do a GET redirect to the seed
    express.get("/createRepo", ...handlers, (req, res) => {
        const id = req.query.id;
        logger.debug("cache: pointer is [" + id + "]");

        const owner = req.query.org;
        const repo = req.query.repo;

        axios.get(`https://api.github.com/repos/${owner}/${repo}`,
            { headers: { Authorization: `token ${req.user.accessToken}`}})
            .then(() => {
                req.flash("error", `Repository ${owner}/${repo} already exists. Please use a different name!`);
                return res.redirect(`/fillInRepo/${id}`);
            })
            .catch( err => {
                // Populate the generator itself to ensure we get the right names,
                // then take out the data
                const initializrData = InMemoryStore.get(id);
                const generator = new RepoCreator(null);
                generator.targetOwner = owner;
                generator.targetRepo = repo;
                generator.startersCsv = (initializrData.style || []).join();
                generator.rootPackage = initializrData.packageName;
                generator.artifactId = initializrData.artifactId;
                generator.groupId = initializrData.groupId;
                generator.version = initializrData.version;
                generator.serviceClassName = initializrData.name;
                generator.visibility = "public";
                const uri = toCommandHandlerGetUrl(CreateRepoCommandPath, generator) +
                    `&mp_targetOwner=${generator.targetOwner}&` +
                    encodeURIComponent("s_github://user_token?scopes=repo,user") + "=" + req.user.accessToken;
                return res.redirect(uri);

            });
    });
}

function zipGeneratorUri(initializrData: any): string {
    const generator = new ZipCreator();
    generator.startersCsv = (initializrData.style || []).join();
    generator.rootPackage = initializrData.packageName;
    generator.targetRepo = "doesnt-matter";
    generator.artifactId = initializrData.artifactId;
    generator.groupId = initializrData.groupId;
    generator.version = initializrData.version;
    generator.serviceClassName = initializrData.name;
    return toCommandHandlerGetUrl(CreateZipPath, generator);
}

function toCommandHandlerGetUrl(base: string, generator: object): string {
    const params = Object.getOwnPropertyNames(generator)
        .filter(p => typeof generator[p] !== "function")
        .map(p => {
                const val = generator[p];
                return `${p}=${val}`;
            },
        );

    const uri = base + "?" + params.join("&");
    console.log(`URI with base=[${uri}]`);

    return uri;
}
