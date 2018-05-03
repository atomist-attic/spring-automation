/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
    HandlerResult,
    Secret,
    Secrets,
    Tags,
} from "@atomist/automation-client/Handlers";
import { allReposInTeam } from "@atomist/automation-client/operations/common/allReposInTeamRepoFinder";
import { defaultRepoLoader } from "@atomist/automation-client/operations/common/defaultRepoLoader";
import { AllRepos, RepoFilter } from "@atomist/automation-client/operations/common/repoFilter";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { doWithAllRepos } from "@atomist/automation-client/operations/common/repoUtils";
import { Project } from "@atomist/automation-client/project/Project";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import * as _ from "lodash";
import { ArtifactContainer, DependencyGrammar } from "../../../grammars/mavenGrammars";
import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { expandProperties } from "./utils";

@CommandHandler("Reviewer that reports the range of versions of all Maven dependencies", "version map")
@Tags("atomist", "maven", "library")
export class VersionMapper implements HandleCommand {

    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken;

    protected repoFinder(): RepoFinder {
        return allReposInTeam();
    }

    protected repoFilter(): RepoFilter {
        return AllRepos;
    }

    protected repoLoader(): RepoLoader {
        return defaultRepoLoader({token: this.githubToken});
    }

    public handle(context: HandlerContext): Promise<HandlerResult> {
        // Find what we're looking for in each project
        const findInProject = (p: Project) =>
            findMatches<ArtifactContainer>(p, "pom.xml",
                DependencyGrammar, { contentTransformer: expandProperties },
            );

        const arrayOfArrays: Promise<VersionedArtifact[][]> =
            doWithAllRepos(context, { token: this.githubToken }, findInProject,
                this, this.repoFinder(), this.repoFilter(), this.repoLoader())
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
