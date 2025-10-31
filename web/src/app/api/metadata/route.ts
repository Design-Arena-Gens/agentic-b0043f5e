import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  topic: z.string().min(3).max(180),
  keywords: z.string().optional(),
});

const tones = [
  "Ultimate Guide",
  "Quick Tips",
  "Step-by-Step Tutorial",
  "Deep Dive",
  "2024 Update",
] as const;

const sanitizeKeywordList = (keywords: string | undefined) => {
  if (!keywords) {
    return [];
  }

  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .slice(0, 10);
};

const buildTitle = (topic: string, keywords: string[]) => {
  const base = topic.trim();
  const tone = tones[Math.floor(Math.random() * tones.length)];

  const keyword = keywords[0];
  if (keyword && !base.toLowerCase().includes(keyword.toLowerCase())) {
    return `${base} – ${tone} for ${keyword}`;
  }

  return `${base} – ${tone}`;
};

const buildDescription = (topic: string, keywords: string[]) => {
  const headline = `In this video, we explore ${topic.toLowerCase()}.`;

  const takeaways = [
    `Learn how to apply ${topic.toLowerCase()} with actionable steps.`,
    `Discover modern strategies so you can implement ${topic.toLowerCase()} today.`,
    `Stay until the end for pro tips and resources you can instantly apply.`,
  ];

  const keywordLine =
    keywords.length > 0
      ? `Keywords: ${keywords.map((item) => `#${item.replace(/\s+/g, "")}`).join(" ")}`
      : "";

  return [headline, "", ...takeaways, "", keywordLine, "", "Subscribe for more weekly uploads!"]
    .filter((line) => line.trim().length > 0)
    .join("\n");
};

const buildTags = (topic: string, keywords: string[]) => {
  const topicFragments = topic
    .toLowerCase()
    .split(" ")
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 2);

  const combined = Array.from(new Set([...keywords.map((keyword) => keyword.toLowerCase()), ...topicFragments]));

  return combined.slice(0, 15);
};

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { topic, keywords } = requestSchema.parse(json);

    const keywordList = sanitizeKeywordList(keywords);
    const title = buildTitle(topic, keywordList);
    const description = buildDescription(topic, keywordList);
    const tags = buildTags(topic, keywordList);

    return NextResponse.json({
      title,
      description,
      tags,
    });
  } catch (error) {
    console.error("metadata generation error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request payload" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate metadata." },
      { status: 500 },
    );
  }
}
