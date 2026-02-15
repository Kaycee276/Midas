import { type ChangeEvent, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
}

const FileUpload = ({ label, accept = 'image/jpeg,image/png,application/pdf', error, onChange, value }: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
          {preview ? (
            <img src={preview} alt="Preview" className="h-12 w-12 rounded object-cover" />
          ) : value.type === 'application/pdf' ? (
            <FileText className="h-8 w-8 text-[var(--accent-primary)]" />
          ) : (
            <Image className="h-8 w-8 text-[var(--text-tertiary)]" />
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-[var(--text)]">{value.name}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <button type="button" onClick={handleRemove} className="rounded-lg p-1 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] p-6 transition-colors hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]">
          <Upload className="h-8 w-8 text-[var(--text-tertiary)]" />
          <span className="text-sm text-[var(--text-secondary)]">Click to upload</span>
          <span className="text-xs text-[var(--text-tertiary)]">JPG, PNG or PDF (max 5MB)</span>
          <input type="file" accept={accept} onChange={handleChange} className="hidden" />
        </label>
      )}
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
    </div>
  );
};

export default FileUpload;
