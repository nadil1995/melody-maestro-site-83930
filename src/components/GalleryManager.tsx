import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, X, Loader2, Plus, Trash2, Star, Images,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type GalleryImage = { src: string; alt: string };
type GalleryGroup = { topic: string; thumbnail: string; images: GalleryImage[] };

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";
const FOLDER = import.meta.env.VITE_S3_FOLDER || "Lashis images";
const CONFIG_KEY = "gallery-config.json";
const CONFIG_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${CONFIG_KEY}`;

const DEFAULT_GROUPS: GalleryGroup[] = [
  {
    topic: "Gustav Mahler Orchestra Sri Lanka",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/IMG_8993.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/IMG_8993.jpg", alt: "Flute Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/8996.jpg", alt: "Musical Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/89972.jpg", alt: "Concert Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8998.jpg", alt: "Concert Performance" },
    ],
  },
  {
    topic: "Colombo Wind Orchestra",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8999.jpg",
    images: [{ src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8999.jpg", alt: "Wind Orchestra Performance" }],
  },
  {
    topic: "Bank of Ceylon London Branch 75th Anniversary",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9001.jpg",
    images: [{ src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9001.jpg", alt: "Stage Performance" }],
  },
  {
    topic: "Candlelight Solo Performance",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9002.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9002.jpg", alt: "Flute Solo" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/o9003%202.jpg", alt: "Concert Moment" },
    ],
  },
  {
    topic: "Pawan Podak Concert",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9005.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9005.jpg", alt: "Stage Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9006.jpg", alt: "Stage Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9007.jpg", alt: "Stage Performance" },
    ],
  },
  {
    topic: "Miyuru Gee Dahana - Glasgow Concert",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/fb1378b6-38e6-4d8a-a2df-b15946afb5e4.JPG",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/fb1378b6-38e6-4d8a-a2df-b15946afb5e4.JPG", alt: "Glasgow Concert" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9392.JPG", alt: "Glasgow Concert" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9393.JPG", alt: "Glasgow Concert" },
    ],
  },
  {
    topic: "Hadha Randhi Miyuru Gee Suyamaya - High Wycombe",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9394.JPG",
    images: [{ src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9394.JPG", alt: "High Wycombe Concert" }],
  },
];

function buildS3Client() {
  return new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
    // Disable auto-checksum: SDK v3 calculates CRC32 at sign time before
    // file content is known, producing a wrong checksum → S3 400.
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  });
}

function buildUrl(filename: string) {
  const key = `${FOLDER}/${filename}`;
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function loadConfig(): Promise<GalleryGroup[] | null> {
  try {
    const res = await fetch(`${CONFIG_URL}?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function putViaPresignedUrl(key: string, body: Blob | File, contentType: string) {
  const client = buildS3Client();
  // ContentType intentionally excluded from signed command — signing it causes
  // S3 signature failures when the browser adjusts headers during CORS preflight.
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 }
  );
  const res = await fetch(url, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const code = text.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? res.status;
    const msg  = text.match(/<Message>([^<]+)<\/Message>/)?.[1] ?? res.statusText;
    throw new Error(`${code}: ${msg}`);
  }
}

async function saveConfig(groups: GalleryGroup[]) {
  const json = JSON.stringify(groups, null, 2);
  await putViaPresignedUrl(CONFIG_KEY, new Blob([json], { type: "application/json" }), "application/json");
}

async function uploadImage(file: File): Promise<string> {
  await putViaPresignedUrl(`${FOLDER}/${file.name}`, file, file.type);
  return buildUrl(file.name);
}

export default function GalleryManager() {
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Form
  const [topicMode, setTopicMode] = useState<"existing" | "new">("existing");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [altText, setAltText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig().then((data) => {
      setGroups(data && data.length > 0 ? data : DEFAULT_GROUPS);
      setLoading(false);
    });
  }, []);

  const topicName = topicMode === "new" ? newTopicName.trim() : selectedTopic;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const imgs = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imgs]);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const imgs = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imgs]);
    e.target.value = "";
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (!topicName) {
      toast({ title: "Enter a topic name", variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: "Select at least one image", variant: "destructive" });
      return;
    }

    setSaving(true);
    setProgress(0);

    const uploaded: GalleryImage[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImage(files[i]);
        uploaded.push({ src: url, alt: altText.trim() || topicName });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        toast({ title: `Failed: ${files[i].name}`, description: String(err), variant: "destructive" });
      }
    }

    if (uploaded.length === 0) { setSaving(false); return; }

    const updated = [...groups];
    const idx = updated.findIndex((g) => g.topic === topicName);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], images: [...updated[idx].images, ...uploaded] };
    } else {
      updated.push({ topic: topicName, thumbnail: uploaded[0].src, images: uploaded });
    }

    try {
      await saveConfig(updated);
      setGroups(updated);
      setFiles([]);
      setNewTopicName("");
      setAltText("");
      setExpandedTopics((prev) => new Set([...prev, topicName]));
      toast({ title: `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added to "${topicName}"` });
    } catch (err) {
      toast({ title: "Failed to save gallery config", description: String(err), variant: "destructive" });
    }

    setSaving(false);
  };

  const deleteTopic = async (topic: string) => {
    if (!window.confirm(`Delete entire topic "${topic}" and all its images from the gallery? (Images remain on S3)`)) return;
    const updated = groups.filter((g) => g.topic !== topic);
    await saveConfig(updated);
    setGroups(updated);
    toast({ title: `Topic "${topic}" removed` });
  };

  const deleteImage = async (topicIdx: number, imgIdx: number) => {
    const updated = groups.map((g, i) => {
      if (i !== topicIdx) return g;
      const images = g.images.filter((_, j) => j !== imgIdx);
      return { ...g, images, thumbnail: images[0]?.src ?? g.thumbnail };
    });
    await saveConfig(updated);
    setGroups(updated);
  };

  const setThumbnail = async (topicIdx: number, imgIdx: number) => {
    const updated = groups.map((g, i) =>
      i === topicIdx ? { ...g, thumbnail: g.images[imgIdx].src } : g
    );
    await saveConfig(updated);
    setGroups(updated);
    toast({ title: "Cover image updated" });
  };

  const toggleExpanded = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });
  };

  const pushDefaults = async () => {
    if (!window.confirm("This will overwrite the current gallery config on S3 with the default data. Continue?")) return;
    await saveConfig(DEFAULT_GROUPS);
    setGroups(DEFAULT_GROUPS);
    toast({ title: "Gallery reset to defaults and saved to S3" });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading gallery config…</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Images Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Images to Gallery
          </CardTitle>
          <CardDescription>Upload images and assign them to a gallery topic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Topic selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Gallery Topic</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTopicMode("existing")}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  topicMode === "existing"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                Existing Topic
              </button>
              <button
                onClick={() => setTopicMode("new")}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  topicMode === "new"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                + New Topic
              </button>
            </div>

            {topicMode === "existing" ? (
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">— Select a topic —</option>
                {groups.map((g) => (
                  <option key={g.topic} value={g.topic}>
                    {g.topic} ({g.images.length} photo{g.images.length !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                placeholder="e.g. GMS Concert 2024"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
            )}
          </div>

          {/* Alt text */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Alt Text <span className="text-muted-foreground font-normal">(optional — defaults to topic name)</span>
            </label>
            <Input
              placeholder="Short description for accessibility"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Drag & drop images or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP, GIF</p>
          </div>

          {/* Selected files preview */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{f.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {saving && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={saving || files.length === 0 || !topicName} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {saving ? "Uploading & Saving…" : `Upload ${files.length > 0 ? files.length + " image" + (files.length > 1 ? "s" : "") : "Images"} to Gallery`}
          </Button>
        </CardContent>
      </Card>

      {/* Topics list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Images className="w-5 h-5" />
                Current Gallery ({groups.length} topics)
              </CardTitle>
              <CardDescription>Manage topics and images shown on the Gallery page</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={pushDefaults} title="Reset to hardcoded defaults">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.length === 0 && (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <p>No gallery topics yet. Add images above to get started.</p>
            </div>
          )}

          {groups.map((group, topicIdx) => {
            const expanded = expandedTopics.has(group.topic);
            return (
              <div key={group.topic} className="border border-border rounded-xl overflow-hidden">
                {/* Topic header */}
                <div className="flex items-center gap-3 p-4 bg-muted/20">
                  <img
                    src={group.thumbnail}
                    alt={group.topic}
                    className="w-12 h-12 object-cover rounded-lg border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{group.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.images.length} photo{group.images.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => toggleExpanded(group.topic)}
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      onClick={() => deleteTopic(group.topic)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Images grid */}
                {expanded && (
                  <div className="p-4 border-t border-border">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {group.images.map((img, imgIdx) => (
                        <div key={img.src} className="relative group">
                          <div className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            group.thumbnail === img.src ? "border-primary" : "border-border"
                          }`}>
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Cover badge */}
                          {group.thumbnail === img.src && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded text-[10px] px-1 py-0.5 font-medium leading-none">
                              Cover
                            </div>
                          )}

                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            {group.thumbnail !== img.src && (
                              <button
                                title="Set as cover"
                                onClick={() => setThumbnail(topicIdx, imgIdx)}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"
                              >
                                <Star className="w-3.5 h-3.5 text-white" />
                              </button>
                            )}
                            <button
                              title="Remove from gallery"
                              onClick={() => deleteImage(topicIdx, imgIdx)}
                              className="w-7 h-7 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>

                          <p className="text-[10px] text-muted-foreground mt-1 truncate">{img.alt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
