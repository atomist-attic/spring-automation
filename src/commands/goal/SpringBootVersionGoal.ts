import { Goal, GoalEvaluation, SatisfiedGoal, UnsatisfiedGoal } from "../../goal/Goal";
import { isProject, Project } from "@atomist/automation-client/project/Project";
import { SpringBootStarter } from "../editor/spring/springConstants";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { ParentStanzaGrammar } from "../../grammars/mavenGrammars";
import { Fix } from "@atomist/automation-client/operations/review/ReviewResult";

export class SpringBootVersionGoal implements Goal<Project> {

    public name: string;

    constructor(public desiredBootVersion: string) {
        this.name = "SpringBootVersionGoal-" + desiredBootVersion;
    }

    public asTarget(o: any): Project | undefined {
        return isProject(o) ? o : undefined;
    }

    public appliesTo(p: Project): Promise<boolean> {
        return p.findFile("pom.xml")
            .then(f => f.getContent())
            .then(content => content.includes(SpringBootStarter));
    }

    public evaluate(p: Project): Promise<GoalEvaluation<Project>> {
        return findMatches(p, "pom.xml", ParentStanzaGrammar)
            .then(matches => {
                if (matches.length > 0 && matches[0].gav.artifact === SpringBootStarter) {
                    const version = matches[0].gav.version;
                    const outDated = version !== this.desiredBootVersion;
                    if (outDated) {
                        const message = `Old version of Spring Boot: [${version}] - ` +
                            `should have been [${this.desiredBootVersion}]`;
                        return new UnsatisfiedGoal(this, p, message);
                    }
                }
                return new SatisfiedGoal(this, p);
            });
    }

    public fix(p: Project): Fix {
        return {
            command: "SpringBootVersionUpgrade",
            params: {
                desiredBootVersion: this.desiredBootVersion,
                "targets.owner": p.id.owner,
                "targets.repo": p.id.repo,
            }
        };
    }

}
