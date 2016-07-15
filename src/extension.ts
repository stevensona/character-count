'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, workspace, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    let characterCounter = new CharacterCounter();
    let controller = new CharacterCounterController(characterCounter);
    context.subscriptions.push(controller);
    context.subscriptions.push(characterCounter);

}

// this method is called when your extension is deactivated
export function deactivate() {
}

export class CharacterCounter {
    private _statusBarItem: StatusBarItem;

    public getCharacterCount(doc: TextDocument): number {
        return doc.getText().length;
    }

    public updateCharacterCount(): void {
        if(!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left)
        }

        let editor = window.activeTextEditor;
        if(!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;
        if(doc.languageId === "markdown") {
            let characterCount = this.getCharacterCount(doc);
            this._statusBarItem.text = characterCount !== 1 ? `$(pencil) ${characterCount} Characters` : `$(pencil) 1 Character`;
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public dispose(): void {
        this._statusBarItem.dispose();
    }


}

export class CharacterCounterController {
    private _characterCounter: CharacterCounter;
    private _disposable: Disposable;

    constructor(characterCounter: CharacterCounter) {
        this._characterCounter = characterCounter;
        this._characterCounter.updateCharacterCount();

        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);
    }

    private _onEvent() {
        this._characterCounter.updateCharacterCount();
    }

    public dispose(): void {
        this._disposable.dispose();
    }
}