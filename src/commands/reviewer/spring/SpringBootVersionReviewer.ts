import { CommandHandler, Parameter, Tags } from "@atomist/automation-client/decorators";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { ProjectReviewer } from "@atomist/automation-client/operations/review/projectReviewer";
import { ReviewerCommandSupport } from "@atomist/automation-client/operations/review/ReviewerCommandSupport";
import { clean, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { ParentStanzaGrammar } from "../../../grammars/mavenGrammars";
import { SpringBootStarter } from "../../editor/spring/springConstants";

@CommandHandler("Reviewer that flags old versions of Spring Boot", "review spring boot version")
@Tags("atomist", "spring")
export class SpringBootVersionReviewer
    extends ReviewerCommandSupport {

    @Parameter({
        displayName: "Desired Spring Boot version",
        description: "The desired Spring Boot version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: false,
    })
    public desiredBootVersion: string = "1.5.6.RELEASE";

    constructor() {
        // Check with an API call if the repo has a POM,
        // to save unnecessary cloning
        super(r => this.local ? true : hasFile(this.githubToken, r.owner, r.repo, "pom.xml"));
    }

    public projectReviewer(): ProjectReviewer {
        const desiredVersion = this.desiredBootVersion;
        return (p, context) => {
            return findMatches(p, "pom.xml", ParentStanzaGrammar)
                .then(matches => {
                    if (matches.length > 0 && matches[0].gav.artifact === SpringBootStarter) {
                        const version = matches[0].gav.version;
                        const outDated = version !== this.desiredBootVersion;
                        if (outDated) {
                            const comment = `Old version of Spring Boot: [${version}] - ` +
                                `should have been [${this.desiredBootVersion}]`;
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
                                        desiredVersion,
                                    }),
                            );
                        }
                    }
                    return Promise.resolve(clean(p.id));
                });
        };
    }

}
