import * as exp from "express";
import { defaultSeeds, defaultTags } from "../../commands/generator/dispatch/defaultSeeds";

export function seedMetadataRoutes(express: exp.Express) {

    express.get("/metadata/tags.json", (req, res) => {
        return res.json(defaultTags);
    });
    express.get("/metadata/seeds.json", (req, res) => {
        return res.json(defaultSeeds);
    });

}
