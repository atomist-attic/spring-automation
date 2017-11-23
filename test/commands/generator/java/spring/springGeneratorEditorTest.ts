import "mocha";

import { ProjectEditor, toEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import {
    SpringBootGenerator,
    springBootProjectEditor,
} from "../../../../../src/commands/generator/java/spring/SpringBootGenerator";

describe("springGeneratorEditor", () => {

    const sgen = new SpringBootGenerator();
    const params = sgen.freshParametersInstance();
    params.startersCsv = "web,security,foobar,baz";
    params.rootPackage = "com.foo.bar";
    params.serviceClassName = "MyApp";
    const editor: ProjectEditor = toEditor(springBootProjectEditor(params));

    it("doesn't edit empty project", done => {
        const p = new InMemoryProject();
        editor(p, null, null)
            .then(r => {
                assert(r.edited === undefined);
                assert(r.target === p);
                done();
            }).catch(done);
    });

    it("reports editing Spring Boot project", done => {
        const p = InMemoryProject.of({path: "pom.xml", content: FromInitializr});
        editor(p, null, null)
            .then(r => {
                const content = r.target.findFileSync("pom.xml").getContentSync();
                console.log(content);
                assert(content.includes("foobar"));
                assert(content.includes("baz"));

                done();
            }).catch(done);
    });

});

const FromInitializr = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.example</groupId>
	<artifactId>demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-rest-seed</name>
	<description>Seed for Spring Boot REST services</description>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.8.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-actuator</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>


</project>
`;
