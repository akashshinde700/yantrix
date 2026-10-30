import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content/store";
import { courseHeadline, findCourse } from "@/lib/seo";

/** Branded share card for each course page (WhatsApp, LinkedIn, X, Google Discover). */
export const alt = "Course at Yantrix Technology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const course = findCourse(content, slug);
  const { settings } = content;
  const title = course ? courseHeadline(content, course) : settings.name;
  const facts = course ? [course.duration, course.level, (course.modes ?? []).join(" & ")].filter(Boolean) : [];
  const icon = `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public/brand/yantrix-icon.png"))).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#f1f5f9",
          background:
            "radial-gradient(circle at 82% 30%, rgba(34,211,238,0.35), transparent 38%), radial-gradient(circle at 70% 85%, rgba(139,92,246,0.35), transparent 40%), linear-gradient(135deg, #02040c 0%, #070d22 55%, #0b1433 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={icon} width={72} height={72} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{settings.name}</span>
            <span style={{ fontSize: 18, color: "#67e8f9", letterSpacing: 4 }}>{settings.domain.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>{title}</span>
          {facts.length > 0 && (
            <div style={{ display: "flex", gap: 14 }}>
              {facts.map((f) => (
                <span
                  key={f}
                  style={{
                    fontSize: 24,
                    padding: "10px 22px",
                    borderRadius: 999,
                    border: "1px solid rgba(103,232,249,0.45)",
                    background: "rgba(34,211,238,0.12)",
                    color: "#cffafe",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <span style={{ fontSize: 22, color: "#a3b1cc" }}>
          {[settings.contact.city, "Online & classroom batches", "Placement assistance"].filter(Boolean).join("  ·  ")}
        </span>
      </div>
    ),
    size
  );
}
