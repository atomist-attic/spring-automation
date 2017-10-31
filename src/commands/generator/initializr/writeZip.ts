import * as JsZip from "jszip";

import { Project } from "@atomist/automation-client/project/Project";
import * as fs from "fs";
import { ActionResult } from "@atomist/automation-client/action/ActionResult";
import { toPromise } from "@atomist/automation-client/project/util/projectUtils";
import { logger } from "@atomist/automation-client/internal/util/logger";

export interface ZipWritingResult extends ActionResult<Project> {

    path: string;
}

/**
 * Write the given project to a file and return the path string
 * @param {Project} p
 * @param path path to write the zip to
 * @return {string}
 */
export function writeZip(p: Project, path: string): Promise<ZipWritingResult> {
    const zip = new JsZip();
    const addFiles: Promise<any> =
        toPromise(p.streamFiles())
            .then(files => Promise.all(
                files.map(f => f.getContent()
                    .then(content => {
                        // logger.debug("Adding file [%s]", f.path);
                        return zip.file(f.path, content);
                    })))
            );
    return addFiles.then(() => streamZip(p, path, zip));
}

function streamZip(p: Project, path: string, zip: JsZip): Promise<ZipWritingResult> {
    return new Promise((resolve, reject) => {
        zip.generateNodeStream({type: "nodebuffer", streamFiles: true})
            .pipe(fs.createWriteStream(path))
            .on("error", reject)
            .on("finish", () => {
                logger.info("Zip file written to [%s]", path);
                return resolve({
                    target: p,
                    path,
                    success: true,
                });
            });
    });
}
