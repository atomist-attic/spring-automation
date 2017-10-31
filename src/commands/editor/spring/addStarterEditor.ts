import { Project } from "@atomist/automation-client/project/Project";
import { AnyProjectEditor, SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";

// TODO this is naive as it doesn't allow for dependency management block
export function addSpringBootStarter(artifact: string, group: string = "org.springframework.boot"): SimpleProjectEditor {
    return (p: Project) => {
        return doWithFiles(p, "pom.xml", pom => {
            return pom.replace(/<dependencies>/, "<dependencies>\n" +
                indent(dependencyStanza(artifact, group), "   ", 3)
            );
        });
    }
}

function dependencyStanza(artifact: string, group: string = "org.springframework.boot") {
    return `<dependency>
    <groupId>${group}</groupId>
    <artifactId>${artifact}</artifactId>
</dependency>`;
}

function indent(what: string, indent: string, n: number): string {
    return what.split("\n")
        .map(line => {
            let pad = "";
            for (let i = 0; i < n; i++) {
                pad += indent;
            }
            return pad + line;
        })
        .join("\n");
}