import * as exp from "express";
import { defaultSeeds } from "../../commands/generator/dispatch/defaultSeeds";

export function seedMetadataRoutes(express: exp.Express) {
    express.get("/metadata/seeds.json", (req, res) => {
        return res.json(defaultSeeds);
    });

}
