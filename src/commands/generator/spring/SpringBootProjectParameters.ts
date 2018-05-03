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

import { logger, Parameter } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { Project } from "@atomist/automation-client/project/Project";
import { camelize } from "tslint/lib/utils";
import { JavaGeneratorParameters } from "../java/JavaProjectParameters";
import { renameClass } from "../java/javaProjectUtils";
import { SpringBootProjectStructure } from "./SpringBootProjectStructure";

/**
 * Spring Boot seed parameters.
 */
@Parameters()
export class SpringBootGeneratorParameters extends JavaGeneratorParameters {

    @Parameter({
        displayName: "Class Name",
        description: "name for the service class",
        pattern: /^.*$/,
        validInput: "a valid Java class name, which contains only alphanumeric characters, $ and _" +
        " and does not start with a number",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public serviceClassName: string;

    constructor() {
        super();
        this.source.owner = "atomist-seeds";
        this.source.repo = "spring-rest-seed";
    }

    public bindAndValidate() {
        super.bindAndValidate();
        this.serviceClassName = !!this.serviceClassName ?
            toInitialCap(this.serviceClassName) :
            toInitialCap(camelize(this.artifactId));
    }

}

export function inferSpringStructureAndRename(serviceClassName: string, p: Project): Promise<Project> {
    return SpringBootProjectStructure.inferFromJavaOrKotlinSource(p)
        .then(structure => {
            if (structure) {
                return renameClass(p, structure.applicationClassStem, serviceClassName);
            } else {
                logger.warn("Spring Boot project structure not found");
                return p;

            }
        });
}

function toInitialCap(s: string) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}
