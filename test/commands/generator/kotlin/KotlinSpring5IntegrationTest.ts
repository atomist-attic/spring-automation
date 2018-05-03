/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommandResult, runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import { SlackMessage } from "@atomist/slack-messages/SlackMessages";
import * as assert from "power-assert";
import {
    KotlinSpring5Parameters,
} from "../../../../src/commands/generator/spring/kotlinSpring5Generator";
import { springBootGenerator } from "../../../../src/commands/generator/spring/springBootGenerator";
import { createdProject, localProjectPersister } from "../spring/localProjectPersister";
import { GishPath } from "./kotlinSpringBootStructureInferenceTest";

describe("Kotlin Spring5 generator integration test", () => {

    it("edits, verifies and compiles", async () => {
        const generated = await generate();
        await verifyAndCompile(generated);
    }).timeout(200000);

    function generate(): Promise<LocalProject> {
        const kgen = new KotlinSpring5Parameters();
        kgen.artifactId = "my-custom";
        kgen.groupId = "atomist";
        kgen.rootPackage = "com.the.smiths";
        (kgen.target as any).githubToken = process.env.GITHUB_TOKEN;
        kgen.bindAndValidate();
        const ctx: HandlerContext = {
            messageClient: {
                respond(msg: string | SlackMessage) {
                    return Promise.resolve();
                },
            },
            graphClient: {
                query: async () => [],
            },
        } as any;
        const h = springBootGenerator(localProjectPersister);
        return (h as any).handle(ctx, kgen)
            .then(() => createdProject);
    }

    function verifyAndCompile(p: LocalProject): Promise<CommandResult> {
        verify(p);
        return compile(p);
    }

    function verify(p: Project): void {
        assert(!p.findFileSync(GishPath));
        const f = p.findFileSync("src/main/kotlin/com/the/smiths/MyCustomApplication.kt");
        assert(f);
        const content = f.getContentSync();
        assert(content.includes("class MyCustom"));
    }

    // Use Maven to compile the project
    function compile(p: LocalProject): Promise<CommandResult> {
        return runCommand("./mvnw --batch-mode compile", {
            cwd: p.baseDir,
            // Maven can generate reams of output...don't fall over on this
            maxBuffer: 1024 * 1000,
        });
    }

});
