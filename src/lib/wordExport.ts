import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import type { ReportData } from "@/types/report";

export async function exportToWord(data: ReportData): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.title, bold: true, size: 36 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date and Participants
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `날짜: ${data.date}`, size: 22 }),
        new TextRun({ text: "  |  ", size: 22 }),
        new TextRun({ text: `참석자: ${data.participants.join(", ")}`, size: 22 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Summary
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "요약", bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.summary, size: 22 })],
      spacing: { after: 300 },
    })
  );

  // Key Insights
  if (data.keyInsights && data.keyInsights.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "핵심 인사이트", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    data.keyInsights.forEach((insight) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${insight}`, size: 22 })],
          spacing: { after: 80 },
        })
      );
    });
  }

  // Topics
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "주요 논의 사항", bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
    })
  );
  data.topics.forEach((topic, index) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${index + 1}. ${topic.title}`, bold: true, size: 24 })],
        spacing: { before: 150, after: 50 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: topic.content, size: 22 })],
        spacing: { after: 150 },
      })
    );
  });

  // Decisions
  if (data.decisions && data.decisions.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "주요 의사결정", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    data.decisions.forEach((item) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${item.decision}`, bold: true, size: 22 })],
          spacing: { before: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `  근거: ${item.rationale}`, size: 20, italics: true })],
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `  예상 영향: ${item.impact}`, size: 20, italics: true })],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Risks
  if (data.risks && data.risks.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "리스크 및 우려사항", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    data.risks.forEach((item) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${item.risk}`, bold: true, size: 22 }),
            new TextRun({ text: ` [${item.severity}]`, size: 20 }),
          ],
          spacing: { before: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `  대응: ${item.mitigation}`, size: 20, italics: true })],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Follow Ups
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "후속 조치 사항", bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
    })
  );
  data.followUps.forEach((item) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${item.task}`, size: 22 }),
          new TextRun({ text: ` (담당: ${item.assignee}, 기한: ${item.deadline}, 우선순위: ${item.priority})`, size: 20, italics: true }),
        ],
        spacing: { after: 80 },
      })
    );
  });

  // Next Steps
  if (data.nextSteps) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "다음 단계", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.nextSteps, size: 22 })],
        spacing: { after: 300 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const today = new Date();
  const fileName = `meeting-report-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.docx`;
  saveAs(blob, fileName);
}
