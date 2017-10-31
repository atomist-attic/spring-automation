import { Express } from "express";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { RepoCreator } from "../commands/generator/initializr/RepoCreator";
import { ZipCreator } from "../commands/generator/initializr/ZipCreator";
import * as fs from "fs";
import { ObjectStore } from "./ObjectStore";

const CreateZipPath = "command/zip-creator";

const CreateRepoCommandPath = "command/repo-creator";

export function addInitializrHandoffRoute(cache: ObjectStore, express: Express) {
    logger.debug("Adding express routes for Spring Initialzr");

    express.post("/requestRepoCreation", function (req, res) {
        logger.debug("POST for repo creation: BODY is [" + JSON.stringify(req.body) + "]");
        const id = cache.put(req.body);
        res.redirect("fillInRepo?id=" + id)
    });

    express.post("/requestZipCreation", function (req, res) {
        logger.debug("POST for zip creation: BODY is [" + JSON.stringify(req.body) + "]");
        res.redirect(zipGeneratorUri(req.body));
    });

    express.get("/serveFile", function(req, res) {
        const path = req.param("path");
        const name = req.param("name");

        const readStream = fs.createReadStream(path);
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-disposition': `attachment; filename=${name}.zip`
        });
        readStream.pipe(res);
    });

    // Render the form that captures additional information for repo creation
    express.get("/fillInRepo", function (req, res) {
        const id = req.param("id");
        logger.debug("GET: pointer is [" + id + "]");
        return res.render("fillInRepo.html", {
            id,
            ...cache.get(id)
        });
    });

    // Take parameters from our additional form and
    // do a GET redirect to the seed
    express.get("/createRepo", function (req, res) {
        const id = req.param("id");
        logger.debug("cache: pointer is [" + id + "]");

        // Populate the generator itself to ensure we get the right names,
        // then take out the data
        const initializrData = cache.get(id);
        const generator = new RepoCreator();
        generator.targetOwner = req.param("org");
        generator.targetRepo = req.param("repo");
        generator.starters = initializrData || [];
        generator.rootPackage = initializrData.packageName;
        generator.artifactId = initializrData.artifactId;
        generator.groupId = initializrData.groupId;
        generator.version = initializrData.version;
        generator.serviceClassName = initializrData.name;
        const uri = toCommandHandlerGetUrl(CreateRepoCommandPath, generator) +
            "&mp_targetOwner=johnsonr&" +
            encodeURIComponent("s_github://user_token?scopes=repo,user") + "=" + process.env.GITHUB_TOKEN;
        return res.redirect(uri);
    });
}

function zipGeneratorUri(initializrData: any): string {
    const generator = new ZipCreator();
    generator.starters = initializrData || [];
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
                let val = generator[p];
                if (val.isArray) {
                    val = "[" + val.join() + "]";
                }
                return `${p}=${val}`;
            }
        );

    const uri = base + "?" + params.join("&");
    console.log(`URI with base=[${uri}]`);

    return uri;
}
