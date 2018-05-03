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

import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { Opt } from "@atomist/microgrammar/Ops";
import { Rep } from "@atomist/microgrammar/Rep";
import { CLASS_NAME, DISCARDED_ANNOTATION } from "../java/JavaGrammars";

export const SPRING_BOOT_APP = Microgrammar.fromDefinitions<{ name: string }>({
    // TODO does this take parameters?
    _app: "@SpringBootApplication",
    _otherAnnotations: new Rep(DISCARDED_ANNOTATION),
    _visibility: new Opt("public"),
    _class: "class",
    name: CLASS_NAME,
});
