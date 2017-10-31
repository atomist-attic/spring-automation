import * as _ from "lodash";

import { CommandHandler, Parameter, Tags } from "@atomist/automation-client/decorators";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { ReviewerCommandSupport } from "@atomist/automation-client/operations/review/ReviewerCommandSupport";
import { clean, ProjectReview, ReviewResult } from "@atomist/automation-client/operations/review/ReviewResult";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { dependencyOfGrammar } from "../../../grammars/mavenGrammars";
import { VersionedArtifact } from "../../../grammars/VersionedArtifact";

@CommandHandler("Reviewer that reports the range of versions of an artifact", "version spread")
@Tags("atomist", "maven", "library")
export class VersionSpreadReviewer extends ReviewerCommandSupport<LibraryCheckReviewResult, VersionReportReview> {

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

    constructor() {
        // Check with an API call if the repo has a POM,
        // to save unnecessary cloning
        super(r => this.local ? true : hasFile(this.githubToken, r.owner, r.repo, "pom.xml"));
    }

    public projectReviewer(): ProjectReviewer<this, VersionReportReview> {
        return (p, context) => {
            return findMatches(p, "pom.xml",
                dependencyOfGrammar(this.groupId, this.artifactId))
                .then(matches => {
                    console.log("%d  matches looking for %s:%s", matches.length, this.groupId, this.artifactId);
                    if (matches.length > 0) {
                        const version = matches[0].gav.version;
                        return Promise.resolve({
                            repoId: p.id,
                            comments: [],
                            group: this.groupId,
                            artifact: this.artifactId,
                            version,
                        });
                    }
                    return Promise.resolve(clean(p.id) as VersionReportReview);
                });
        };
    }

    protected enrich(reviewResult: ReviewResult<VersionReportReview>): LibraryCheckReviewResult {
        // Put in the aggregate version information
        const allVersions = reviewResult.projectReviews
            .map(r => r.version)
            .filter(v => !!v);
        const lrr = reviewResult as LibraryCheckReviewResult;
        lrr.versions = _.uniq(allVersions).sort();
        return lrr;
    }

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
