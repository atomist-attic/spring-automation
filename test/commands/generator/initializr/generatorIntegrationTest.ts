import { CommandResult, runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import "mocha";
import * as assert from "power-assert";
import { TestGenerator } from "./TestGenerator";
import { toPromise } from "@atomist/automation-client/project/util/projectUtils";

export const GishPath = "src/main/java/com/smashing/pumpkins/Gish.java";

describe("initializr generator integration test", () => {

    it("edits, verifies and compiles", done => {
        generate()
            .then(verifyAndCompile)
            .then(cr => {
                    console.log(cr.stdout);
                    done();
                },
            ).catch(done);
    }).timeout(200000);

    function generate(): Promise<LocalProject> {
        const gem = new TestGenerator();
        gem.artifactId = "my-custom";
        gem.groupId = "atomist";
        gem.rootPackage = "com.the.smiths";
        gem.targetRepo = "foo";
        return gem.handle(null, gem)
            .then(hr => {
                assert(hr.code === 0);
                return gem.created;
            });
    }

    function verifyAndCompile(p: LocalProject): Promise<CommandResult> {
        return verify(p)
            .then(compile);
    }

    function verify<P extends Project>(p: P): Promise<P> {
        assert(!p.findFileSync(GishPath));
        const f = p.findFileSync("src/main/java/com/the/smiths/MyCustomApplication.java");
        return toPromise(p.streamFiles())
            .then(files => {
                files.forEach(f => console.log(f.path));
                assert(f);
                const content = f.getContentSync();
                assert(content.includes("class MyCustom"));
                return p;
            });
    }

    // Use Maven to compile the project
    function compile(p: LocalProject): Promise<CommandResult> {
        return runCommand("mvn compile", {
            cwd: p.baseDir,
            // Maven can generate reams of output...don't fall over on this
            maxBuffer: 1024 * 1000,
        });
    }

});
