import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import "mocha";
import * as assert from "power-assert";
import { movePackage } from "../../../../src/commands/generator/java/javaProjectUtils";
import { AllKotlinFiles, inferFromKotlinSource } from "../../../../src/commands/generator/kotlin/kotlinUtils";

describe("package move", () => {

    it("moves files", done => {
        const path = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
        const p = InMemoryProject.of(
            {
                path,
                content: kotlinSource,
            },
        );
        inferFromKotlinSource(p).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === path);
            movePackage(p, structure.applicationPackage, "com.the.smiths", AllKotlinFiles)
                .then(_ => {
                    assert(!p.findFileSync(path));
                    const newFile = p.findFileSync("src/main/kotlin/com/the/smiths/Gish.kt");
                    assert(!!newFile);
                    done();
                });
        }).catch(done);
    });

});

const kotlinSource =
    `package com.smashing.pumpkins

@SpringBootApplication
class GishApplication {
}

`;
