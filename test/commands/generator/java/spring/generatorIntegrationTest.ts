import { HandlerContext } from "@atomist/automation-client";
import { CommandResult, runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import "mocha";
import * as assert from "power-assert";
import { TestGenerator } from "./TestGenerator";

export const GishPath = "src/main/java/com/smashing/pumpkins/Gish.java";

describe("spring generator integration test", () => {

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
        const params = gem.freshParametersInstance();
        params.artifactId = "my-custom";
        params.groupId = "atomist";
        params.rootPackage = "com.the.smiths";
        params.target.repo = "foo";
        return gem.handle(fakeContext(), params)
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
        assert(f);
        const content = f.getContentSync();
        assert(content.includes("class MyCustom"));
        return Promise.resolve(p);
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

function fakeContext(): HandlerContext {
    return {
        messageClient: new ConsoleMessageClient(),
    } as any as HandlerContext;
}
