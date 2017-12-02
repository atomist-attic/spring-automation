import { HandleCommand } from "@atomist/automation-client";
import { Parameter, Parameters } from "@atomist/automation-client/decorators";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { reviewerHandler } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { clean, ProjectReview, ReviewResult } from "@atomist/automation-client/operations/review/ReviewResult";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import * as _ from "lodash";
import { dependencyOfGrammar } from "../../../grammars/mavenGrammars";
import { VersionedArtifact } from "../../../grammars/VersionedArtifact";
import { SpringBootTags } from "../../editor/spring/springConstants";
import { MappedRepoParameters } from "@atomist/automation-client/operations/common/params/MappedRepoParameters";

@Parameters()
export class VersionSpreadReviewerParameters extends MappedRepoParameters {

    @Parameter({
        displayName: "Maven Group ID",
        description: "Maven group identifier",
        pattern: /^.*$/,
        validInput: "a valid Maven group ID, which starts with a letter, -, or _ and contains only" +
        " alphanumeric, -, and _ characters and may having leading period separated identifiers starting" +
        " with letters or underscores and containing only alphanumeric and _ characters.",
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    public groupId: string;

    @Parameter({
        displayName: "Maven Artifact ID",
        description: "Maven artifact identifier we are looking for",
        pattern: /^[a-z][-a-z0-9_]*$/,
        validInput: "a valid Maven artifact ID, which starts with a lower-case letter and contains only " +
        " alphanumeric, -, and _ characters",
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    public artifactId: string;

}

export function versionSpreadReviewerCommand(repoFinder?: RepoFinder, repoLoader?: RepoLoader): HandleCommand {
    return reviewerHandler(() => versionSpreadProjectReviewer,
        VersionSpreadReviewerParameters,
        "SpringBootVersionReviewer",
        {
            description: "Reviewer that reports the range of versions of an artifact",
            tags: SpringBootTags,
            intent: "version spread",
            repoFinder,
            repoLoader: repoLoader ? () => repoLoader : undefined,
        },
    );
}

const versionSpreadProjectReviewer: ProjectReviewer<VersionSpreadReviewerParameters, VersionReportReview> =
    (p, ctx, params) => {
        return findMatches(p, "pom.xml",
            dependencyOfGrammar(params.groupId, params.artifactId))
            .then(matches => {
                if (matches.length > 0) {
                    const version = matches[0].gav.version;
                    return Promise.resolve({
                        repoId: p.id,
                        comments: [],
                        group: params.groupId,
                        artifact: params.artifactId,
                        version,
                    });
                }
                return Promise.resolve(clean(p.id) as VersionReportReview);
            });
    };

function enrich(reviewResult: ReviewResult<VersionReportReview>): LibraryCheckReviewResult {
    // Put in the aggregate version information
    const allVersions = reviewResult.projectReviews
        .map(r => r.version)
        .filter(v => !!v);
    const lrr = reviewResult as LibraryCheckReviewResult;
    lrr.versions = _.uniq(allVersions).sort();
    return lrr;
}

export interface LibraryCheckReviewResult extends ReviewResult<VersionReportReview> {

    /**
     * All the versions we found, without duplicates. Look at individual ProjectReviews for
     * the version in each project.
     */
    versions: string[];
}

export interface VersionReportReview extends ProjectReview, VersionedArtifact {

}
