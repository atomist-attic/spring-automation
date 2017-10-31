import * as _ from "lodash";

import { CommandHandler, Secret, Tags } from "@atomist/automation-client/decorators";
import { HandleCommand } from "@atomist/automation-client/HandleCommand";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { LocalOrRemoteRepoOperation } from "@atomist/automation-client/operations/common/LocalOrRemoteRepoOperation";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { editProjectUsingBranch } from "@atomist/automation-client/operations/support/editorUtils";
import { GitProject } from "@atomist/automation-client/project/git/GitProject";
import { findMatches, Match } from "@atomist/automation-client/project/util/parseUtils";
import { ArtifactContainer, parentStanzaOfGrammar } from "../../../grammars/mavenGrammars";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { SpringBootStarter } from "./springConstants";
import { Secrets } from "@atomist/automation-client/Handlers";

/**
 * Upgrade the version of Spring Boot projects to the latest version
 * found in the org
 */
@CommandHandler("Harmonize versions of Spring Boot across an org to the latest version",
    "modernize spring boot version")
@Tags("atomist", "spring")
export class SpringBootModernizer extends LocalOrRemoteRepoOperation implements HandleCommand {

    @Secret(Secrets.userToken(["repo", "user"]))
    protected githubToken;

    constructor() {
        // Check with an API call if the repo has a POM,
        // to save unnecessary cloning
        super(r => this.local ? true : hasFile(this.githubToken, r.owner, r.repo, "pom.xml"));
    }

    public handle(context: HandlerContext): Promise<HandlerResult> {
        // First, look for projects and work out version spread
        const versions: string[] = [];
        return this.repoFinder()(context)
            .then(repoIds => {
                const reposToEdit = repoIds.filter(this.repoFilter);
                logger.info("Repos to edit are " + reposToEdit.map(r => r.repo).join(","));
                const projectPromises =
                    reposToEdit.map(id =>
                        this.repoLoader()(id)
                            .then(project => {
                                return findMatches<ArtifactContainer>(project, "pom.xml",
                                    parentStanzaOfGrammar(SpringBootStarter))
                                    .then(matches => {
                                        if (matches.length === 1) {
                                            versions.push(matches[0].gav.version);
                                            console.log("Found version [%s]", matches[0].gav.version);
                                            return { id, project: project as GitProject, match: matches[0] };
                                        } else {
                                            return undefined;
                                        }
                                    });
                            })
                            .catch(err => {
                                logger.warn("Error loading repo %s:%s - continuing...", id.owner, id.repo);
                                return Promise.resolve(undefined);
                            }),
                    );
                return Promise.all(projectPromises)
                    .then(pp => pp.filter(t => !!t));
            })
            .then(springBootProjects =>
                springBootProjects.length > 0 ?
                    this.editAll(context, springBootProjects, versions) :
                    this.nothingToDo(context),
        );
    }

    /**
     * Perform the actual edit. Broken out so that we can test easily.
     * @param {HandlerContext} context
     * @param {ProjectMatch} p
     * @param {ProjectEditor<any>} editor
     * @return {Promise<any>}
     */
    protected doEdit(context: HandlerContext, p: ProjectMatch, editor: ProjectEditor<any>, desiredVersion: string) {
        return editProjectUsingBranch(context, p.project, editor,
            {
                branch: `atm-spring-boot-${desiredVersion}`,
                message: `Migrating ${p.id.repo} to Spring Boot ${desiredVersion} from ${p.match.gav.version}`,
            },
        )
            .catch(err => {
                logger.warn(`Failed to edit branch for %s:%s - %s`, p.id.owner, p.id.repo, err);
                return err;
            });
    }

    private editAll(context: HandlerContext, springBootProjects: ProjectMatch[], versions: string[]) {
        // TODO this is naive: What about milestones etc?
        const uniqueVersions = _.uniq(versions).sort();
        const desiredVersion = _.last(uniqueVersions);
        const editor = setSpringBootVersionEditor(desiredVersion);

        return context.messageClient.respond(
            `Spring Boot versions found in org: [${uniqueVersions.join(",")}]\n` +
            `Attempting to migrate all projects to ${desiredVersion}`)
            .then(r => {
                const edits = springBootProjects
                    .filter(p => p.match.gav.version !== desiredVersion)
                    .map(p => {
                        return context.messageClient.respond(
                            `Migrating ${p.id.repo} to Spring Boot ${desiredVersion} from ${p.match.gav.version}`)
                            .then(x =>
                                this.doEdit(context, p, editor, desiredVersion));
                    },
                );
                return Promise.all(edits)
                    .then(eds => {
                        return {
                            code: 0,
                            edited: edits.length,
                        };
                    });
            });
    }

    private nothingToDo(context: HandlerContext) {
        return context.messageClient
            .respond("Nothing to do: No Spring Boot projects found in organization")
            .then(r => {
                return {
                    code: 0,
                    edited: 0,
                };
            });
    }

}

export interface ProjectMatch {
    id: RepoId;
    project: GitProject;
    match: Match<ArtifactContainer>;
}
