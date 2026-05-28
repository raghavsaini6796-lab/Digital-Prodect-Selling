/**
 * Content Engine — AI Prompt Builders
 *
 * Each function returns a fully-formed prompt string for the AI.
 * Keeping prompts isolated makes them easy to test, tune, and version.
 */

import type { ContentGenerationInput } from "@/types/instagram";

export function buildInstagramPrompt(input: ContentGenerationInput): string {
  const {
    productName,
    audience,
    tone,
    contentType,
    ctaStyle,
    platformGoal,
    additionalContext,
  } = input;

  const ctaInstruction = getCTAInstruction(ctaStyle);
  const goalInstruction = getGoalInstruction(platformGoal);
  const typeInstruction = getContentTypeInstruction(contentType);

  return `You are an expert Instagram marketing copywriter specializing in digital product sales.

TASK: Generate complete Instagram content for a digital product.

PRODUCT: ${productName}
TARGET AUDIENCE: ${audience}
TONE: ${tone}
CONTENT TYPE: ${contentType}
PLATFORM GOAL: ${platformGoal}
CTA STYLE: ${ctaStyle}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}

${goalInstruction}
${ctaInstruction}
${typeInstruction}

OUTPUT FORMAT (respond with valid JSON only, no markdown):
{
  "hook": "Attention-grabbing opening line (max 15 words)",
  "caption": "Full Instagram caption (150-300 words, emojis included)",
  "cta": "Call-to-action text (1-2 sentences)",
  "hashtags": ["hashtag1", "hashtag2", ...30 relevant hashtags without #],
  "carouselSlides": [
    { "slide": 1, "heading": "...", "body": "...", "visualNote": "..." }
  ],
  "reelScript": "Full reel script with timing notes if applicable",
  "storyIdeas": [
    { "slide": 1, "textOverlay": "...", "backgroundSuggestion": "...", "cta": "..." }
  ],
  "estimatedEngagement": "Brief prediction of engagement level",
  "bestPostTime": "Recommended posting time (e.g., Tuesday 7-9pm EST)"
}

RULES:
- Only populate fields relevant to the content type (${contentType})
- carouselSlides: populate only for Carousel type (5-7 slides)
- reelScript: populate only for Reel type
- storyIdeas: populate only for Story type (3 story slides)
- All other types: leave these arrays empty []
- Make the hook stop the scroll immediately
- Hashtags: mix of niche (10), medium (10), and broad (10) tags
- Do NOT include # symbol in hashtags array
- Respond with JSON only — no explanation, no markdown fences`;
}

function getCTAInstruction(style: ContentGenerationInput["ctaStyle"]): string {
  const map: Record<string, string> = {
    SoftCTA: "CTA STYLE: Gentle nudge — 'Check the link in bio for more details'",
    DirectCTA: "CTA STYLE: Direct sales push — 'Get it now, link in bio' — create urgency",
    EngagementCTA: "CTA STYLE: Engagement bait — 'Comment YES if you want this' or 'Tag a friend who needs this'",
    QuestionCTA: "CTA STYLE: Question-based — 'Which would you choose?' or 'Have you tried this?'",
    NoCTA: "CTA STYLE: No call to action — keep it organic and value-focused",
  };
  return map[style] ?? map.SoftCTA;
}

function getGoalInstruction(goal: ContentGenerationInput["platformGoal"]): string {
  const map: Record<string, string> = {
    SellProduct: "GOAL: Drive direct sales. Emphasize value, transformation, and urgency.",
    DriveTraffic: "GOAL: Get clicks to bio link. Tease content that makes them want more.",
    IncreaseFollowers: "GOAL: Grow audience. Create shareable, saveable content with broad appeal.",
    BuildAuthority: "GOAL: Position as an expert. Lead with insights and proof of expertise.",
    IncreaseEngagement: "GOAL: Maximize comments/saves/shares. Ask questions, create debate, spark emotion.",
    BuildEmailList: "GOAL: Collect email subscribers. Offer a freebie or lead magnet in CTA.",
  };
  return map[goal] ?? map.SellProduct;
}

function getContentTypeInstruction(type: ContentGenerationInput["contentType"]): string {
  const map: Record<string, string> = {
    Reel: "FORMAT: Write a compelling 30-60 second reel script. Include hook (0-3s), value (3-45s), CTA (45-60s). Add B-roll suggestions.",
    Carousel: "FORMAT: Create a 5-7 slide carousel. Slide 1 is the hook, slides 2-6 deliver value, last slide has CTA. Each slide max 3 lines.",
    Story: "FORMAT: Create 3 Instagram Story slides. Each slide has text overlay, visual suggestion, and optional CTA.",
    CTACaption: "FORMAT: Write a standalone caption optimized for saves and shares. Lead with hook, deliver value, end with CTA.",
    PromotionalPost: "FORMAT: Write a promotional caption with urgency and social proof. Include price/offer details naturally.",
    ProductLaunch: "FORMAT: Write an exciting launch announcement. Build anticipation, reveal features, drive immediate action.",
    Educational: "FORMAT: Write an educational caption with 3-5 key insights. Lead with a bold claim, back it up, end with actionable tip.",
  };
  return map[type] ?? map.CTACaption;
}
