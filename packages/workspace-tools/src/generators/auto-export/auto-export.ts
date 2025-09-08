import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import { promisify } from 'util';

export interface AutoExportOptions {
    inputPath: string;
    outputPath: string;
    packageOutputPath: string;
    memberPattern: string;
    apiExtractorConfig: {
        entryPointSourceFile: string;
        mainDtsRollupPath: string;
    };
}

export interface AutoExportResult {
    packageExports: Map<string, string>;
    packageExportsGrouped: string;
    apiExtractorConfigs?: Map<string, string>;
}

export default async function autoExport(options: AutoExportOptions): Promise<AutoExportResult> {
    const { packageExports, apiExtractorConfigs } = await createPackageExports(options);
    const packageExportsGrouped = await createPackageExportsGrouped(options);

    return {
        packageExports,
        packageExportsGrouped,
        apiExtractorConfigs,
    };
}

async function createPackageExports({
    inputPath,
    packageOutputPath,
    memberPattern,
    apiExtractorConfig,
}: AutoExportOptions): Promise<{
    packageExports: Map<string, string>;
    apiExtractorConfigs?: Map<string, string>;
}> {
    const filePaths = await promisify(glob)(inputPath);
    const results = (
        await Promise.all(
            filePaths.map((filePath) =>
                createExportDeclaration(filePath, packageOutputPath, memberPattern),
            ),
        )
    ).filter(exists);
    const packageExports = new Map<string, string>();
    const packageGroups = new Map<string, ts.ExportDeclaration[]>();

    results.forEach((result) => {
        const packageName = result.packageName;

        if (!packageGroups.has(packageName)) {
            packageGroups.set(packageName, []);
        }

        const declarations = packageGroups.get(packageName);

        if (declarations) {
            declarations.push(result.exportDeclaration);
        }
    });

    Array.from(packageGroups.entries()).forEach(([packageName, declarations]) => {
        const packageContent = ts
            .createPrinter()
            .printList(
                ts.ListFormat.MultiLine,
                ts.factory.createNodeArray(declarations),
                ts.createSourceFile('', '', ts.ScriptTarget.ESNext),
            );

        packageExports.set(packageName, packageContent);
    });

    const apiExtractorConfigs = createApiExtractorConfigs(
        Array.from(packageGroups.keys()),
        apiExtractorConfig.entryPointSourceFile,
        apiExtractorConfig.mainDtsRollupPath,
    );

    return {
        packageExports,
        apiExtractorConfigs,
    };
}

async function createPackageExportsGrouped({
    inputPath,
    outputPath,
    memberPattern,
}: AutoExportOptions): Promise<string> {
    const filePaths = await promisify(glob)(inputPath);
    const results = (
        await Promise.all(
            filePaths.map((filePath) =>
                createExportDeclaration(filePath, outputPath, memberPattern),
            ),
        )
    ).filter(exists);

    return ts
        .createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(results.map((result) => result.exportDeclaration)),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext),
        );
}

async function createExportDeclaration(
    filePath: string,
    outputPath: string,
    memberPattern: string,
): Promise<
    | {
          exportDeclaration: ts.ExportDeclaration;
          packageName: string;
      }
    | undefined
> {
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

    const exportDeclaration = ts.factory.createExportDeclaration(
        undefined,
        undefined,
        false,
        ts.factory.createNamedExports(
            memberNames.map((memberName) =>
                ts.factory.createExportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier(memberName),
                ),
            ),
        ),
        ts.factory.createStringLiteral(getImportPath(filePath, outputPath), true),
    );

    const packageName = extractPackageName(filePath);

    return {
        exportDeclaration,
        packageName,
    };
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

function extractPackageName(filePath: string): string {
    const pathParts = filePath.split(path.sep);
    const packagesIndex = pathParts.findIndex((part) => part === 'packages');

    if (packagesIndex !== -1 && packagesIndex + 1 < pathParts.length) {
        return pathParts[packagesIndex + 1];
    }

    return path.basename(path.dirname(path.dirname(filePath)));
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}

function createApiExtractorConfigs(
    packageNames: string[],
    entryPointSourceFile: string,
    mainDtsRollupPath: string,
): Map<string, string> {
    const apiExtractorConfigs = new Map<string, string>();

    packageNames.forEach((packageName) => {
        const moduleName = packageName.replace(/-integration$/, '');
        const config = {
            compiler: {
                configType: 'tsconfig',
                rootFolder: '../../../..',
            },
            project: {
                entryPointSourceFile: entryPointSourceFile.replace('<moduleName>', moduleName),
            },
            validationRules: {
                missingReleaseTags: 'allow',
            },
            apiReviewFile: {
                enabled: false,
            },
            apiJsonFile: {
                enabled: false,
            },
            dtsRollup: {
                enabled: true,
                mainDtsRollupPath: mainDtsRollupPath.replace('<moduleName>', moduleName),
            },
        };

        apiExtractorConfigs.set(packageName, JSON.stringify(config, null, 4));
    });

    return apiExtractorConfigs;
}
