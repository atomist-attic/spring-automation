import { logger } from "@atomist/automation-client/internal/util/logger";
import {
    EditResult,
    ProjectEditor,
    SimpleProjectEditor,
} from "@atomist/automation-client/operations/edit/projectEditor";
import { doWithMatches } from "@atomist/automation-client/project/util/parseUtils";
import { parentStanzaOfGrammar } from "../../../grammars/mavenGrammars";
import { SpringBootStarter } from "./springConstants";

/**
 * Set the Spring Boot version to
 * @param {string} desiredBootVersion
 * @return {ProjectEditor<EditResult>}
 */
export function setSpringBootVersionEditor(desiredBootVersion: string): SimpleProjectEditor {
    return p => {
        return doWithMatches(p, "**/pom.xml",
            parentStanzaOfGrammar(SpringBootStarter), m => {
                if (m.version.value !== desiredBootVersion) {
                    logger.info("Updating Spring Boot version from [%s] to [%s]",
                        m.version.value, desiredBootVersion);
                    m.version.value = desiredBootVersion;
                }
            });
    };
}
