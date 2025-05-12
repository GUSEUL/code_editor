declare module '@monaco-editor/react' {
  import * as React from 'react';
  import { editor } from 'monaco-editor';

  export interface EditorProps {
    width?: string | number;
    height?: string | number;
    value?: string;
    defaultValue?: string;
    language?: string;
    theme?: string;
    className?: string;
    options?: editor.IStandaloneEditorConstructionOptions;
    onMount?: (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void;
    onChange?: (value: string | undefined, event: editor.IModelContentChangedEvent) => void;
    loading?: React.ReactNode;
    saveViewState?: boolean;
    path?: string;
    wrapperProps?: any;
  }

  const Editor: React.FC<EditorProps>;
  export default Editor;
} 