import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { doWithAtMostOneMatch } from "@atomist/automation-client/project/util/parseUtils";

export function updatePackageJsonIdentification(appName: string, version: string): SimpleProjectEditor {
    return project => {
        return doWithAtMostOneMatch(project, "package.json", nameGrammar, m => {
            m.value = appName;
        })
            .then(() => doWithAtMostOneMatch(project, "package.json", versionGrammar, m => {
                m.value = version;
            }));
    };
}

const nameGrammar = Microgrammar.fromString<{ value: string }>('"name": "${value}"');

const versionGrammar = Microgrammar.fromString<{ value: string }>('"version": "${value}"');
