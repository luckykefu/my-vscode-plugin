import * as vscode from 'vscode';
import matter from 'gray-matter';
import path from 'path';


// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "kefu" is now active!');

    let insertPdfPageBreakCommand = vscode.commands.registerCommand('insertPdfPageBreak', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'markdown') {
                const filePath = document.uri.fsPath;
                const fileContent = document.getText();
                const updatedContent = await processMarkdownContent(fileContent);
                await vscode.workspace.fs.writeFile(document.uri, Buffer.from(updatedContent, 'utf8'));
                vscode.window.showInformationMessage(`Markdown file processed: ${filePath}`);
            } else {
                vscode.window.showInformationMessage('No active Markdown editor found');
            }
        } else {
            vscode.window.showInformationMessage('No active editor found');
        }
    });

    let pdf2imgCommand = vscode.commands.registerCommand('pdf2img', async (uri: vscode.Uri) => {
        ///
    });


    context.subscriptions.push(insertPdfPageBreakCommand);
    context.subscriptions.push(pdf2imgCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function processMarkdownContent(content: string): Promise<string> {
    const parsedContent = matter(content);

    // 删除已有的分页标签
    const pageBreakRemovalRegExp = /<div\s*style\s*=\s*"\s*page-break-after\s*:\s*always\s*;\s*"><\/div>\s*/gi;
    parsedContent.content = parsedContent.content.replace(pageBreakRemovalRegExp, '');

    // 在每个 `---` 后添加分页标签
    const delimiter = '---';
    const pageBreakHTML = '<div style="page-break-after: always;"></div>';
    const pageBreakReplacementRegExp = new RegExp(`${delimiter}(?!\\n<div\\s*style\\s*=\\s*"page-break-after:\\s*always;\\s*"><\\/div>)`, 'gi');
    parsedContent.content = parsedContent.content.replace(pageBreakReplacementRegExp, `${delimiter}\n${pageBreakHTML}\n`);

    // 重新组合 front matter 和内容
    return matter.stringify(parsedContent.content, parsedContent.data);
}

