import * as exp from "express";
import { defaultSeeds, defaultTags } from "../../commands/generator/dispatch/defaultSeeds";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { chooseGenerator } from "../../commands/generator/dispatch/generatorDispatch";

export function seedMetadataRoutes(express: exp.Express, ...handlers: exp.RequestHandler[]) {

    express.get("/metadata/tags.json", (req, res) => {
        return res.json(defaultTags);
    });

    express.get("/metadata/seeds.json", (req, res) => {
        return res.json(defaultSeeds);
    });


    express.get("/metadata/resolveGenerator/:owner/:repo", ...handlers, (req, res) => {
        const seedId = new GitHubRepoRef(req.params.owner, req.params.repo);
        const gcall = chooseGenerator(req.user.accessToken, seedId);
        return res.json(gcall);
    });

}
