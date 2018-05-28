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

import { PatternMatch } from "@atomist/microgrammar/PatternMatch";
import { VersionedArtifact } from "../../../../grammars/VersionedArtifact";
import { XmlTag } from "../../support/xml/xmlGrammars";

export type ReleaseType = "major" | "minor" | "patch";

export function coordinates(va: VersionedArtifact): string {
    let coords = `${va.group}:${va.artifact}`;
    if (va.version) {
        coords += `:${va.version}`;
    }
    return coords;
}

/**
 * We need to store offsets here so we can edit
 */
export class VersionedArtifactMatch implements VersionedArtifact {

    public group = this.groupMatch.value;

    public artifact = this.artifactMatch.value;

    public version = this.versionMatch ? this.versionMatch.value : undefined;

    /**
     * Use these members to update content. Convert them to
     * updatable matches and set value property.
     * @param groupMatch
     * @param artifactMatch
     * @param versionMatch
     * @param dependencyStartOffset Optional offset of the start of the dependency element
     * @param dependencyEndOffset Optional offset of the end of the dependency element
     */
    constructor(
        public groupMatch: PatternMatch & XmlTag,
        public artifactMatch: PatternMatch & XmlTag,
        public versionMatch: PatternMatch & XmlTag,
        public dependencyStartOffset?: number,
        public dependencyEndOffset?: number,
    ) { }
}
