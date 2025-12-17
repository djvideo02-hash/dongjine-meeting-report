import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import type { ReportData } from "@/types/report";

async function renderSection(container: HTMLDivElement, html: string, styles: string): Promise<HTMLCanvasElement> {
  container.innerHTML = `<style>${styles}</style>${html}`;
  await new Promise(resolve => setTimeout(resolve, 100));
  return html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });
}

export async function exportToPDF(reportData: ReportData): Promise<void> {
  toast.info("PDF 생성 중...");

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;
  let currentY = margin;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 720px;
    padding: 0;
    background: white;
    font-family: 'Noto Sans KR', sans-serif;
    color: #1a1a1a;
  `;
  document.body.appendChild(container);
  await document.fonts.ready;

  const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
    * { font-family: 'Noto Sans KR', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
    .gold { color: #C9A227; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: #1a1a1a; }
    h2 { font-size: 14px; font-weight: 600; margin: 0 0 10px 0; color: #1a1a1a; }
    h3 { font-size: 12px; font-weight: 600; margin: 0 0 6px 0; color: #1a1a1a; }
    p { font-size: 11px; line-height: 1.5; margin: 0; color: #333; }
    ul { margin: 0; padding-left: 16px; }
    li { font-size: 11px; line-height: 1.5; color: #333; margin-bottom: 3px; }
    .wrapper { padding: 16px; }
    .section { padding: 12px; background: #f8f8f8; border-radius: 6px; }
    .topic { padding: 10px; background: #f0f0f0; border-radius: 5px; margin-bottom: 8px; }
    .topic:last-child { margin-bottom: 0; }
    .topic-num { color: #C9A227; font-weight: 600; margin-right: 6px; }
    .followup { padding: 8px 10px; background: #fafafa; border-radius: 5px; margin-bottom: 6px; border-left: 3px solid #C9A227; }
    .followup:last-child { margin-bottom: 0; }
    .followup-meta { font-size: 9px; color: #888; margin-top: 3px; }
    .decision { padding: 10px; background: #e8f4fd; border-radius: 5px; margin-bottom: 8px; border-left: 3px solid #3b82f6; }
    .decision:last-child { margin-bottom: 0; }
    .risk { padding: 10px; background: #fef2f2; border-radius: 5px; margin-bottom: 8px; border-left: 3px solid #ef4444; }
    .risk:last-child { margin-bottom: 0; }
    .insights { padding: 12px; background: #fffbeb; border-radius: 6px; border-left: 4px solid #C9A227; }
    .next-steps { padding: 12px; background: #f0fdf4; border-radius: 6px; }
    .severity-상 { background: #fee2e2; color: #dc2626; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
    .severity-중 { background: #fef3c7; color: #d97706; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
    .severity-하 { background: #e5e7eb; color: #6b7280; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
    .priority { font-size: 9px; padding: 1px 5px; border-radius: 3px; margin-left: 6px; }
    .priority-상 { background: #fee2e2; color: #dc2626; }
    .priority-중 { background: #fef3c7; color: #d97706; }
    .priority-하 { background: #e5e7eb; color: #6b7280; }
    .header-bar { height: 3px; background: linear-gradient(90deg, #C9A227, #E5D188); margin-bottom: 16px; border-radius: 2px; }
    .meta { font-size: 10px; color: #666; }
    .footer { text-align: center; font-size: 8px; color: #aaa; padding-top: 12px; border-top: 1px solid #eee; }
  `;

  const addCanvasToPdf = async (canvas: HTMLCanvasElement): Promise<void> => {
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Check if section fits on current page
    if (currentY + imgHeight > pdfHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 3;
  };

  try {
    // Header section
    const headerHtml = `
      <div class="wrapper">
        <div class="header-bar"></div>
        <p class="gold" style="font-size: 10px; font-weight: 600; letter-spacing: 1px; margin-bottom: 6px;">경영진 보고서</p>
        <h1>${reportData.title}</h1>
        <p class="meta">📅 ${reportData.date} &nbsp;&nbsp;|&nbsp;&nbsp; 👥 ${reportData.participants.join(", ")}</p>
      </div>
    `;
    await addCanvasToPdf(await renderSection(container, headerHtml, baseStyles));

    // Meeting Purpose section
    if (reportData.meetingPurpose && reportData.meetingPurpose.length > 0) {
      const purposeHtml = `
        <div class="wrapper">
          <div class="section" style="border-left: 4px solid #3b82f6;">
            <h2>🎯 회의 목적</h2>
            <ul style="margin-top: 8px;">
              ${reportData.meetingPurpose.map((purpose) => `<li>${purpose}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, purposeHtml, baseStyles));
    }

    // Summary section
    const summaryHtml = `
      <div class="wrapper">
        <div class="section">
          <h2>📋 요약</h2>
          <p style="margin-top: 8px;">${reportData.summary}</p>
        </div>
      </div>
    `;
    await addCanvasToPdf(await renderSection(container, summaryHtml, baseStyles));

    // Key Insights section
    if (reportData.keyInsights && reportData.keyInsights.length > 0) {
      const insightsHtml = `
        <div class="wrapper">
          <div class="insights">
            <h2>💡 핵심 인사이트</h2>
            <ul style="margin-top: 8px;">
              ${reportData.keyInsights.map((insight) => `<li>${insight}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, insightsHtml, baseStyles));
    }

    // Topics - render each topic individually to avoid page breaks in the middle
    const topicsHeaderHtml = `
      <div class="wrapper">
        <h2>📌 주요 논의 사항</h2>
      </div>
    `;
    await addCanvasToPdf(await renderSection(container, topicsHeaderHtml, baseStyles));

    for (let i = 0; i < reportData.topics.length; i++) {
      const topic = reportData.topics[i];
      const subItemsHtml = topic.subItems && topic.subItems.length > 0
        ? `<ul style="margin-top: 8px; margin-left: 8px;">${topic.subItems.map((sub) => `<li style="color: #666;">- ${sub}</li>`).join('')}</ul>`
        : '';
      const topicHtml = `
        <div class="wrapper">
          <div class="topic">
            <h3><span class="topic-num">${String(i + 1).padStart(2, '0')}</span>${topic.title}</h3>
            <p style="white-space: pre-wrap;">${topic.content}</p>
            ${subItemsHtml}
          </div>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, topicHtml, baseStyles));
    }

    // Decisions section
    if (reportData.decisions && reportData.decisions.length > 0) {
      const decisionsHeaderHtml = `
        <div class="wrapper">
          <h2>📋 주요 의사결정</h2>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, decisionsHeaderHtml, baseStyles));

      for (const item of reportData.decisions) {
        const decisionHtml = `
          <div class="wrapper">
            <div class="decision">
              <h3>${item.decision}</h3>
              <p><strong>근거:</strong> ${item.rationale}</p>
              <p style="margin-top: 4px;"><strong>예상 영향:</strong> ${item.impact}</p>
            </div>
          </div>
        `;
        await addCanvasToPdf(await renderSection(container, decisionHtml, baseStyles));
      }
    }

    // Risks section
    if (reportData.risks && reportData.risks.length > 0) {
      const risksHeaderHtml = `
        <div class="wrapper">
          <h2>⚠️ 리스크 및 우려사항</h2>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, risksHeaderHtml, baseStyles));

      for (const item of reportData.risks) {
        const riskHtml = `
          <div class="wrapper">
            <div class="risk">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <h3 style="margin: 0;">${item.risk}</h3>
                <span class="severity-${item.severity}">${item.severity}</span>
              </div>
              <p><strong>대응:</strong> ${item.mitigation}</p>
            </div>
          </div>
        `;
        await addCanvasToPdf(await renderSection(container, riskHtml, baseStyles));
      }
    }

    // Follow-ups section
    const followupsHeaderHtml = `
      <div class="wrapper">
        <h2>✅ 후속 조치 사항</h2>
      </div>
    `;
    await addCanvasToPdf(await renderSection(container, followupsHeaderHtml, baseStyles));

    for (let i = 0; i < reportData.followUps.length; i++) {
      const item = reportData.followUps[i];
      const followupHtml = `
        <div class="wrapper">
          <div class="followup">
            <p style="font-weight: 500;">${i + 1}. ${item.task}${item.priority ? `<span class="priority priority-${item.priority}">${item.priority}</span>` : ''}</p>
            <p class="followup-meta">담당: ${item.assignee} &nbsp;|&nbsp; 기한: ${item.deadline}</p>
          </div>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, followupHtml, baseStyles));
    }

    // Next Steps section
    if (reportData.nextSteps) {
      const nextStepsHtml = `
        <div class="wrapper">
          <div class="next-steps">
            <h2>🎯 향후 일정</h2>
            <p style="margin-top: 8px;">${reportData.nextSteps}</p>
          </div>
        </div>
      `;
      await addCanvasToPdf(await renderSection(container, nextStepsHtml, baseStyles));
    }

    // Footer
    const footerHtml = `
      <div class="wrapper">
        <div class="footer">Generated by MeetingMind | AI 기반 스마트 회의록 솔루션</div>
      </div>
    `;
    await addCanvasToPdf(await renderSection(container, footerHtml, baseStyles));

    const fileName = `회의록-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    toast.success("PDF 다운로드 완료!");
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error("PDF 생성 중 오류가 발생했습니다");
  } finally {
    document.body.removeChild(container);
  }
}
