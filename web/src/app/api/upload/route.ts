import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "YOUTUBE_REFRESH_TOKEN",
];

const buildYoutubeClient = () => {
  const missing = requiredEnvVars.filter((variable) => !process.env[variable]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauthClient.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  return google.youtube({
    version: "v3",
    auth: oauthClient,
  });
};

const parseTags = (raw: string | null) =>
  raw
    ?.split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 15) ?? [];

export async function POST(request: NextRequest) {
  try {
    const youtube = buildYoutubeClient();
    const formData = await request.formData();

    const file = formData.get("video");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Video file is required." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    if (videoBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    const title = (formData.get("title") as string) || "Untitled Upload";
    const description = (formData.get("description") as string) || "";
    const privacyStatus = (formData.get("privacyStatus") as string) || "private";
    const tags = parseTags(formData.get("tags") as string | null);

    const uploadResponse = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags: tags.length > 0 ? tags : undefined,
          categoryId: "22",
        },
        status: {
          privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: file.type || "video/*",
        body: Readable.from(videoBuffer),
      },
    });

    const videoId = uploadResponse.data.id;

    return NextResponse.json({
      videoId,
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
    });
  } catch (error) {
    console.error("YouTube upload error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload video." },
      { status: 500 },
    );
  }
}
