import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { DependencyFinder } from "./support/DependencyFinder";

import * as _ from "lodash";
import { indent } from "../support/indent";

/**
 * Add the given dependency to projects. It's not an error
 * if the projects don't have a POM.
 * @param {VersionedArtifact} va
 * @return {SimpleProjectEditor}
 */
export function addDependencyEditor(va: VersionedArtifact): SimpleProjectEditor {
    return async project => {
        const pom = await project.getFile("pom.xml");
        if (pom) {
            const df = new DependencyFinder();
            const content = await pom.getContent();
            df.consume(content);
            if (_.findIndex(df.dependencies, d => d.group === va.group && d.artifact === va.artifact) < 0) {
                const depVersion = (va.version) ? `\n    <version>${va.version}</version>` : "";
                const toInsert = indent(`
<dependency>
    <groupId>${va.group}</groupId>
    <artifactId>${va.artifact}</artifactId>${depVersion}
</dependency>
\n`, "   ", 2);
                const newContent = content.slice(0, df.offset) + toInsert + content.slice(df.offset);
                await pom.setContent(newContent);
            }
        }
        return project;
    };
}
