import { logger } from "@atomist/automation-client/internal/util/logger";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";

// TODO this is naive as it doesn't allow for dependency management block
export function addSpringBootStarter(artifact: string,
                                     group: string = "org.springframework.boot"): (p: Project) => Promise<Project> {
    return (p: Project) => {
        return doWithFiles(p, "pom.xml", pom => {
            return pom.getContent()
                .then(content => {
                    // Don't add if it's already there
                    if (content.includes(artifact)) {
                        logger.info("Starter [%s] already present. Nothing to do", artifact);
                        return pom;
                    } else {
                        logger.info("Adding starter [%s]", artifact);
                        return pom.replace(/<dependencies>/, "<dependencies>\n" +
                            indent(dependencyStanza(artifact, group), "   ", 3),
                        );
                    }
                });
        });
    };
}

function dependencyStanza(artifact: string, group: string = "org.springframework.boot") {
    return `<dependency>
    <groupId>${group}</groupId>
    <artifactId>${artifact}</artifactId>
</dependency>`;
}

function indent(what: string, indentToUse: string, n: number): string {
    return what.split("\n")
        .map(line => {
            let pad = "";
            for (let i = 0; i < n; i++) {
                pad += indentToUse;
            }
            return pad + line;
        })
        .join("\n");
}
