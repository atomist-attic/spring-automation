import { doWithAtMostOneMatch } from "@atomist/automation-client/project/util/parseUtils";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";

export function updatePackageJsonIdentification(appName: string,
                                                description: string,
                                                version: string,
                                                author: string) {
    return project => {
        return doWithAtMostOneMatch(project, "package.json", nameGrammar, m => {
            m.value = appName;
        })
            .then(() => doWithAtMostOneMatch(project, "package.json", versionGrammar, m => {
                m.value = version;
            }))
            .then(() => doWithAtMostOneMatch(project, "package.json", descriptionGrammar, m => {
                m.value = description;
            }))
            .then(() => doWithAtMostOneMatch(project, "package.json", authorGrammar, m => {
                m.value = author;
            }));
    };
}

const keyGrammar: (key: string) => Microgrammar<{ value: string }> =
    key => Microgrammar.fromString<{ value: string }>(`"${key}": "\${value}"`);

const nameGrammar = keyGrammar("name");

const descriptionGrammar = keyGrammar("description");

const authorGrammar = keyGrammar("author");

const versionGrammar = keyGrammar("version");
