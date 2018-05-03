/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from "power-assert";

import { HandleCommand, HandlerContext } from "@atomist/automation-client";
import { CommandResult, runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { Project } from "@atomist/automation-client/project/Project";

import { springBootGenerator } from "../../../../src/commands/generator/spring/springBootGenerator";
import { SpringBootGeneratorParameters } from "../../../../src/commands/generator/spring/SpringBootProjectParameters";
import { createdProject, localProjectPersister } from "./localProjectPersister";

import { GitHubRepoCreationParameters } from "@atomist/automation-client/operations/generate/GitHubRepoCreationParameters";
import axios from "axios";
import MockAdapter = require("axios-mock-adapter");

export const GishPath = "src/main/java/com/smashing/pumpkins/Gish.java";

describe("spring generator integration test", () => {

    it("edits, verifies and compiles", async () => {
        const mock = new MockAdapter(axios);
        mock.onPut(`https://api.github.com/repos/johnsonr/foo/topics`).replyOnce(200, {
            names: [
                "spring-boot",
                "spring",
                "java",
            ],
        });
        const generated = await generate();
        await verifyAndCompile(generated);
    }).timeout(200000);

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
        return runCommand("./mvnw compile", {
            cwd: p.baseDir,
            // Maven can generate reams of output...don't fall over on this
            maxBuffer: 1024 * 1000,
        });
    }

});

function fakeContext(): HandlerContext {
    return {
        messageClient: new ConsoleMessageClient(),
        graphClient: {
            query: async () => [],
        },
    } as any as HandlerContext;
}
