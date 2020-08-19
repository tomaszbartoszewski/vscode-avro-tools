import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Position, 
  Range
} from 'vscode-languageserver';

import {
  TextDocument
} from 'vscode-languageserver-textdocument';
import {tokenize, Token} from './parsing';
// import {  } from 'vscode';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. 
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true
      }
    }
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'languageServerExample'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  let settings = await getDocumentSettings(textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  let text = textDocument.getText();
  let tokens = tokenize(text);
  let pattern = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;

  let problems = 0;
  let diagnostics: Diagnostic[] = [];

  tokens.forEach(function(tokenInfo) {
    if (tokenInfo.token === Token.FreeText) {
      problems++;
      let diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(tokenInfo.position),
          end: textDocument.positionAt(tokenInfo.position + tokenInfo.length)
        },
        message: `Wrong`,
        source: 'ex'
      };
      diagnostics.push(diagnostic);
    }
  });

  // try {
  //   let content = JSON.parse(text);
  //   if (content.type === "null" && content.default !== null) {
  //     problems++;
  //     let diagnostic: Diagnostic = {
  //       severity: DiagnosticSeverity.Error,
  //       range: {
  //         start: textDocument.positionAt(0),
  //         end: textDocument.positionAt(text.length)
  //       },
  //       message: `Default for type null can only be null`,
  //       source: 'ex'
  //     };
  //     diagnostics.push(diagnostic);
  //   }

  // } catch(e) {
    
  // }

  // while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
  //   problems++;
  //   let diagnostic: Diagnostic = {
  //     severity: DiagnosticSeverity.Warning,
  //     range: {
  //       start: textDocument.positionAt(m.index),
  //       end: textDocument.positionAt(m.index + m[0].length)
  //     },
  //     message: `${m[0]} is all uppercase.`,
  //     source: 'ex'
  //   };
  //   if (hasDiagnosticRelatedInformationCapability) {
  //     diagnostic.relatedInformation = [
  //       {
  //         location: {
  //           uri: textDocument.uri,
  //           range: Object.assign({}, diagnostic.range)
  //         },
  //         message: 'Spelling matters'
  //       },
  //       {
  //         location: {
  //           uri: textDocument.uri,
  //           range: Object.assign({}, diagnostic.range)
  //         },
  //         message: 'Particularly for names'
  //       }
  //     ];
  //   }
  //   diagnostics.push(diagnostic);
  // }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  connection.console.log('We received an file change event');
});


connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    let _doc = documents.get(_textDocumentPosition.textDocument.uri)
    let text = _doc?.getText()
    let t = _doc?.getText(Range.create(Position.create(_textDocumentPosition.position.line, 0), _textDocumentPosition.position));

    return [
      {
        label: 'String',
        kind: CompletionItemKind.Class,
        insertText: "{\n    \"type\": \"string\"\n}",
        data: 1
      },
      {
        label: 'Copy doc',
        insertText: _doc?.getText()[0],
        kind: CompletionItemKind.Text,
        data: 2
      }
    ];
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.data === 1) {
      item.detail = 'String details';
      item.documentation = 'String documentation';
    } else if (item.data === 2) {
      item.detail = 'Copy doc';
      item.documentation = 'Copy doc documentation';
    }
    return item;
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
