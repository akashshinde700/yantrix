#!/usr/bin/env python3
"""Render one syllabus PDF per course from src/lib/content/curriculum.

Usage:  python3 scripts/build-syllabus-pdfs.py

The JSON file is the single source of truth for course outlines, so the PDF in
public/files/ never drifts from what the website shows. Re-run this whenever a
curriculum changes, then commit the regenerated PDFs.

Requires reportlab:  pip install reportlab
"""

from __future__ import annotations

import json
import pathlib

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/lib/content/curriculum/course-curriculum.json"
OUT_DIR = ROOT / "public/files"

TITLES = {
    "full-stack-development": "Full Stack Development",
    "web-development": "Web Development",
    "python-programming": "Python Programming",
    "java-programming": "Java Programming",
    "data-analytics": "Data Analytics",
    "digital-marketing": "Digital Marketing",
    "ui-ux-design": "UI / UX Design",
    "basic-computer-training": "Basic Computer Training",
}

NAVY = colors.HexColor("#0b1230")
CYBER = colors.HexColor("#38bdf8")
SLATE = colors.HexColor("#475569")


class SyllabusDoc(BaseDocTemplate):
    def __init__(self, filename: str, course: str, **kwargs):
        super().__init__(filename, pagesize=A4, **kwargs)
        self.course = course
        frame = Frame(18 * mm, 18 * mm, A4[0] - 36 * mm, A4[1] - 40 * mm, id="body")
        self.addPageTemplates(
            [PageTemplate(id="page", frames=[frame], onPage=self.decorate)]
        )

    def decorate(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, stroke=0, fill=1)
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 9)
        canvas.drawString(18 * mm, A4[1] - 8 * mm, "YANTRIX TECHNOLOGY")
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#c7d2fe"))
        canvas.drawRightString(A4[0] - 18 * mm, A4[1] - 8 * mm, self.course)
        canvas.setFillColor(SLATE)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(18 * mm, 10 * mm, "yantrixtechnology.com")
        canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Page {doc.page}")
        canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
        canvas.line(18 * mm, 13 * mm, A4[0] - 18 * mm, 13 * mm)
        canvas.restoreState()


def build(slug: str, modules: list[dict]) -> pathlib.Path:
    course = TITLES.get(slug, slug.replace("-", " ").title())
    lessons = sum(len(m["topics"]) for m in modules)
    out = OUT_DIR / f"{slug}-syllabus.pdf"

    doc = SyllabusDoc(str(out), course, title=f"{course} syllabus", author="Yantrix Technology")
    styles = getSampleStyleSheet()

    h1 = ParagraphStyle(
        "h1", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22,
        leading=26, textColor=NAVY, alignment=TA_LEFT, spaceAfter=2,
    )
    kicker = ParagraphStyle(
        "kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5,
        leading=11, textColor=CYBER, spaceBefore=0, spaceAfter=6,
    )
    intro = ParagraphStyle(
        "intro", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5,
        leading=14, textColor=SLATE, spaceAfter=4,
    )
    module = ParagraphStyle(
        "module", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.5,
        leading=14, textColor=NAVY, spaceBefore=7, spaceAfter=2,
    )
    lesson = ParagraphStyle(
        "lesson", parent=styles["Normal"], fontName="Helvetica", fontSize=9,
        leading=12.5, textColor=colors.HexColor("#1e293b"), leftIndent=5 * mm,
        bulletIndent=1 * mm, spaceAfter=0.5,
    )

    story = [
        Paragraph("COURSE SYLLABUS", kicker),
        Paragraph(course, h1),
        Spacer(1, 3),
        Paragraph(
            f"{len(modules)} modules &nbsp;|&nbsp; {lessons} sessions &nbsp;|&nbsp; "
            "live classes, recordings, assignments and placement support",
            intro,
        ),
        Spacer(1, 5),
    ]

    for index, item in enumerate(modules, start=1):
        head = f"{index:02d}. {item['title']}"
        if item.get("duration"):
            head += f"  <font size=8 color='#64748b'>({item['duration']})</font>"
        story.append(Paragraph(head, module))
        for topic in item["topics"]:
            story.append(Paragraph(topic, lesson, bulletText="•"))

    story.append(Spacer(1, 10))
    note = Table(
        [[Paragraph(
            "<b>Fees, batch dates and mode (online / classroom):</b> confirm the current "
            "numbers on the website or with the admissions team before enrolling. "
            "Yantrix Technology, Pune.",
            ParagraphStyle("note", parent=styles["Normal"], fontName="Helvetica",
                           fontSize=8.5, leading=12, textColor=SLATE),
        )]],
        colWidths=[A4[0] - 36 * mm],
    )
    note.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(note)

    doc.build(story)
    return out


def main() -> None:
    data = json.loads(SOURCE.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, modules in data.items():
        path = build(slug, modules)
        print(f"{path.relative_to(ROOT)}  ({path.stat().st_size // 1024} KB, {len(modules)} modules)")


if __name__ == "__main__":
    main()
