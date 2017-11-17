import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { JavaSourceFiles } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { zapAllMatches } from "@atomist/automation-client/tree/ast/astUtils";

export const removeUnnecesaryComponentScanEditor: SimpleProjectEditor = p => {
    return zapAllMatches(p, JavaFileParser, JavaSourceFiles,
        `//typeDeclaration[/classDeclaration]
                            [//annotation[@value='@SpringBootApplication']]
                            //annotation[@value='@ComponentScan']`);
};
