import { CommandHandler, MappedParameter } from "@atomist/automation-client/decorators";
import { UniversalSeed } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { Alt, Opt } from "@atomist/microgrammar/Ops";
import { RepSep } from "@atomist/microgrammar/Rep";

import { MappedParameters } from "@atomist/automation-client/Handlers";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithAtMostOneMatch, findMatches } from "@atomist/automation-client/project/util/parseUtils";

/**
 * Generator command to create a new node automation client repo
 */
@CommandHandler("Create a new automation repo", "new automation")
export class NewAutomation extends UniversalSeed {

    @MappedParameter(MappedParameters.SlackTeam)
    public team: string;

    constructor() {
        super();
        this.sourceOwner = "atomist";
        this.sourceRepo = "automation-client-samples-ts";
    }

    public manipulate(project: Project) {
        return this.editPackageJson(project)
            .then(editAtomistConfigTsToSetTeam(this.team));
    }

    protected editPackageJson(p: Project): Promise<Project> {
        return doWithAtMostOneMatch<{ name: string }, Project>(p, "package.json", packageJsonNameGrammar, m => {
            m.name = this.targetRepo;
        });
    }

}

function editAtomistConfigTsToSetTeam(...teamIds: string[]): (p: Project) => Promise<Project> {
    return p => doWithAtMostOneMatch<{ teams: any }, Project>(p,
        "src/atomist.config.ts", atomistConfigTeamNameGrammar, m => {
            console.log(`Setting team: ${JSON.stringify(teamIds)}`);
            m.teams = teamIds;
        });
}

/*
function editAtomistConfigTsToSetTeam(...teamIds: string[]): (p: Project) => Promise<Project> {
    return p => findMatches<{ teams: any }>(p, "src/atomist.config.ts", atomistConfigTeamNameGrammar)
        .then(m => {
            if (m.length > 0) {
                console.log(`Setting team: ${JSON.stringify(teamIds)}`);
                m[0].teams = teamIds;
            } else {
                // how to modify a config that does not have a teamId?
            }
            return p;
        });
}
*/

export function teamMatchToArray(m: any): string[] {
    if (!m.teams || m.teams === "null" || m.teams === "undefined") {
        return [];
    }
    if (m.teams.team) {
        return [m.teams.team];
    }
    return m.teams.teams.map(t => t.team);
}

// "name": "@atomist/automation-client-samples",
const packageJsonNameGrammar = Microgrammar.fromString<{ name: string }>(
    '"name": "${name}"', {
        name: /[^"]+/,
    });

const teamStringGrammar = Microgrammar.fromString<{ team: string }>(
    '"${team}"', { team: /T[0-9A-Z]+/ },
);

const teamArrayGrammar = Microgrammar.fromDefinitions<{ teams: string[] }>({
    _b1: "[",
    teams: new RepSep(teamStringGrammar, ","),
    _b2: "]",
});

// 'teamIds: "T1L0VDKJP"' or 'teamIds: ["T1L0VDKJP", "TEAM1", "TEAM2"]'
export const atomistConfigTeamNameGrammar = Microgrammar.fromDefinitions<{ teams: any }>({
    _teamKey: "teamIds:",
    teams: new Alt("null", "undefined", teamStringGrammar, teamArrayGrammar),
    _trailingComma: new Opt(","),
});
