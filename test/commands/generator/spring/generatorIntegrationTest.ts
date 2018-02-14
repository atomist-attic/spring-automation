import "mocha";
import * as assert from "power-assert";

import { HandleCommand, HandlerContext } from "@atomist/automation-client";
import { CommandResult, runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { Project } from "@atomist/automation-client/project/Project";

import { SmartParameters } from "@atomist/automation-client/SmartParameters";
import { springBootGenerator } from "../../../../src/commands/generator/spring/springBootGenerator";
import { SpringBootGeneratorParameters } from "../../../../src/commands/generator/spring/SpringBootProjectParameters";
import { createdProject, localProjectPersister } from "./localProjectPersister";

import { GitHubTargetsParams } from "@atomist/automation-client/operations/common/params/GitHubTargetsParams";
import { GitHubRepoCreationParameters } from "@atomist/automation-client/operations/generate/GitHubRepoCreationParameters";
import axios from "axios";
import MockAdapter = require("axios-mock-adapter");

export const GishPath = "src/main/java/com/smashing/pumpkins/Gish.java";

describe("spring generator integration test", () => {

    // TODO since Agent is added, this no longer compiles in a non-git directory
    // Figure out how to re enable this
    it.skip("edits, verifies and compiles", done => {
        const mock = new MockAdapter(axios);
        mock.onPut(`https://api.github.com/repos/johnsonr/foo/topics`).replyOnce(200, {
            names: [
                "spring-boot",
                "spring",
                "java",
            ],
        });

        generate()
            .then(verifyAndCompile)
            .then(() => done(), done);
    }); // .timeout(200000);

    function generate(): Promise<LocalProject> {
        const gem: HandleCommand<SpringBootGeneratorParameters> = springBootGenerator(localProjectPersister);
        const params: SpringBootGeneratorParameters = gem.freshParametersInstance();
        params.artifactId = "my-custom";
        params.groupId = "atomist";
        params.rootPackage = "com.the.smiths";
        params.target.owner = "johnsonr";
        params.target.repo = "foo";
        (params.target as GitHubRepoCreationParameters).githubToken = process.env.GITHUB_TOKEN;
        return Promise.resolve(params.bindAndValidate())
            .then(() => {
                return (gem as any).handle(fakeContext(), params)
                    .then(hr => {
                        assert(hr.code === 0);
                        return createdProject;
                    });
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
