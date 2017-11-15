import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { doWithAtMostOneMatch } from "@atomist/automation-client/project/util/parseUtils";

export function updatePackageJsonIdentification(appName: string,
                                                description: string,
                                                version: string): SimpleProjectEditor {
    return project => {
        return doWithAtMostOneMatch(project, "package.json", nameGrammar, m => {
            m.value = appName;
        })
            .then(() => doWithAtMostOneMatch(project, "package.json", versionGrammar, m => {
                m.value = version;
            }))
            .then(() => doWithAtMostOneMatch(project, "package.json", descriptionGrammar, m => {
                m.value = description;
            }));
    };
}

const keyGrammar: (key: string) => Microgrammar<{ value: string }> =
    key => Microgrammar.fromString<{ value: string }>(`"${key}": "\${value}"`);

const nameGrammar = keyGrammar("name");

const descriptionGrammar = keyGrammar("description");

const versionGrammar = keyGrammar("version");
