import { HandleCommand } from "@atomist/automation-client";
import { CommandHandler, Parameter, Parameters, Tags } from "@atomist/automation-client/decorators";
import { BaseEditorParameters } from "@atomist/automation-client/operations/edit/BaseEditorParameters";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { reviewerHandler } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { clean, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { ParentStanzaGrammar } from "../../../grammars/mavenGrammars";
import { SpringBootStarter, SpringBootTags } from "../../editor/spring/springConstants";

@Parameters()
export class SpringBootVersionReviewerParameters extends BaseEditorParameters {

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: false,
    })
    public desiredBootVersion: string = "1.5.6.RELEASE";

}

export const springBootVersionReviewerCommand: HandleCommand =
    reviewerHandler(() => springBootVersionReviewer,
        SpringBootVersionReviewerParameters,
        "SpringBootVersionReviewer",
        {
            description: "Reviewer that flags old versions of Spring Boot",
            tags: SpringBootTags,
            intent: "review spring boot version",
        },
    );

export const springBootVersionReviewer: ProjectReviewer<SpringBootVersionReviewerParameters> =
    (p, context, params) => {
        return findMatches(p, "pom.xml", ParentStanzaGrammar)
            .then(matches => {
                if (matches.length > 0 && matches[0].gav.artifact === SpringBootStarter) {
                    const version = matches[0].gav.version;
                    const outDated = version !== params.desiredBootVersion;
                    if (outDated) {
                        const comment = `Old version of Spring Boot: [${version}] - ` +
                            `should have been [${params.desiredBootVersion}]`;
                        return context.messageClient.respond(`\`${p.id.owner}:${p.id.repo}\`: ${comment}`)
                            .then(_ =>
                                Promise.resolve({
                                    repoId: p.id,
                                    comments: [
                                        {
                                            severity: "warn" as Severity,
                                            comment,
                                        },
                                    ],
                                    version,
                                    desiredVersion: params.desiredBootVersion,
                                }));
                    }
                }
                return Promise.resolve(clean(p.id));
            });
    };
