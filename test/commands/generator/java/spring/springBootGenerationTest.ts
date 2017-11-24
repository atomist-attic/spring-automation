
import { metadataFromInstance } from "@atomist/automation-client/internal/metadata/metadataReading";
import { CommandHandlerMetadata } from "@atomist/automation-client/metadata/automationMetadata";
import { EditResult, toEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Project } from "@atomist/automation-client/project/Project";
import "mocha";
import * as assert from "power-assert";
import {
    springBootGenerator,
    springBootProjectEditor,
} from "../../../../../src/commands/generator/java/spring/springBootGenerator";
import { GishPath, GishProject } from "./SpringBootProjectStructureTest";

const GroupId = "group";
const ArtId = "art";
const Version = "1.0.7";

describe("Spring Boot generation", () => {

    it("edits project and verifies package", done => {
        edit(GishProject).then(r => {
            assert(!r.target.findFileSync(GishPath));
            const f = r.target.findFileSync("src/main/java/com/the/smiths/MyCustom.java");
            assert(f);
            const content = f.getContentSync();
            assert(content.includes("class MyCustom"));
            done();
        }).catch(done);
    });

    it("edits project and verifies POM", done => {
        edit(GishProject).then(r => {
            assert(!r.target.findFileSync(GishPath));
            const f = r.target.findFileSync("pom.xml");
            assert(f);
            const content = f.getContentSync();
            assert(!content.includes("undefined"));
            done();
        }).catch(done);
    });

    function edit(project: Project): Promise<EditResult> {
        const sbs = springBootGenerator();
        const params = sbs.freshParametersInstance();
        params.serviceClassName = "MyCustom";
        params.groupId = GroupId;
        params.version = Version;
        params.artifactId = ArtId;
        params.rootPackage = "com.the.smiths";

        const md = metadataFromInstance(sbs) as CommandHandlerMetadata;
        assert(md.name === "springBootGenerator");
        assert(md.parameters.length > 5);

        const ctx = null;
        return toEditor(springBootProjectEditor(params))(project, ctx, null);
    }

});
