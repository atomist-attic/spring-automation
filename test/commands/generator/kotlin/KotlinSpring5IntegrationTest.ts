/*
 * Copyright © 2017 Atomist, Inc.
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

import { HandleCommand } from "@atomist/automation-client";
import { CommandResult, runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import { SlackMessage } from "@atomist/slack-messages/SlackMessages";
import "mocha";
import * as assert from "power-assert";
import {
    kotlinSpring5Generator,
    KotlinSpring5Parameters,
} from "../../../../src/commands/generator/spring/kotlinSpring5Generator";
import { createdProject, localProjectPersister } from "../spring/localProjectPersister";
import { GishPath } from "./kotlinSpringBootStructureInferenceTest";

describe("Kotlin Spring5 generator integration test", () => {

    it.skip("edits, verifies and compiles", done => {
        generate()
            .then(verifyAndCompile)
            .then(cr => console.log(cr.stdout), e => {
                console.log(`mvn compile failed:${JSON.stringify(e, null, 2)}`);
                assert(false);
            })
            .then(done, done);
    }); // .timeout(200000);

    function generate(): Promise<LocalProject> {
        const kgen = new KotlinSpring5Parameters();
        kgen.artifactId = "my-custom";
        kgen.groupId = "atomist";
        kgen.rootPackage = "com.the.smiths";
        const ctx: any = {
            messageClient: {
                respond(msg: string | SlackMessage) {
                    return Promise.resolve();
                },
            },
        };
        const h = kotlinSpring5Generator(localProjectPersister) as HandleCommand<KotlinSpring5Parameters>;
        return (h as any).handle(ctx as HandlerContext, kgen)
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
        return runCommand("mvn --batch-mode compile", {
            cwd: p.baseDir,
            // Maven can generate reams of output...don't fall over on this
            maxBuffer: 1024 * 1000,
        });
    }

});
