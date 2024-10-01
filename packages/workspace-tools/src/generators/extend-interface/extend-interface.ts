import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import { promisify } from 'util';

export interface ExtendInterfaceOptions {
    inputPath: string;
    outputPath: string;
    outputMemberName: string;
    memberPattern: string;
    targetPath: string;
    targetMemberName: string;
}

export default async function extendInterface({
    inputPath,
    outputPath,
    outputMemberName,
    memberPattern,
    targetPath,
    targetMemberName,
}: ExtendInterfaceOptions): Promise<string> {
    const filePaths = await promisify(glob)(inputPath);
    const importDeclarations = await Promise.all([
        createImportDeclaration(targetPath, outputPath, `^${targetMemberName}$`),
        ...filePaths.map((filePath) =>
            createImportDeclaration(filePath, outputPath, memberPattern),
        ),
    ]);
    const mergableMemberNames = importDeclarations
        .map((statement) => statement?.importClause?.namedBindings)
        .filter(exists)
        .filter(ts.isNamedImports)
        .flatMap((namedImports) =>
            namedImports.elements.map((element) => element.name.escapedText.toString()),
        );

    return ts
        .createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(
                [
                    ...importDeclarations,
                    createTypeAliasDeclaration(outputMemberName, mergableMemberNames),
                ].filter(exists),
            ),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext),
        );
}

function createTypeAliasDeclaration(
    aliasMemberName: string,
    mergableMemberNames: string[],
): ts.TypeAliasDeclaration {
    return ts.factory.createTypeAliasDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(aliasMemberName),
        undefined,
        ts.factory.createIntersectionTypeNode(
            mergableMemberNames.map((memberName) =>
                ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier(memberName),
                    undefined,
                ),
            ),
        ),
    );
}

async function createImportDeclaration(
    filePath: string,
    outputPath: string,
    memberPattern: string,
): Promise<ts.ImportDeclaration | undefined> {
    const root = await getSource(filePath);

    const memberNames = root.statements
        .filter(ts.isExportDeclaration)
        .flatMap((statement) => {
            if (
                !statement.exportClause ||
                !ts.isNamedExports(statement.exportClause) ||
                !statement.exportClause.elements
            ) {
                return [];
            }

            return statement.exportClause.elements.filter(ts.isExportSpecifier);
        })
        .map((element) => element.name.escapedText.toString())
        .filter((memberName) => memberName?.match(new RegExp(memberPattern)));

    if (memberNames.length === 0) {
        return;
    }

    return ts.factory.createImportDeclaration(
        undefined,
        undefined,
        ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports(
                memberNames.map((memberName) =>
                    ts.factory.createImportSpecifier(
                        false,
                        undefined,
                        ts.factory.createIdentifier(memberName),
                    ),
                ),
            ),
        ),
        ts.factory.createStringLiteral(getImportPath(filePath, outputPath), true),
    );
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(path.parse(filePath).name, source, ts.ScriptTarget.Latest);
}

function getImportPath(filePath: string, outputPath: string): string {
    const fileName = path.parse(filePath).name;
    const outputFolder = path.parse(outputPath).dir;
    const importFolder = path.parse(path.relative(outputFolder, filePath)).dir;

    return fileName === 'index' ? importFolder : path.join(importFolder, fileName);
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}
