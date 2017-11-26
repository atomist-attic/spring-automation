import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import "mocha";
import * as assert from "power-assert";
import { inferFromKotlinSource } from "../../../../src/commands/generator/kotlin/kotlinUtils";

describe("Spring Boot structure inference from Kotlin source", () => {

    it("infer not a spring project", done => {
        const p = InMemoryProject.of();
        inferFromKotlinSource(p).then(structure => {
            assert(!structure);
            done();
        }).catch(done);
    });

    it("should not be fooled by foo.kotlin.txt", done => {
        const p = InMemoryProject.of(
            {
                path: "src/main/kotlin/com/smashing/pumpkins/Gish.kt.txt",
                content: kotlinSource,
            },
        );
        inferFromKotlinSource(p).then(structure => {
            assert(!structure);
            done();
        }).catch(done);
    });

    it("infer application package and class when present", done => {
        inferFromKotlinSource(GishProject).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === GishPath);
            done();
        }).catch(done);
    });

});

const kotlinSource =
    `package com.smashing.pumpkins

@SpringBootApplication
class GishApplication {
}

`;

export const GishPath = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
export const GishProject: Project = InMemoryProject.of(
    {
        path: GishPath,
        content: kotlinSource,
    },
);
