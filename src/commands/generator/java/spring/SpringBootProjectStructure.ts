
import { logger } from "@atomist/automation-client/internal/util/logger";
import { JavaPackageDeclaration } from "@atomist/automation-client/operations/generate/java/JavaGrammars";
import { ProjectAsync } from "@atomist/automation-client/project/Project";
import { saveFromFilesAsync } from "@atomist/automation-client/project/util/projectUtils";
import { SPRING_BOOT_APP } from "./SpringGrammars";

import { File } from "@atomist/automation-client/project/File";

/**
 * Represents the structure of a Spring Boot project,
 * which can be inferred from its contents. Covers application class
 * and starters.
 */
export class SpringBootProjectStructure {

    /**
     * Infer the Spring project structure of the given project, if found
     * @param {ProjectAsync} p
     * @return {Promise<SpringBootProjectStructure>}
     */
    public static inferFromJavaSource(p: ProjectAsync): Promise<SpringBootProjectStructure> {
        return saveFromFilesAsync<File>(p, "src/main/**/*.java", f => {
            return f.getContent()
                .then(content => content.includes("@SpringBootApplication") ? f : undefined);
        })
            .then(appFiles => {
                if (appFiles.length === 0) {
                    return null;
                }
                if (appFiles.length > 1) {
                    return null;
                }
                const f = appFiles[0];
                const packageName = JavaPackageDeclaration.firstMatch(f.getContentSync());
                const appClass = SPRING_BOOT_APP.firstMatch(f.getContentSync());
                logger.debug(`Spring Boot inference: packageName '${packageName.name}', appClass '${appClass.name}'`);

                return (packageName && appClass) ?
                    new SpringBootProjectStructure(packageName.name, appClass.name, f) :
                    null;
            });
    }

    /**
     * The stem of the application class. Strip "Application" if present.
     */
    public applicationClassStem = this.applicationClass.replace(/Application$/, "");

    /**
     * @param applicationPackage The package with the Spring Boot application class in it.
     * @param applicationClass Name of the application class within the given package
     * @param appClassFile path to the file containing the @SpringBootApplication annotation
     */
    constructor(public applicationPackage: string, public applicationClass: string, public appClassFile: File) {
    }

}
