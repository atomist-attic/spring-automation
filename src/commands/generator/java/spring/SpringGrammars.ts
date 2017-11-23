import { CLASS_NAME, DISCARDED_ANNOTATION } from "@atomist/automation-client/operations/generate/java/JavaGrammars";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { Opt } from "@atomist/microgrammar/Ops";
import { Rep } from "@atomist/microgrammar/Rep";

export const SPRING_BOOT_APP = Microgrammar.fromDefinitions<{ name: string }>({
    // TODO does this take parameters?
    _app: "@SpringBootApplication",
    _otherAnnotations: new Rep(DISCARDED_ANNOTATION),
    _visibility: new Opt("public"),
    _class: "class",
    name: CLASS_NAME,
});
