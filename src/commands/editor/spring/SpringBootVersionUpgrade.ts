import { CommandHandler, Parameter, Secret, Tags } from "@atomist/automation-client/decorators";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { EditMode, PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { EditorCommandSupport } from "@atomist/automation-client/operations/edit/EditorCommandSupport";
import { EditResult, ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Project } from "@atomist/automation-client/project/Project";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { Secrets } from "@atomist/automation-client/Handlers";

/**
 * Upgrade the version of Spring Boot projects to a desired version
 */
@CommandHandler("Upgrade versions of Spring Boot across an org", "upgrade spring boot version")
@Tags("atomist", "spring")
export class SpringBootVersionUpgrade extends EditorCommandSupport {

    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken;

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

    public projectEditor(): ProjectEditor<EditResult> {
        return setSpringBootVersionEditor(this.desiredBootVersion);
    }

    public editInfo(p: Project): EditMode {
        return new PullRequest(
            "spring-boot-" + this.desiredBootVersion,
            "Upgrade Spring Boot to " + this.desiredBootVersion);
    }
}
