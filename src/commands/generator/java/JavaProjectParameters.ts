/*
 * Copyright © 2018 Atomist, Inc.
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

import { MappedParameter, MappedParameters, Parameter } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { BaseSeedDrivenGeneratorParameters } from "@atomist/automation-client/operations/generate/BaseSeedDrivenGeneratorParameters";
import { Project } from "@atomist/automation-client/project/Project";
import { SmartParameters } from "@atomist/automation-client/SmartParameters";
import { updateYamlDocument } from "@atomist/yaml-updater/Yaml";
import { JavaProjectStructure } from "./JavaProjectStructure";
import { movePackage } from "./javaProjectUtils";
import { updatePom } from "./updatePom";

/**
 * Represents a Maven or Gradle artifact.
 */
export interface VersionedArtifact {

    artifactId: string;
    groupId: string;
    version: string;
    description: string;
}

/**
 * Superclass for all Java seeds using Maven. Updates Maven pom
 * based on parameters.
 */
@Parameters()
export class JavaGeneratorParameters extends BaseSeedDrivenGeneratorParameters
    implements SmartParameters, VersionedArtifact {

    @Parameter({
        displayName: "Maven Artifact ID",
        description: "Maven artifact identifier, i.e., the name of the jar without the version." +
        " Defaults to the project name",
        pattern: /^([a-z][-a-z0-9_]*)$/,
        validInput: "a valid Maven artifact ID, which starts with a lower-case letter and contains only " +
        " alphanumeric, -, and _ characters. Defaults to project name",
        minLength: 1,
        maxLength: 50,
        required: false,
        order: 51,
    })
    public artifactId: string = "";

    @Parameter({
        displayName: "Maven Group ID",
        description: "Maven group identifier, often used to provide a namespace for your project," +
        " e.g., com.pany.team",
        pattern: /^.*$/,
        validInput: "a valid Maven group ID, which starts with a letter, -, or _ and contains only" +
        " alphanumeric, -, and _ characters and may having leading period separated identifiers starting" +
        " with letters or underscores and containing only alphanumeric and _ characters.",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 50,
    })
    public groupId: string;

    @Parameter({
        displayName: "Version",
        description: "initial version of the project, e.g., 1.2.3-SNAPSHOT",
        pattern: /^.*$/,
        validInput: "a valid semantic version, http://semver.org",
        minLength: 1,
        maxLength: 50,
        required: true,
        order: 52,
    })
    public version: string = "0.1.0-SNAPSHOT";

    @Parameter({
        displayName: "Root Package",
        description: "root package for your generated source, often this will be namespaced under the group ID",
        pattern: /^.*$/,
        validInput: "a valid Java package name, which consists of period-separated identifiers which" +
        " have only alphanumeric characters, $ and _ and do not start with a number",
        minLength: 1,
        maxLength: 150,
        required: true,
        order: 53,
    })
    public rootPackage: string;

    @MappedParameter(MappedParameters.SlackTeam)
    public slackTeam: string;

    get description() {
        return this.target.description;
    }

    public bindAndValidate() {
        if (!this.artifactId) {
            this.artifactId = this.target.repo;
        }
    }

}

/**
 * Remove Travis files and configuration from seed that are not
 * useful, valid, or appropriate for a generated project.
 *
 * @param project  Project to remove seed files from.
 */
export function cleanTravisBuildFiles(webhookUrl: string, project: Project): Promise<Project> {
    return project.deleteDirectory(".travis")
        .then(p => p.findFile(".travis.yml")
            .then(travisFile => {
                return travisFile.getContent()
                    .then(travisYaml => {
                        const updates = {
                            addons: undefined,
                            branches: undefined,
                            env: undefined,
                            install: undefined,
                            script: undefined,
                            notifications: {
                                webhooks: {
                                    urls: [webhookUrl],
                                },
                            },
                        };
                        const opts = { keepArrayIndent: true };
                        const cleanYaml = updateYamlDocument(updates, travisYaml, opts);
                        return travisFile.setContent(cleanYaml);
                    })
                    .then(() => p);
            }, err => p)
            .then(() => p),
    );
}

export function doUpdatePom(id: VersionedArtifact, p: Project): Promise<Project> {
    const smartArtifactId = (id.artifactId === "${projectName}") ? p.name : id.artifactId;
    return updatePom(p, smartArtifactId, id.groupId, id.version, id.description);
}

export function inferStructureAndMovePackage(rootPackage: string, p: Project): Promise<Project> {
    return JavaProjectStructure.infer(p)
        .then(structure =>
            (structure) ?
                movePackage(p, structure.applicationPackage, rootPackage) :
                p);
}
