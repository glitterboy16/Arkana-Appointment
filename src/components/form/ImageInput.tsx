import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function ImageInput({ name, onFileSelect, defaultImageUrl = null, maxSizeMB = 1 }: {
  name: string;
  onFileSelect: (file: File) => void;
  defaultImageUrl?: string | null;
  maxSizeMB?: number;
}) {
  const { t } = useTranslation();
  const [previewUrl, setPreview] = useState<string | null>(defaultImageUrl);

  useEffect(() => {
    setPreview(defaultImageUrl);
  }, [defaultImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('products.image.tooLarge', { size: maxSizeMB }));
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {previewUrl ? (
        <img src={previewUrl} alt={t('products.image.previewAlt')} className="h-40 w-40 rounded-2xl border border-[var(--app-border)] object-cover shadow-sm" />
      ) : (
        <div className="app-input flex h-40 w-40 items-center justify-center rounded-2xl border text-sm">
          {t('common.noImage')}
        </div>
      )}

      <label className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700">
        {t('products.image.select')}
        <input type="file" id={name} accept="image/*" onChange={handleChange} hidden />
      </label>
    </div>
  );
}
