import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import { promisify } from 'util';

export interface CreateEnumOptions {
    inputPaths: string[];
    inputMemberPattern: string;
    outputPath: string;
    outputMemberName: string;
}

export default async function createEnum({
    inputPaths,
    inputMemberPattern,
    outputPath,
    outputMemberName,
}: CreateEnumOptions): Promise<string> {
    const filePaths = (
        await Promise.all(inputPaths.map((inputPath) => promisify(glob)(inputPath)))
    ).flatMap((members) => members);

    const enumMembers = (
        await Promise.all(filePaths.map((filePath) => getEnumMembers(filePath, inputMemberPattern)))
    ).flatMap((members) => members);

    return ts
        .createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(
                [
                    createEnumDeclaration(outputMemberName, deduplicateEnumMembers(enumMembers)),
                    createExportAssignment(outputMemberName),
                ].filter(exists),
            ),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext),
        );
}

async function getEnumMembers(filePath: string, memberPattern: string): Promise<ts.EnumMember[]> {
    const root = await getSource(filePath);

    const memberPaths = root.statements
        .filter(ts.isExportDeclaration)
        .filter((statement) => {
            if (
                !statement.exportClause ||
                !ts.isNamedExports(statement.exportClause) ||
                !statement.exportClause.elements
            ) {
                return false;
            }

            return statement.exportClause.elements
                .filter(ts.isExportSpecifier)
                .find((element) =>
                    element.name.escapedText.toString().match(new RegExp(memberPattern)),
                );
        })
        .map((statement) => statement.moduleSpecifier?.getText(root)?.replace(/'|"/g, ''))
        .filter(exists);

    const memberRootPaths = await Promise.all(
        memberPaths.map((memberPath) => toRootPath(memberPath, filePath)),
    );

    return (
        await Promise.all(
            memberRootPaths.map(async (rootPath) => {
                if (path.parse(rootPath).name === 'index') {
                    return Array.from((await getEnumMembers(rootPath, memberPattern)).values());
                }

                return (await getSource(rootPath)).statements
                    .filter(ts.isEnumDeclaration)
                    .filter((statement) =>
                        statement.name.escapedText.toString().match(new RegExp(memberPattern)),
                    )
                    .flatMap((statement) => statement.members);
            }),
        )
    ).flatMap((enumMembers) => enumMembers);
}

function deduplicateEnumMembers(enumMembers: ts.EnumMember[]): ts.EnumMember[] {
    const result = enumMembers.reduce(
        (map, enumMember) =>
            ts.isIdentifier(enumMember.name) ? map.set(enumMember.name.text, enumMember) : map,
        new Map(),
    );

    return Array.from(result.values());
}

function createEnumDeclaration(enumName: string, enumMembers: ts.EnumMember[]): ts.EnumDeclaration {
    return ts.factory.createEnumDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier(enumName),
        enumMembers,
    );
}

function createExportAssignment(enumName: string): ts.ExportAssignment {
    return ts.factory.createExportAssignment(
        undefined,
        undefined,
        undefined,
        ts.factory.createIdentifier(enumName),
    );
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(path.parse(filePath).name, source, ts.ScriptTarget.Latest);
}

async function toRootPath(filePath: string, referencePath: string): Promise<string> {
    const lstat = promisify(fs.lstat);
    const resolvedPath = path.join(path.parse(referencePath).dir, filePath);

    try {
        return (await lstat(resolvedPath)).isDirectory()
            ? path.join(resolvedPath, 'index.ts')
            : `${resolvedPath}.ts`;
    } catch (error) {
        return `${resolvedPath}.ts`;
    }
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}
