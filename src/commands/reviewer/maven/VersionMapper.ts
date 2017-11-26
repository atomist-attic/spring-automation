import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
    HandlerResult,
    Secret,
    Secrets,
    Tags,
} from "@atomist/automation-client/Handlers";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { LocalOrRemoteRepoOperation } from "@atomist/automation-client/operations/common/LocalOrRemoteRepoOperation";
import { doWithAllRepos } from "@atomist/automation-client/operations/common/repoUtils";
import { Project } from "@atomist/automation-client/project/Project";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import * as _ from "lodash";
import {
    ArtifactContainer,
    DependencyGrammar,
} from "../../../grammars/mavenGrammars";
import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { expandProperties } from "./utils";

@CommandHandler("Reviewer that reports the range of versions of all Maven dependencies", "version map")
@Tags("atomist", "maven", "library")
export class VersionMapper extends LocalOrRemoteRepoOperation implements HandleCommand {

    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken;

    constructor() {
        // Check with an API call if the repo has a POM,
        // to save unnecessary cloning
        super(r => this.local ? true : hasFile(this.githubToken, r.owner, r.repo, "pom.xml"));
    }

    public handle(context: HandlerContext): Promise<HandlerResult> {
        // Find what we're looking for in each project
        const findInProject = (p: Project) =>
            findMatches<ArtifactContainer>(p, "pom.xml",
                DependencyGrammar, { contentTransformer: expandProperties },
            );

        const arrayOfArrays: Promise<VersionedArtifact[][]> =
            doWithAllRepos(context, { token: this.githubToken }, findInProject,
                this, this.repoFinder(), this.repoFilter, this.repoLoader())
                .then(matches => matches.map(acs =>
                    acs.map(ac => ac.gav)));

        return arrayOfArrays
            .then(pp => pp.filter(t => !!t))
            .then(arr => {
                return {
                    code: 0,
                    map: consolidate(arr),
                };
            });
    }

}

export function consolidate(arrs: VersionedArtifact[][]): object {
    // Put in the aggregate version information
    const allArtifacts: VersionedArtifact[] = _.flatten(arrs);
    const distinctArtifacts = _.uniqBy(allArtifacts, a => a.group + ":" + a.artifact + ":" + a.version);
    const byGroup: _.Dictionary<any[]> = _.groupBy(distinctArtifacts,
        a => a.group);
    for (const group of Object.getOwnPropertyNames(byGroup)) {
        (byGroup[group] as any) = _.groupBy(byGroup[group], a => a.artifact);
        for (const artifact of Object.getOwnPropertyNames(byGroup[group])) {
            byGroup[group][artifact] = byGroup[group][artifact].map(gav => gav.version);
        }
    }
    return byGroup;
}
