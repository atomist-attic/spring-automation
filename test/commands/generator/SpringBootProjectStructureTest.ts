import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import "mocha";
import * as assert from "power-assert";
import { SpringBootProjectStructure } from "../../../src/commands/generator/SpringBootProjectStructure";

describe("SpringBootProjectStructure: Java inference", () => {

    it("infer not a spring project", done => {
        const p = InMemoryProject.of();
        SpringBootProjectStructure.inferFromJavaSource(p).then(structure => {
            assert(!structure);
            done();
        }).catch(done);
    });

    it("should not be fooled by foo.kotlin.txt", done => {
        const p = InMemoryProject.of(
            {
                path: "src/main/kotlin/com/smashing/pumpkins/Gish.kt.txt",
                content: javaSource,
            },
        );
        SpringBootProjectStructure.inferFromJavaSource(p).then(structure => {
            assert(!structure);
            done();
        }).catch(done);
    });

    it("infer application package and class when present", done => {
        SpringBootProjectStructure.inferFromJavaSource(GishProject).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === GishPath);
            done();
        }).catch(done);
    });

});

const javaSource =
    `package com.smashing.pumpkins;

@SpringBootApplication
class GishApplication {
}

`;

const SimplePom = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>flux-flix-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>flux-flix-service</name>
    <description>Demo project for Spring Boot</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.0.BUILD-SNAPSHOT</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>`;

export const GishPath = "src/main/java/com/smashing/pumpkins/Gish.java";
export const GishProject: Project = InMemoryProject.of(
    {
        path: GishPath,
        content: javaSource,
    }, {
        path: "pom.xml",
        content: SimplePom,
    },
);
