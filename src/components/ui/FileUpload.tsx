'use client';

import { cn } from '@/lib/utils';
import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
  accept?: string;
  label?: string;
  helperText?: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

export default function FileUpload({
  accept = '.csv,.xlsx,.xls',
  label = 'Upload File',
  helperText = 'CSV or Excel files supported',
  onFileSelect,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <svg
          className="mx-auto h-10 w-10 text-gray-400 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {fileName ? (
          <p className="text-sm text-primary-600 font-medium">{fileName}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Drag & drop or <span className="text-primary-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{helperText}</p>
          </>
        )}
      </div>
    </div>
  );
}
