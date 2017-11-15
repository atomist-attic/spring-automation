import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { doWithFileMatches } from "@atomist/automation-client/project/util/parseUtils";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";

import { ProjectOp } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { RestOfLine } from "@atomist/microgrammar/matchers/skip/Skip";

export function updateReadme(appName: string,
                             description: string): ProjectOp {
    return project => {
        return doWithFileMatches(project, "README.md", h1Grammar, fm => {
            if (fm.matches.length > 0) {
                fm.matches[0].value = appName + "\n\n" + description;
            }
        });
    };
}

const headingGrammar: (start: string) => Microgrammar<{ value: string }> = start => Microgrammar.fromDefinitions({
    _start: start,
    value: RestOfLine,
});

const h1Grammar = headingGrammar("#");
