import "mocha";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { updatePom } from "../../../../src/commands/generator/java/updatePom";

describe("updatePom", () => {

    it("should not error on no POM", done => {
        const p = new InMemoryProject();
        p.addFileSync("src/main/java/Foo.java", "public class Foo {}");
        updatePom(p, "art", "group", "version", "desc").then(_ =>
            p.flush()
                .then(() => {
                    const found = p.findFileSync("src/main/java/Foo.java");
                    assert(found.getContentSync() === "public class Foo {}");
                    done();
                })).catch(done);
    });

    it("should edit POM", done => {
        const p = InMemoryProject.of({path: "pom.xml", content: SimplePom});
        p.addFileSync("src/main/java/Foo.java", "public class Foo {}");
        updatePom(p, "art", "group", "version", "desc")
            .then(_ => {
                const found = p.findFileSync("pom.xml");
                const newPom = found.getContentSync();
                assert(newPom.includes("<artifactId>art</artifactId>"));
                done();
            }).catch(done);
    });

});

export const SimplePom = `<?xml version="1.0" encoding="UTF-8"?>
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
