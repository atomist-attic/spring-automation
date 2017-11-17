import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { JavaSourceFiles } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { findMatches, zapAllMatches } from "@atomist/automation-client/tree/ast/astUtils";

const UnnecessaryComponentScanAnnotations = `//typeDeclaration[/classDeclaration]
                            [//annotation[@value='@SpringBootApplication']]
                            //annotation[@value='@ComponentScan']`;

const Constructors = `//classBodyDeclaration[//constructorDeclaration]`;

export const removeUnnecessaryComponentScanEditor: SimpleProjectEditor = p => {
    // TODO needs whitespace arg
    return zapAllMatches(p, JavaFileParser, JavaSourceFiles, UnnecessaryComponentScanAnnotations);
};

export const removeAutowiredOnSoleConstructor: SimpleProjectEditor = p => {
    return findMatches(p, JavaFileParser, JavaSourceFiles, Constructors)
        .then(constructors => {
            if (constructors.length === 1 && constructors[0].$value.includes("@Autowired")) {
                constructors[0].$value = constructors[0].$value.replace(/@Autowired[\s]+/, "");
            }
            return p.flush();
        });
};
