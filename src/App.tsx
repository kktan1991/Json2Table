import React, { useState, useEffect } from 'react';
import { Copy, Trash2, AlignLeft, Shrink, Check, TableProperties, PanelLeftClose, PanelLeft, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const JsonTable = ({ data, depth = 0 }: { data: any, depth?: number }) => {
  if (data === null) return <span className="text-gray-500 dark:text-gray-400 italic font-semibold">null</span>;
  
  if (typeof data === 'string') return <span className="text-green-600 dark:text-green-400 break-words">{data}</span>;
  if (typeof data === 'number') return <span className="text-blue-600 dark:text-blue-400">{data}</span>;
  if (typeof data === 'boolean') return <span className="text-orange-600 dark:text-orange-400 font-semibold">{data ? 'true' : 'false'}</span>;
  if (typeof data !== 'object') return <span>{String(data)}</span>;

  // Prevent infinite loops or excessively deep tables
  if (depth > 5) return <span className="font-mono text-xs text-gray-500 break-all">{JSON.stringify(data)}</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-500 italic">Empty Array []</span>;

    // Check if it's an array of objects to render as a multi-column table
    const isObjectArray = data.length > 0 && data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

    if (isObjectArray) {
      // Extract all unique keys across all objects in the array for column headers
      const columns = Array.from(new Set(data.flatMap(item => Object.keys(item))));
      
      return (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md my-1 bg-white dark:bg-gray-900 shadow-sm w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 font-semibold border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-2 align-top border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                      <JsonTable data={row[col]} depth={depth + 1} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      // Array of primitives or mixed types
      return (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md my-1 bg-white dark:bg-gray-900 shadow-sm w-full">
          <table className="w-full text-left text-sm border-collapse">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 py-2 text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 font-mono text-xs w-16 align-top">
                    {i}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <JsonTable data={item} depth={depth + 1} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // Single Object
  const entries = Object.entries(data);
  if (entries.length === 0) return <span className="text-gray-500 italic">Empty Object {'{}'}</span>;

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md my-1 bg-white dark:bg-gray-900 shadow-sm w-full">
      <table className="w-full text-left text-sm border-collapse">
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {entries.map(([key, val]) => (
            <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-3 py-2 font-mono text-purple-700 dark:text-purple-400 border-r border-gray-200 dark:border-gray-700 align-top bg-gray-50/50 dark:bg-gray-800/20 break-all w-1/4">
                {key}
              </td>
              <td className="px-3 py-2 align-top">
                <JsonTable data={val} depth={depth + 1} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function App() {
  const defaultJson = `[
  {
    "id": 1,
    "name": "Alice Smith",
    "role": "Admin",
    "active": true,
    "details": { "department": "Engineering", "location": "New York" }
  },
  {
    "id": 2,
    "name": "Bob Jones",
    "role": "Editor",
    "active": false,
    "details": { "department": "Marketing", "location": "London" }
  },
  {
    "id": 3,
    "name": "Charlie Brown",
    "role": "Viewer",
    "active": true,
    "details": { "department": "Sales", "location": "Tokyo" }
  }
]`;

  const [input, setInput] = useState(defaultJson);
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    if (!input.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      const result = JSON.parse(input);
      setParsed(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [input]);

  const formatJson = () => {
    if (parsed) setInput(JSON.stringify(parsed, null, 2));
  };

  const minifyJson = () => {
    if (parsed) setInput(JSON.stringify(parsed));
  };

  const copyToClipboard = () => {
    if (parsed) {
      navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const safeStringify = (val: any): any => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string') {
      return val.length > 32000 ? val.substring(0, 32000) + '... [TRUNCATED]' : val;
    }
    if (typeof val !== 'object') return val;
    const str = JSON.stringify(val);
    return str.length > 32000 ? str.substring(0, 32000) + '... [TRUNCATED]' : str;
  };

  const downloadExcel = () => {
    if (!parsed) return;
    
    const workbook = XLSX.utils.book_new();
    const sheetsToCreate: { name: string, data: any[] }[] = [];

    const processNode = (node: any, name: string) => {
      if (Array.isArray(node)) {
        const isArrayOfObjects = node.length > 0 && node.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));
        
        if (isArrayOfObjects) {
          const flattenedArray = node.map(item => {
            const flatItem: any = {};
            for (const k in item) {
              if (typeof item[k] === 'object' && item[k] !== null) {
                flatItem[k] = safeStringify(item[k]);
              } else {
                flatItem[k] = item[k];
              }
            }
            return flatItem;
          });
          sheetsToCreate.push({ name, data: flattenedArray });
        } else {
          sheetsToCreate.push({ name, data: node.map((val, i) => ({ Index: i, Value: safeStringify(val) })) });
        }
      } else if (typeof node === 'object' && node !== null) {
        const primitives: any = {};
        for (const k in node) {
          if (typeof node[k] === 'object' && node[k] !== null) {
            const nextName = name === "Main" ? k : `${name.substring(0, 10)}_${k}`;
            processNode(node[k], nextName);
          } else {
            primitives[k] = node[k];
          }
        }
        if (Object.keys(primitives).length > 0) {
          const kvData = Object.entries(primitives).map(([k, v]) => ({ Key: k, Value: v }));
          sheetsToCreate.push({ name, data: kvData });
        }
      } else {
        sheetsToCreate.push({ name, data: [{ Value: node }] });
      }
    };

    processNode(parsed, "Main");

    if (sheetsToCreate.length === 0) {
      sheetsToCreate.push({ name: "Data", data: [{ Message: "No data to export" }] });
    }

    const usedNames = new Set<string>();
    sheetsToCreate.forEach(sheet => {
      let safeName = sheet.name.replace(/[\\/?*[\]]/g, '').substring(0, 31);
      if (!safeName) safeName = "Sheet";
      
      let finalName = safeName;
      let counter = 1;
      while (usedNames.has(finalName)) {
        finalName = `${safeName.substring(0, 28)}_${counter}`;
        counter++;
      }
      usedNames.add(finalName);
      
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, finalName);
    });

    XLSX.writeFile(workbook, "export.xlsx");
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <TableProperties className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">JSON to Table</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowInput(!showInput)} className="px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1.5">
            {showInput ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{showInput ? 'Hide Input' : 'Show Input'}</span>
          </button>
          <button onClick={formatJson} disabled={!!error || !input} className="px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5">
            <AlignLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Format</span>
          </button>
          <button onClick={minifyJson} disabled={!!error || !input} className="px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5">
            <Shrink className="w-4 h-4" />
            <span className="hidden sm:inline">Minify</span>
          </button>
          <button onClick={() => setInput('')} className="px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center space-x-1.5">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 grid ${showInput ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} overflow-hidden`}>
        {/* Left Pane: Input */}
        {showInput && (
          <div className="flex flex-col border-r border-gray-200 dark:border-gray-800 relative min-h-0 min-w-0 md:col-span-1">
            <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 bg-gray-50/50 dark:bg-gray-900/50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">JSON Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-6 text-gray-800 dark:text-gray-200"
            />
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 font-mono">
                <div className="font-semibold mb-1">Invalid JSON</div>
                <div className="break-all">{error}</div>
              </div>
            )}
          </div>
        )}

        {/* Right Pane: Table Output */}
        <div className={`flex flex-col relative bg-gray-50/30 dark:bg-gray-900/20 min-h-0 min-w-0 ${showInput ? 'md:col-span-2' : ''}`}>
          <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-50/50 dark:bg-gray-900/50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Table View</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={downloadExcel}
                disabled={!parsed}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 transition-colors p-1"
                title="Download as Excel"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!parsed}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 transition-colors p-1"
                title="Copy formatted JSON"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {!input.trim() ? (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                Waiting for input...
              </div>
            ) : parsed !== null ? (
              <JsonTable data={parsed} />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
