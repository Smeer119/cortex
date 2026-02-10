"use client";

import { Download, Upload } from "lucide-react";
import { useNotes } from "@/lib/store";

export function DataSync() {
    const { notes, addNote } = useNotes();

    const exportData = () => {
        const data = {
            notes,
            exportedAt: Date.now(),
            version: "1.0"
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sam-notes-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!data.notes || !Array.isArray(data.notes)) {
                    alert('Invalid file format');
                    return;
                }

                const confirmed = confirm(
                    `Import ${data.notes.length} notes?\n\n` +
                    `This will ADD these notes to your existing ${notes.length} notes.\n` +
                    `Exported on: ${new Date(data.exportedAt).toLocaleString()}`
                );

                if (confirmed) {
                    data.notes.forEach((note: any) => {
                        // Generate new IDs to avoid conflicts
                        addNote({
                            ...note,
                            id: crypto.randomUUID()
                        });
                    });
                    alert(`✅ Successfully imported ${data.notes.length} notes!`);
                }
            } catch (err) {
                alert('Error importing file: ' + (err as Error).message);
            }
        };

        input.click();
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Export notes to file"
            >
                <Download className="w-4 h-4" />
                Export
            </button>
            <button
                onClick={importData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Import notes from file"
            >
                <Upload className="w-4 h-4" />
                Import
            </button>
        </div>
    );
}
