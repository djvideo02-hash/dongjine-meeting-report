import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadZoneProps {
  title: string;
  description: string;
  accept: string;
  icon: React.ReactNode;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  multiple?: boolean;
}

export function FileUploadZone({
  title,
  description,
  accept,
  icon,
  files,
  onFilesChange,
  multiple = true,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      if (multiple) {
        onFilesChange([...files, ...droppedFiles]);
      } else {
        onFilesChange(droppedFiles.slice(0, 1));
      }
    },
    [files, onFilesChange, multiple]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
        }));

        if (multiple) {
          onFilesChange([...files, ...selectedFiles]);
        } else {
          onFilesChange(selectedFiles.slice(0, 1));
        }
      }
    },
    [files, onFilesChange, multiple]
  );

  const removeFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
          <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors duration-300">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            드래그하거나 클릭하여 업로드
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {files.map((file, index) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border group hover:border-primary/30 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-success" />
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 rounded-full hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
