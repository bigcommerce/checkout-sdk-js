import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import { promisify } from 'util';

export interface AutoExportOptions {
    inputPath: string;
    outputPath: string;
    memberPattern: string;
}

export default async function autoExport({
    inputPath,
    outputPath,
    memberPattern,
}: AutoExportOptions): Promise<string> {
    const filePaths = await promisify(glob)(inputPath);
    const exportDeclarations = await Promise.all(
        filePaths.map((filePath) => createExportDeclaration(filePath, outputPath, memberPattern)),
    );

    return ts
        .createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(exportDeclarations.filter(exists)),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext),
        );
}

async function createExportDeclaration(
    filePath: string,
    outputPath: string,
    memberPattern: string,
): Promise<ts.ExportDeclaration | undefined> {
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

    return ts.factory.createExportDeclaration(
        undefined,
        undefined,
        false,
        ts.factory.createNamedExports(
            memberNames.map((memberName) =>
                ts.factory.createExportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(memberName),
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
