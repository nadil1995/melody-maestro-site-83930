import { useState, useRef, useCallback } from "react";
import { Upload, Copy, Check, X, Image, Loader2, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type UploadedFile = {
  name: string;
  url: string;
  size: number;
};

type UploadState = "idle" | "uploading" | "done" | "error";

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";
const DEFAULT_FOLDER = import.meta.env.VITE_S3_FOLDER || "Lashis images";

function buildS3Client() {
  return new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  });
}

function buildUrl(folder: string, filename: string) {
  const key = folder ? `${folder}/${filename}` : filename;
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export default function S3ImageUploader() {
  const [folder, setFolder] = useState(DEFAULT_FOLDER);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "URL copied to clipboard" });
  };

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (fileArr.length === 0) {
        toast({
          title: "No images selected",
          description: "Please select image files (jpg, png, gif, webp)",
          variant: "destructive",
        });
        return;
      }

      if (
        !import.meta.env.VITE_AWS_ACCESS_KEY_ID ||
        !import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      ) {
        toast({
          title: "AWS credentials missing",
          description:
            "Set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY in your .env file",
          variant: "destructive",
        });
        return;
      }

      setState("uploading");
      setProgress(0);

      const client = buildS3Client();
      const results: UploadedFile[] = [];

      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const key = folder ? `${folder}/${file.name}` : file.name;

        try {
          const presignedUrl = await getSignedUrl(
            client,
            new PutObjectCommand({ Bucket: BUCKET, Key: key }),
            { expiresIn: 3600 }
          );
          const res = await fetch(presignedUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            const code = text.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? res.status;
            const msg  = text.match(/<Message>([^<]+)<\/Message>/)?.[1] ?? res.statusText;
            throw new Error(`${code}: ${msg}`);
          }

          results.push({
            name: file.name,
            url: buildUrl(folder, file.name),
            size: file.size,
          });

          setProgress(Math.round(((i + 1) / fileArr.length) * 100));
        } catch (err) {
          console.error(err);
          toast({
            title: `Failed to upload ${file.name}`,
            description: String(err),
            variant: "destructive",
          });
        }
      }

      setUploads((prev) => [...results, ...prev]);
      setState(results.length > 0 ? "done" : "error");
      setTimeout(() => setState("idle"), 2000);

      if (results.length > 0) {
        toast({
          title: `${results.length} file${results.length > 1 ? "s" : ""} uploaded`,
          description: "Click the URL to copy it",
        });
      }
    },
    [folder, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          S3 Image Uploader
        </CardTitle>
        <CardDescription>
          Upload images to{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">{BUCKET}</code>{" "}
          bucket ({REGION})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Folder input */}
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="S3 folder path (e.g. Lashis images)"
            className="font-mono text-sm"
          />
        </div>

        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />

          {state === "uploading" ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-medium">Uploading… {progress}%</p>
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : state === "done" ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <Check className="w-10 h-10" />
              <p className="font-medium">Upload complete</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Upload className="w-10 h-10" />
              <div>
                <p className="font-medium text-foreground">
                  Drag & drop images here
                </p>
                <p className="text-sm mt-1">or click to browse</p>
              </div>
              <p className="text-xs">JPG, PNG, GIF, WEBP supported</p>
            </div>
          )}
        </div>

        {/* Uploaded files list */}
        {uploads.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Uploaded Images ({uploads.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7"
                onClick={() => setUploads([])}
              >
                Clear list
              </Button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {uploads.map((file) => (
                <div
                  key={file.url}
                  className="flex items-center gap-3 border border-border rounded-lg p-3 bg-muted/20 group"
                >
                  {/* Thumbnail */}
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded-md shrink-0 border border-border"
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).style.display =
                        "none")
                    }
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {file.url}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  {/* Copy button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={() => copyToClipboard(file.url)}
                    title="Copy URL"
                  >
                    {copied === file.url ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>

                  {/* Remove from list */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setUploads((prev) =>
                        prev.filter((u) => u.url !== file.url)
                      )
                    }
                    title="Remove from list"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credentials note */}
        {(!import.meta.env.VITE_AWS_ACCESS_KEY_ID ||
          !import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">⚠️ AWS credentials not configured</p>
            <p className="font-mono text-xs">
              Add to your <strong>.env</strong> file:
            </p>
            <pre className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900 p-2 rounded">
{`Lollypop S3 Upload Example`}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
