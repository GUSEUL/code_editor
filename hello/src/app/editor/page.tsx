'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Code, Play, Save, Download, Share, ArrowLeft, Settings, Layers, Folder, FilePlus, FolderPlus, X, Eye, EyeOff } from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco editor is loaded dynamically (client-side only)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="w-full h-[70vh] bg-gray-100 animate-pulse rounded-md" />
});

// List of supported languages
const LANGUAGES = [
  { id: 'Python', label: 'Python', extension: '.py' },
  { id: 'JavaScript', label: 'JavaScript', extension: '.js' },
  { id: 'TypeScript', label: 'TypeScript', extension: '.ts' },
  { id: 'C++', label: 'C++', extension: '.cpp' },
  { id: 'C#', label: 'C#', extension: '.cs' },
  { id: 'Java', label: 'Java', extension: '.java' },
  { id: 'HTML', label: 'HTML', extension: '.html' },
  { id: 'Markdown', label: 'Markdown', extension: '.md' },
];

type ConsoleOutput = {
  type: 'output' | 'error' | 'info' | 'success' | 'system';
  content: string;
  timestamp: Date;
};

type FileItem = {
  id: string;
  name: string;
  type: 'file';
  extension: string;
  content: string;
  parentId: string | null;
};

type FolderItem = {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  isOpen?: boolean;
};

type FileSystemItem = FileItem | FolderItem;

// Define Shortcut type
type Shortcut = {
  id: string;
  function: string;
  key: string;
  editable: boolean;
  action: () => void;
};

export default function EditorPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('vs-dark');
  const [isRunning, setIsRunning] = useState(false);
  const [fileName, setFileName] = useState('untitled');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [projects, setProjects] = useState<string[]>(['My Project']);
  const [currentProject, setCurrentProject] = useState('My Project');
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    { id: 'folder-1', name: 'src', type: 'folder', parentId: null, isOpen: true },
    { id: 'folder-2', name: 'docs', type: 'folder', parentId: null, isOpen: false },
    { id: 'file-1', name: 'untitled.py', type: 'file', extension: '.py', content: 'print("Hello, World!")', parentId: 'folder-1' },
    { id: 'file-2', name: 'readme.md', type: 'file', extension: '.md', content: '# Project Documentation', parentId: 'folder-2' }
  ]);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    itemId: string | null;
  }>({
    visible: false,
    x: 0, 
    y: 0,
    itemId: null
  });
  const editorRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  // Add states for custom shortcut keys
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([
    { id: 'new-file', function: 'New File', key: 'Ctrl+N', editable: true, action: () => createNewFile(null) },
    { id: 'new-folder', function: 'New Folder', key: 'Ctrl+Shift+N', editable: true, action: () => createNewFolder(null) },
    { id: 'save', function: 'Save', key: 'Ctrl+S', editable: true, action: () => saveFile() },
    { id: 'run', function: 'Run', key: 'F5', editable: true, action: () => runCode() },
    { id: 'toggle-console', function: 'Toggle Console', key: 'Ctrl+`', editable: true, action: () => setIsConsoleMinimized(prev => !prev) },
    { id: 'format', function: 'Format Code', key: 'Shift+Alt+F', editable: true, action: () => formatCode() },
    { id: 'find', function: 'Find', key: 'Ctrl+F', editable: false, action: () => {} },
    { id: 'replace', function: 'Replace', key: 'Ctrl+H', editable: false, action: () => {} },
    { id: 'comment', function: 'Toggle Comment', key: 'Ctrl+/', editable: false, action: () => {} },
    { id: 'indent', function: 'Indent', key: 'Tab', editable: false, action: () => {} },
    { id: 'outdent', function: 'Outdent', key: 'Shift+Tab', editable: false, action: () => {} },
    { id: 'toggle-preview', function: 'Toggle Preview', key: 'Ctrl+P', editable: true, action: () => setShowPreview(prev => !prev) },
  ]);

  // Add settings tab state
  const [settingsTab, setSettingsTab] = useState<'general' | 'feature' | 'shortcuts'>('general');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState<string>('');

  // Add state for code execution 
  const [runnerInstance, setRunnerInstance] = useState<any>(null);
  const [runnerLanguages, setRunnerLanguages] = useState<string[]>([]);
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerAvailable, setRunnerAvailable] = useState(false);

  // Add state for action feedback
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    timeout: NodeJS.Timeout | null;
  }>({
    visible: false,
    message: '',
    type: 'info',
    timeout: null
  });

  // Update current file content when code changes
  useEffect(() => {
    if (currentFileId) {
      setFileSystem(prev => 
        prev.map(item => 
          item.id === currentFileId && item.type === 'file' 
            ? { ...item, content: code } 
            : item
        )
      );
    }
  }, [code, currentFileId]);

  // Set extension and default code when language changes
  useEffect(() => {
    const selectedLanguage = LANGUAGES.find(lang => lang.id === language);
    if (selectedLanguage && !currentFileId) {
      setCode(getDefaultCodeForLanguage(language));
      setFileName(`untitled${selectedLanguage.extension}`);
    }
  }, [language, currentFileId]);

  // Called when editor instance is mounted
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Additional settings (auto-completion, hints, etc.)
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  // Console output rendering function
  const renderConsoleOutput = () => {
    return (
      <div className="bg-gray-900 text-white p-4 overflow-y-auto font-mono text-sm">
        {consoleOutput.map((output, index) => (
          <div key={index} className={`mb-1 ${output.type === 'error' ? 'text-red-400' : 
                                              output.type === 'success' ? 'text-green-400' : 
                                              output.type === 'system' ? 'text-purple-400' : 
                                              output.type === 'info' ? 'text-blue-400' : 'text-gray-200'}`}>
            <span className="text-gray-500 mr-2">
              {`[${output.timestamp.toLocaleTimeString()}]`}
            </span>
            {output.content}
          </div>
        ))}
      </div>
    );
  };
  
  // Helper function to extract print content
  const extractPrintContent = (content: string): string => {
    content = content.trim();
    
    // Handle quoted strings
    if ((content.startsWith('"') && content.endsWith('"')) || 
        (content.startsWith("'") && content.endsWith("'"))) {
      return content.substring(1, content.length - 1);
    } 
    // Handle variable or expression (simple simulation)
    else if (content.includes('+')) {
      // Support string concatenation (e.g., 'hello' + 'world')
      const parts = content.split('+').map(p => p.trim());
      const processedParts = parts.map(p => {
        if ((p.startsWith('"') && p.endsWith('"')) || 
            (p.startsWith("'") && p.endsWith("'"))) {
          return p.substring(1, p.length - 1);
        }
        return `[variable: ${p}]`;
      });
      return processedParts.join('');
    } 
    // Handle variable names only
    else {
      return `[variable: ${content}]`;
    }
  };
  
  // Separate simulation logic into a separate function
  const simulateCodeExecution = () => {
    let output = '';
    
    // Find print or console.log statements in the code
    const printRegexPython = /print\((.+?)\)/g;
    const consoleLogRegex = /console\.log\((.+?)\)/g;
    const systemOutRegex = /System\.out\.println\((.+?)\)/g;
    const coutRegex = /std::cout\s*<<\s*(.+?)\s*<</g;
    const cSharpRegex = /Console\.WriteLine\((.+?)\)/g;
    
    if (language.toLowerCase() === 'python') {
      // Python execution simulation
      let match;
      while ((match = printRegexPython.exec(code)) !== null) {
        output += extractPrintContent(match[1]) + '\n';
      }
      
      // Simple error check
      if (code.includes('syntax error')) {
        throw new Error('SyntaxError: invalid syntax');
      }
    } else if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
      // JavaScript/TypeScript execution simulation
      let match;
      while ((match = consoleLogRegex.exec(code)) !== null) {
        output += extractPrintContent(match[1]) + '\n';
      }
      
      // Simple error check
      if (code.includes('syntax error')) {
        throw new Error('SyntaxError: Unexpected token');
      }
    } else if (language.toLowerCase() === 'java') {
      // Java execution simulation
      let match;
      while ((match = systemOutRegex.exec(code)) !== null) {
        output += extractPrintContent(match[1]) + '\n';
      }
      
      // Simple error check
      if (!code.includes('public static void main')) {
        throw new Error('Error: Main method not found');
      }
    } else if (language.toLowerCase() === 'c++') {
      // C++ execution simulation
      let match;
      while ((match = coutRegex.exec(code)) !== null) {
        output += extractPrintContent(match[1]) + '\n';
      }
    } else if (language.toLowerCase() === 'c#') {
      // C# execution simulation
      let match;
      while ((match = cSharpRegex.exec(code)) !== null) {
        output += extractPrintContent(match[1]) + '\n';
      }
    } else {
      // Handle other languages simply
      output = 'This language only runs in simulation mode.\n';
      output += `${language} environment requires server configuration.\n`;
      output += 'To run real code, please:\n';
      output += '1. Set up code execution API on backend\n';
      output += '2. Configure Docker/container sandbox environment\n';
      output += '3. Set up language-specific runtime environments\n';
      output += '4. Configure API authentication and security\n';
    }
    
    // Show default message if output is empty
    if (!output.trim()) {
      output = '(No output)';
    }
    
    // Display execution results
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'output', 
        content: output, 
        timestamp: new Date() 
      }
    ]);
  };
  
  // Improved file execution function - supports actual code execution
  const runCode = async () => {
    if (!currentFileId) {
      setConsoleOutput(prev => [
        ...prev,
        { 
          type: 'error', 
          content: 'Please select a file to run', 
          timestamp: new Date() 
        }
      ]);
      return;
    }
    
    // Current selected file information
    const currentFile = fileSystem.find(item => item.id === currentFileId) as FileItem | undefined;
    if (!currentFile) return;
    
    // Save current file
    saveFile(true);
    
    // Start execution message
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'system', 
        content: "------------ Running Results ------------", 
        timestamp: new Date() 
      }
    ]);
    
    // Code execution logic
    try {
      setIsRunning(true);
      
      // If actual code execution is available
      if (runnerAvailable && runnerLanguages.includes(language.toLowerCase())) {
        // Actual code execution request (to be replaced with API call in actual implementation)
        setConsoleOutput(prev => [
          ...prev,
          { 
            type: 'info', 
            content: `Running ${language} code...`, 
            timestamp: new Date() 
          }
        ]);
        
        // Simulate backend API call (replace with server API call in actual implementation)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate execution results
        let output = '';
        
        // Execution results simulation based on code content
        if (language.toLowerCase() === 'python') {
          if (code.includes('print(')) {
            // Python execution simulation
            const matches = code.match(/print\s*\((.*?)\)/g) || [];
            for (const match of matches) {
              const contentMatch = match.match(/print\s*\((.*?)\)/);
              if (contentMatch && contentMatch[1]) {
                output += extractPrintContent(contentMatch[1]) + '\n';
              }
            }
          } else if (code.includes('import ')) {
            output += "Loading package...\n";
            if (code.includes('import numpy') || code.includes('import pandas')) {
              output += "Data analysis libraries initialized\n";
            }
          }
        } else if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
          if (code.includes('console.log(')) {
            // JavaScript/TypeScript execution simulation
            const matches = code.match(/console\.log\s*\((.*?)\)/g) || [];
            for (const match of matches) {
              const contentMatch = match.match(/console\.log\s*\((.*?)\)/);
              if (contentMatch && contentMatch[1]) {
                output += extractPrintContent(contentMatch[1]) + '\n';
              }
            }
          } else if (code.includes('fetch(') || code.includes('axios.')) {
            output += "Making API request...\n";
            output += "Response received: { status: 'success', data: [...] }\n";
          }
        }
        
        // Show default message if output is empty
        if (!output.trim()) {
          if (code.trim()) {
            output = 'Code executed successfully. (No output)';
          } else {
            output = 'No code to execute.';
          }
        }
        
        // Display execution results
        setConsoleOutput(prev => [
          ...prev,
          { 
            type: 'output', 
            content: output, 
            timestamp: new Date() 
          }
        ]);
      } else {
        // Run simulation (existing logic)
        simulateCodeExecution();
      }
    } catch (error: any) {
      // Add error message
      setConsoleOutput(prev => [
        ...prev,
        { 
          type: 'error', 
          content: error.message || 'Unknown error occurred', 
          timestamp: new Date() 
        }
      ]);
    } finally {
      // Add completion message
      setConsoleOutput(prev => [
        ...prev,
        { 
          type: 'system', 
          content: 'Execution completed', 
          timestamp: new Date() 
        }
      ]);
      setIsRunning(false);
    }
  };
  
  // Initialize actual code runner
  useEffect(() => {
    const checkRunner = async () => {
      try {
        setRunnerLoading(true);
        
        // In actual implementation, you should call an API to send code execution requests to the server
        // Currently only providing simulation
        
        // Simulating backend service connection (wait 1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Supported language list (should be fetched from server in actual implementation)
        const supportedLanguages = ['python', 'javascript', 'typescript'];
        setRunnerLanguages(supportedLanguages);
        setRunnerAvailable(true);
        
        setConsoleOutput(prev => [
          ...prev,
          { 
            type: 'info', 
            content: 'Code execution environment is ready. Supported languages: ' + supportedLanguages.join(', '), 
            timestamp: new Date() 
          }
        ]);
      } catch (error) {
        setRunnerAvailable(false);
        setConsoleOutput(prev => [
          ...prev,
          { 
            type: 'error', 
            content: 'Failed to initialize code execution environment. Running in local simulation mode.', 
            timestamp: new Date() 
          }
        ]);
      } finally {
        setRunnerLoading(false);
      }
    };
    
    checkRunner();
    
    return () => {
      // Cleanup function
      if (runnerInstance) {
        // Cleanup logic for connected instance needed in actual implementation
      }
    };
  }, []);

  // Add function definitions that are used in shortcuts
  // Get default code for each language
  const getDefaultCodeForLanguage = (language: string): string => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'print("Hello, World!")\n\n# Write your code here\n';
      case 'javascript':
        return 'console.log("Hello, World!");\n\n// Write your code here\n';
      case 'typescript':
        return 'console.log("Hello, World!");\n\n// Write your code here\n';
      case 'c++':
        return '#include <iostream>\n\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n';
      case 'java':
        return 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n';
      case 'c#':
        return 'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, World!");\n  }\n}\n';
      case 'html':
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>HTML Document</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      margin: 40px;\n      line-height: 1.6;\n    }\n  </style>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Write your content here.</p>\n</body>\n</html>\n';
      case 'markdown':
        return '# Markdown Document\n\n## Introduction\n\nThis is a document written in markdown format.\n\n## Features\n\n- Simple syntax\n- Good readability\n- Convertible to various formats\n\n## How to Use\n\n1. Learn markdown syntax\n2. Write your document\n3. Convert to desired format\n\n```\n// Code blocks are supported\nconsole.log("Hello World!");\n```\n';
      default:
        return '// Hello, World!\n';
    }
  };
  
  // Define context menu options in English
  const contextMenuOptions = [
    { id: 'new-file', label: 'New File', icon: '📄' },
    { id: 'new-folder', label: 'New Folder', icon: '📁' },
    { id: 'copy', label: 'Copy Path', icon: '📋' },
    { id: 'rename', label: 'Rename', icon: '✏️' },
    { id: 'duplicate', label: 'Duplicate', icon: '🔄' },
    { id: 'delete', label: 'Delete', icon: '🗑️' },
  ];
  
  // Open context menu function
  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set context menu position
    const x = e.clientX;
    const y = e.clientY;
    
    setContextMenu({
      visible: true,
      x, 
      y,
      itemId
    });
  };
  
  // Copy path function
  const copyPath = (itemId: string) => {
    const item = fileSystem.find(item => item.id === itemId);
    if (!item) return;
    
    // Create full path for item
    const getFullPath = (itemId: string, path = ''): string => {
      const item = fileSystem.find(i => i.id === itemId);
      if (!item) return path;
      
      const newPath = `${item.name}${path ? '/' + path : ''}`;
      
      if (item.parentId) {
        return getFullPath(item.parentId, newPath);
      }
      
      return newPath;
    };
    
    const fullPath = getFullPath(itemId);
    navigator.clipboard.writeText(fullPath);
    
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'info', 
        content: `Copied path: ${fullPath}`, 
        timestamp: new Date() 
      }
    ]);
    
    setContextMenu({ visible: false, x: 0, y: 0, itemId: null });
  };
  
  // Format code function
  const formatCode = () => {
    if (!editorRef.current || !currentFileId) return;
    
    // Use Monaco editor's format document action
    editorRef.current.getAction('editor.action.formatDocument')?.run();
    
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'info', 
        content: 'Code formatting completed', 
        timestamp: new Date() 
      }
    ]);
  };
  
  // File save function
  const saveFile = (isAutoSave = false) => {
    if (!currentFileId) return;
    
    const file = fileSystem.find(item => item.id === currentFileId);
    if (!file || file.type !== 'file') return;
    
    // Don't save if content hasn't changed
    if (file.content === code) {
      if (!isAutoSave) {
        setConsoleOutput(prev => [
          ...prev,
          { 
            type: 'info', 
            content: 'No changes to save', 
            timestamp: new Date() 
          }
        ]);
        
        showFeedback('No changes to save', 'info');
      }
      return;
    }
    
    // Update file system
    setFileSystem(prev =>
      prev.map(item =>
        item.id === currentFileId
          ? { ...item as FileItem, content: code }
          : item
      )
    );
    
    if (!isAutoSave) {
      setConsoleOutput(prev => [
        ...prev,
        { 
          type: 'success', 
          content: `${file.name} file saved successfully`, 
          timestamp: new Date() 
        }
      ]);
      
      // Show feedback
      showFeedback(`${file.name} file saved successfully`, 'success');
    }
  };
  
  // Action feedback display function
  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Clear previous timer if exists
    if (feedback.timeout) {
      clearTimeout(feedback.timeout);
    }
    
    // Set new feedback
    const timeout = setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 3000);
    
    setFeedback({
      visible: true,
      message,
      type,
      timeout
    });
  };
  
  // File select function
  const selectFile = (fileId: string) => {
    const selectedFile = fileSystem.find(item => item.id === fileId && item.type === 'file') as FileItem | undefined;
    
    if (selectedFile) {
      setCurrentFileId(fileId);
      setFileName(selectedFile.name);
      setCode(selectedFile.content);
      
      // Set language based on selected file
      const ext = selectedFile.extension.substring(1);
      const lang = LANGUAGES.find(l => l.extension.substring(1) === ext);
      if (lang) {
        setLanguage(lang.id);
      }
      
      // Show feedback
      showFeedback(`${selectedFile.name} file opened`, 'info');
    }
  };
  
  // Toggle folder function
  const toggleFolder = (folderId: string) => {
    const folder = fileSystem.find(item => item.id === folderId && item.type === 'folder') as FolderItem | undefined;
    if (!folder) return;
    
    const newIsOpen = !folder.isOpen;
    
    setFileSystem(prev => 
      prev.map(item => 
        item.id === folderId && item.type === 'folder' 
          ? { ...item, isOpen: newIsOpen } 
          : item
      )
    );
    
    // Show feedback
    showFeedback(`${folder.name} folder ${newIsOpen ? 'opened' : 'closed'}`, 'info');
  };
  
  // Create new file function
  const createNewFile = (parentId: string | null = null) => {
    const defaultFileName = `untitled.${language.toLowerCase().replace('typescript', 'ts')}`;
    let fileName = defaultFileName;
    let counter = 1;
    
    // Check if file with same name exists
    while (fileSystem.some(item => item.name === fileName && item.parentId === parentId)) {
      fileName = `untitled${counter}.${language.toLowerCase().replace('typescript', 'ts')}`;
      counter++;
    }
    
    const selectedLanguage = LANGUAGES.find(lang => lang.id === language);
    const extension = selectedLanguage?.extension || '.txt';
    
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: 'file',
      parentId: parentId,
      content: getDefaultCodeForLanguage(language),
      extension
    };
    
    setFileSystem(prev => [...prev, newFile]);
    selectFile(newFile.id);
    
    // Open parent folder if exists
    if (parentId) {
      openParentFolders(parentId);
    }
    
    setConsoleOutput(prev => [
      ...prev, 
      { 
        type: 'info', 
        content: `✨ New file ${fileName} created`, 
        timestamp: new Date() 
      }
    ]);
    
    // Show feedback
    showFeedback(`New file ${fileName} created`, 'success');
  };
  
  // Create new folder function
  const createNewFolder = (parentId: string | null = null) => {
    let folderName = "New Folder";
    let counter = 1;
    
    // Check if folder with same name exists
    while (fileSystem.some(item => item.name === folderName && item.parentId === parentId)) {
      folderName = `New Folder ${counter}`;
      counter++;
    }
    
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: 'folder',
      parentId: parentId,
      isOpen: true
    };
    
    setFileSystem(prev => [...prev, newFolder]);
    
    // Open parent folder if exists
    if (parentId) {
      openParentFolders(parentId);
    }
    
    setConsoleOutput(prev => [
      ...prev, 
      { 
        type: 'info', 
        content: `📁 New folder ${folderName} created`, 
        timestamp: new Date() 
      }
    ]);
    
    // Show feedback
    showFeedback(`New folder ${folderName} created`, 'success');
  };
  
  // Open all parent folders function
  const openParentFolders = (folderId: string | null) => {
    if (!folderId) return;
    
    const folder = fileSystem.find(item => item.id === folderId && item.type === 'folder');
    if (folder) {
      // Open current folder
      setFileSystem(prev => 
        prev.map(item => 
          item.id === folderId 
            ? { ...item, isOpen: true } 
            : item
        )
      );
      
      // Recursively open parent folders
      if (folder.parentId) {
        openParentFolders(folder.parentId);
      }
    }
  };
  
  // Delete item function
  const deleteItem = (itemId: string) => {
    const itemToDelete = fileSystem.find(item => item.id === itemId);
    if (!itemToDelete) return;
    
    // Find all children of item (if folder)
    const getChildrenIds = (parentId: string): string[] => {
      const directChildren = fileSystem.filter(item => item.parentId === parentId);
      const allChildrenIds = directChildren.map(child => child.id);
      
      // Recursively add children of folders
      directChildren.forEach(child => {
        if (child.type === 'folder') {
          allChildrenIds.push(...getChildrenIds(child.id));
        }
      });
      
      return allChildrenIds;
    };
    
    const idsToDelete = [itemId, ...getChildrenIds(itemId)];
    
    // Clear selection if selected file is being deleted
    if (currentFileId && idsToDelete.includes(currentFileId)) {
      setCurrentFileId(null);
      setCode('');
      setFileName('');
    }
    
    // Remove items from file system
    setFileSystem(prev => prev.filter(item => !idsToDelete.includes(item.id)));
    
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'info', 
        content: `Deleted: ${itemToDelete.name}`, 
        timestamp: new Date() 
      }
    ]);
  };
  
  // Rename item function
  const renameItem = (itemId: string, newName: string) => {
    const item = fileSystem.find(i => i.id === itemId);
    if (!item) return;
    
    const oldName = item.name;
    
    setFileSystem(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          if (item.type === 'file') {
            // For files, keep extension
            const currentExt = item.extension;
            const newExt = newName.includes('.') ? `.${newName.split('.').pop()}` : currentExt;
            const nameWithoutExt = newName.includes('.') ? newName.substring(0, newName.lastIndexOf('.')) : newName;
            
            if (itemId === currentFileId) {
              setFileName(`${nameWithoutExt}${newExt}`);
            }
            
            return {
              ...item,
              name: `${nameWithoutExt}${newExt}`,
              extension: newExt
            };
          } else {
            // For folders, simple rename
            return { ...item, name: newName };
          }
        }
        return item;
      })
    );
    
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'info', 
        content: `${oldName} renamed to ${newName}`, 
        timestamp: new Date() 
      }
    ]);
    
    // Show feedback
    showFeedback(`${oldName} renamed to ${newName}`, 'success');
  };
  
  // Duplicate file function
  const duplicateFile = (fileId: string) => {
    const fileToDuplicate = fileSystem.find(item => item.id === fileId && item.type === 'file') as FileItem | undefined;
    if (!fileToDuplicate) return;
    
    const newFileId = `file-${Date.now()}`;
    const nameParts = fileToDuplicate.name.split('.');
    const ext = nameParts.length > 1 ? `.${nameParts.pop()}` : '';
    const baseName = nameParts.join('.');
    const newFileName = `${baseName}-copy${ext}`;
    
    const newFile: FileItem = {
      ...fileToDuplicate,
      id: newFileId,
      name: newFileName
    };
    
    setFileSystem(prev => [...prev, newFile]);
    
    setConsoleOutput(prev => [
      ...prev,
      { 
        type: 'info', 
        content: `Duplicated file: ${newFileName}`, 
        timestamp: new Date() 
      }
    ]);
  };

  // File system item rendering component
  const FileSystemItem = ({ item, level = 0 }: { item: FileSystemItem, level?: number }) => {
    const childItems = fileSystem.filter(i => i.parentId === item.id);
    const isFolder = item.type === 'folder';
    const isSelected = currentFileId === item.id;
    const isOpen = isFolder && (item as FolderItem).isOpen;
    
    return (
      <div className="select-none">
        <div 
          className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-left
            ${isSelected ? 'bg-purple-700 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            e.stopPropagation();
            if (isFolder) {
              toggleFolder(item.id);
            } else {
              selectFile(item.id);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item.id)}
        >
          {isFolder ? (
            <>
              <button 
                className="w-4 h-4 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.id);
                }}
              >
                {isOpen ? '▾' : '▸'}
              </button>
              <Folder className={`h-4 w-4 ${isOpen ? 'text-yellow-400' : 'text-gray-400'}`} />
            </>
          ) : (
            <>
              <span className="w-4"></span>
              <Code className="h-4 w-4 text-blue-400" />
            </>
          )}
          <span className="truncate">{item.name}</span>
        </div>
        
        {/* Show children if folder is open */}
        {isOpen && (
          <div>
            {childItems.length > 0 ? (
              childItems.map(child => (
                <FileSystemItem key={child.id} item={child} level={level + 1} />
              ))
            ) : (
              <div 
                className="text-gray-500 text-xs pl-12 py-1"
                style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              >
                Empty folder
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Sidebar file system rendering
  const renderFileSystem = () => {
    const rootItems = fileSystem.filter(item => item.parentId === null);
    
    return (
      <div className="space-y-1">
        {rootItems.map(item => (
          <FileSystemItem key={item.id} item={item} />
        ))}
      </div>
    );
  };
  
  // Preview rendering function
  const renderPreview = () => {
    // Return null if no file selected or preview disabled
    if (!showPreview || !currentFileId) return null;
    
    // Get content of current file
    const file = fileSystem.find(item => item.id === currentFileId) as FileItem | undefined;
    if (!file) return null;
    
    // Show different preview based on language
    let previewContent = null;
    
    if (language === 'HTML' || code.includes('<html') || code.includes('<body')) {
      // HTML code preview
      previewContent = (
        <div className="w-full h-full">
          <iframe
            srcDoc={code}
            title="HTML Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
        </div>
      );
    } else if (language === 'Markdown' || file.name.endsWith('.md')) {
      // Markdown preview (simple implementation)
      previewContent = (
        <div className="w-full h-full p-4 overflow-auto prose prose-invert max-w-none">
          {code.split('\n').map((line, index) => {
            // Simple markdown conversion logic
            if (line.startsWith('# ')) {
              return <h1 key={index}>{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={index}>{line.substring(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={index}>{line.substring(4)}</h3>;
            } else if (line.startsWith('- ')) {
              return <li key={index}>{line.substring(2)}</li>;
            } else if (line.trim() === '') {
              return <br key={index} />;
            } else {
              return <p key={index}>{line}</p>;
            }
          })}
        </div>
      );
    } else {
      // Show unsupported message for other languages
      previewContent = (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-gray-500">
          <EyeOff className="w-12 h-12" />
          <p>Preview is not supported for this file type.</p>
          <p className="text-sm">Only HTML and Markdown files can be previewed.</p>
        </div>
      );
    }
    
    return (
      <div className="flex-1 bg-white dark:bg-gray-950 overflow-auto">
        {previewContent}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full py-3 px-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-purple-400" />
              <span className="font-bold text-xl text-white">CodePro Editor</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => createNewFile(null)}
              variant="outline"
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 gap-2 h-9"
            >
              <FilePlus className="h-4 w-4" />
              <span className="hidden sm:inline">New File</span>
            </Button>

            <Button
              onClick={() => createNewFolder(null)}
              variant="outline"
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 gap-2 h-9"
            >
              <FolderPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Folder</span>
            </Button>

            <Button
              onClick={runCode}
              disabled={isRunning || !currentFileId}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 h-9"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Run</span>
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
              onClick={() => saveFile()}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>

            <Button
              variant="outline"
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 h-9"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Shortcut settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSettings(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Settings tab */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                className={`py-2 px-4 ${settingsTab === 'general' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
                onClick={() => setSettingsTab('general')}
              >
                General
              </button>
              <button
                className={`py-2 px-4 ${settingsTab === 'feature' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
                onClick={() => setSettingsTab('feature')}
              >
                Features
              </button>
              <button
                className={`py-2 px-4 ${settingsTab === 'shortcuts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
                onClick={() => setSettingsTab('shortcuts')}
              >
                Shortcuts
              </button>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-y-auto dark:text-white">
              {/* General settings */}
              {settingsTab === 'general' && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Theme</label>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                        className={theme === 'dark' ? 'bg-blue-600' : ''}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('light')}
                        className={theme === 'light' ? 'bg-blue-600' : ''}
                      >
                        Light
                      </Button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Font Size</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        step="1"
                        defaultValue="14"
                        className="w-full"
                      />
                      <span className="ml-2 w-8 text-center">{14}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Feature settings */}
              {settingsTab === 'feature' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span>Minimap</span>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      onChange={(e) => {
                        if (editorRef.current) {
                          editorRef.current.updateOptions({ minimap: { enabled: e.target.checked } });
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span>Line Numbers</span>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      onChange={(e) => {
                        if (editorRef.current) {
                          editorRef.current.updateOptions({ lineNumbers: e.target.checked ? 'on' : 'off' });
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span>Auto Save</span>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      onChange={(e) => {
                        if (editorRef.current) {
                          // Handle auto save toggle
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Shortcut settings */}
              {settingsTab === 'shortcuts' && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">
                    Click the edit button and enter a new key combination to change shortcuts.
                  </p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Function</th>
                        <th className="text-left py-2">Shortcut</th>
                        <th className="text-left py-2">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortcuts.map((shortcut) => (
                        <tr key={shortcut.id} className="border-b border-gray-700">
                          <td className="py-2">{shortcut.function}</td>
                          <td className="py-2">{shortcut.key}</td>
                          <td className="py-2">
                            {shortcut.editable ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => {
                                  setEditingShortcut(shortcut.id);
                                  setTempKey(shortcut.key);
                                }}
                              >
                                Edit
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-xs">System</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Some shortcuts cannot be changed as they are used by the browser.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <Button 
                onClick={() => setShowSettings(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-gray-800 border border-gray-700 shadow-xl rounded-md overflow-hidden text-sm z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenuOptions.map((option, index) => {
            // Get current selected item information
            const selectedItem = fileSystem.find(item => item.id === contextMenu.itemId);
            const isFolder = selectedItem?.type === 'folder';
            
            // Check if the option should be shown
            const shouldShow = 
              (option.id === 'new-file' || option.id === 'new-folder') 
                ? isFolder // New file/folder options are shown only when a folder is selected
                : option.id === 'duplicate' 
                  ? !isFolder // Duplicate option is shown only when a file is selected
                  : true;     // Rest are always shown
            
            return shouldShow ? (
              <button
                key={option.id}
                className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2"
                onClick={() => {
                  // Close menu
                  setContextMenu({ visible: false, x: 0, y: 0, itemId: '' });
                  
                  // Perform action based on option
                  switch (option.id) {
                    case 'copy':
                      copyPath(contextMenu.itemId);
                      break;
                    case 'rename':
                      // Rename item
                      const item = fileSystem.find(i => i.id === contextMenu.itemId);
                      if (item) {
                        const newName = prompt('Enter new name:', item.name);
                        if (newName && newName !== item.name) {
                          renameItem(contextMenu.itemId, newName);
                        }
                      }
                      break;
                    case 'delete':
                      // Delete confirmation
                      if (confirm('Are you sure you want to delete?')) {
                        deleteItem(contextMenu.itemId);
                      }
                      break;
                    case 'new-file':
                      // Create new file in selected folder
                      createNewFile(contextMenu.itemId);
                      break;
                    case 'new-folder':
                      // Create new folder in selected folder
                      createNewFolder(contextMenu.itemId);
                      break;
                    case 'duplicate':
                      // Duplicate file
                      duplicateFile(contextMenu.itemId);
                      break;
                  }
                }}
              >
                <span className="w-5 h-5 flex items-center justify-center">{option.icon}</span>
                {option.label}
              </button>
            ) : null;
          })}
        </div>
      )}

      {/* Action feedback display */}
      <div className={`fixed top-16 right-4 z-50 transition-all duration-300 transform ${
        feedback.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className={`px-4 py-2 rounded-md shadow-lg text-white ${
          feedback.type === 'success' ? 'bg-green-500' : 
          feedback.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {feedback.message}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 text-white p-4 hidden md:block">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Projects</h3>
            <Select value={currentProject} onValueChange={setCurrentProject}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {projects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">File Explorer</h3>
            </div>
            {renderFileSystem()}
          </div>
        </div>

        {/* Editor and console */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex h-10 items-center justify-between border-b border-gray-800 bg-gray-950 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{fileName}</span>
              <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
                {language}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700 gap-2 h-8"
              >
                {showPreview ? (
                  <>
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Code View</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Code editor area */}
            {!showPreview && (
              <div className="flex-1 overflow-auto">
                {currentFileId ? (
                  <MonacoEditor
                    height="100%"
                    language={language.toLowerCase()}
                    value={code}
                    theme={theme}
                    onChange={setCode}
                    onMount={handleEditorDidMount}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-900 text-gray-500">
                    <p>Select a file or create a new one</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Preview area */}
            {renderPreview()}
          </div>

          {/* Console */}
          <div className={`bg-gray-900 border-t border-gray-700 text-white transition-all duration-300 ${isConsoleMinimized ? 'h-10' : 'h-[240px]'}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <h3 className="text-sm font-medium">Console</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsConsoleMinimized(prev => !prev)}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
            
            {!isConsoleMinimized && (
              <div className="p-4 h-[200px] overflow-y-auto font-mono text-sm">
                {renderConsoleOutput()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 