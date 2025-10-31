"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type MetadataResponse = {
  title: string;
  description: string;
  tags: string[];
};

type UploadResponse = {
  videoId?: string;
  videoUrl?: string;
};

const privacyOptions = [
  { value: "public", label: "Public" },
  { value: "unlisted", label: "Unlisted" },
  { value: "private", label: "Private" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState("private");
  const [video, setVideo] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const videoPreview = useMemo(() => {
    if (!video) {
      return undefined;
    }

    return URL.createObjectURL(video);
  }, [video]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setVideo(null);
      return;
    }

    setVideo(file);
  };

  const handleGenerateMetadata = async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setStatusMessage("Generating metadata...");

    try {
      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          keywords,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to generate metadata");
      }

      const data = (await response.json()) as MetadataResponse;
      setTitle(data.title);
      setDescription(data.description);
      setTags(data.tags.join(", "));
      setStatusMessage("Metadata generated. Review and adjust before uploading.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error while generating metadata.",
      );
      setStatusMessage("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!video) {
      setErrorMessage("Select a video file before uploading.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("Uploading video to YouTube...");
    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("video", video);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("privacyStatus", privacyStatus);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setUploadResult({
        videoId: data.videoId,
        videoUrl: data.videoUrl,
      });
      setStatusMessage("Upload finished successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected upload error.");
      setStatusMessage("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Automation Studio for YouTube</h1>
          <p>Generate optimized metadata and upload videos directly to your channel.</p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.panel}>
          <h2>1. Prepare Metadata</h2>
          <form className={styles.metadataForm} onSubmit={(event) => event.preventDefault()}>
            <label className={styles.field}>
              <span>Video topic</span>
              <input
                type="text"
                placeholder="e.g. Productivity tips for remote teams"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Target keywords (comma separated)</span>
              <input
                type="text"
                placeholder="productivity, remote work, time management"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
              />
            </label>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleGenerateMetadata}
                disabled={isGenerating || topic.trim().length === 0}
                className={styles.button}
              >
                {isGenerating ? "Generating..." : "Generate metadata"}
              </button>
            </div>

            <label className={styles.field}>
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Catchy video title"
              />
            </label>

            <label className={styles.field}>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                placeholder="Compelling description, include call-to-actions and chapters."
              />
            </label>

            <label className={styles.field}>
              <span>Tags (comma separated)</span>
              <input
                type="text"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="productivity, remote, tutorial"
              />
            </label>
          </form>
        </section>

        <section className={styles.panel}>
          <h2>2. Upload Video</h2>
          <form className={styles.uploadForm} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Video file (MP4, MOV, AVI)</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
              />
            </label>

            {videoPreview ? (
              <video className={styles.preview} src={videoPreview} controls />
            ) : (
              <div className={styles.previewPlaceholder}>
                <span>No preview available</span>
              </div>
            )}

            <label className={styles.field}>
              <span>Privacy status</span>
              <select
                value={privacyStatus}
                onChange={(event) => setPrivacyStatus(event.target.value)}
              >
                {privacyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={isUploading} className={styles.button}>
              {isUploading ? "Uploading..." : "Upload to YouTube"}
            </button>
          </form>

          <div className={styles.status}>
            {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            {uploadResult?.videoUrl && (
              <p className={styles.success}>
                Video uploaded:{" "}
                <a href={uploadResult.videoUrl} target="_blank" rel="noreferrer">
                  {uploadResult.videoUrl}
                </a>
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          Configure Google OAuth credentials and refresh token in environment variables before
          attempting uploads.
        </p>
      </footer>
    </div>
  );
}
