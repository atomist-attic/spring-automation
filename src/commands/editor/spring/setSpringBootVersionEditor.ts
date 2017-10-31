import { logger } from "@atomist/automation-client/internal/util/logger";
import { EditResult, ProjectEditor, successfulEdit } from "@atomist/automation-client/operations/edit/projectEditor";
import { doWithAtMostOneMatch } from "@atomist/automation-client/project/util/parseUtils";
import { assertContentIncludes } from "@atomist/automation-client/project/util/projectInvariants";
import { parentStanzaOfGrammar } from "../../../grammars/mavenGrammars";
import { SpringBootStarter } from "./springConstants";

/**
 * Set the Spring Boot version to
 * @param {string} desiredBootVersion
 * @return {ProjectEditor<EditResult>}
 */
export function setSpringBootVersionEditor(desiredBootVersion: string): ProjectEditor {
    let edited = false;
    return p => {
        return doWithAtMostOneMatch(p, "pom.xml",
            parentStanzaOfGrammar(SpringBootStarter), m => {
                if (m.version.value !== desiredBootVersion) {
                    logger.info(`Updating Spring Boot version from [%s] to [%s]`,
                        m.version.value, desiredBootVersion);
                    m.version.value = desiredBootVersion;
                    edited = true;
                }
            })
            .then(proj =>
                (edited) ?
                    assertContentIncludes(p, "pom.xml", desiredBootVersion) : proj,
        )
            .then(_ => successfulEdit(p, edited));
    };
}
