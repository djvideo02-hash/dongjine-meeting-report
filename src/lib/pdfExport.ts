import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import type { ReportData } from "@/types/report";

export async function exportToPDF(reportData: ReportData): Promise<void> {
  toast.info("PDF 생성 중...");

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    padding: 40px;
    background: white;
    font-family: 'Noto Sans KR', sans-serif;
    color: #1a1a1a;
  `;

  const decisionsHtml = reportData.decisions && reportData.decisions.length > 0 ? `
    <h2>📋 주요 의사결정</h2>
    ${reportData.decisions.map((item) => `
      <div class="decision">
        <h3>${item.decision}</h3>
        <p><strong>근거:</strong> ${item.rationale}</p>
        <p><strong>예상 영향:</strong> ${item.impact}</p>
      </div>
    `).join('')}
  ` : '';

  const risksHtml = reportData.risks && reportData.risks.length > 0 ? `
    <h2>⚠️ 리스크 및 우려사항</h2>
    ${reportData.risks.map((item) => `
      <div class="risk">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">${item.risk}</h3>
          <span class="severity-${item.severity}">${item.severity}</span>
        </div>
        <p><strong>대응:</strong> ${item.mitigation}</p>
      </div>
    `).join('')}
  ` : '';

  const insightsHtml = reportData.keyInsights && reportData.keyInsights.length > 0 ? `
    <div class="insights">
      <h2>💡 핵심 인사이트</h2>
      <ul>
        ${reportData.keyInsights.map((insight) => `<li>${insight}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const nextStepsHtml = reportData.nextSteps ? `
    <div class="next-steps">
      <h2>🎯 향후 일정</h2>
      <p>${reportData.nextSteps}</p>
    </div>
  ` : '';

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
      * { font-family: 'Noto Sans KR', sans-serif; box-sizing: border-box; }
      .gold { color: #C9A227; }
      h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #1a1a1a; }
      h2 { font-size: 16px; font-weight: 600; margin: 24px 0 12px 0; color: #1a1a1a; }
      h3 { font-size: 13px; font-weight: 600; margin: 0 0 8px 0; color: #1a1a1a; }
      p { font-size: 12px; line-height: 1.6; margin: 0 0 8px 0; color: #333; }
      ul { margin: 0; padding-left: 20px; }
      li { font-size: 12px; line-height: 1.6; color: #333; margin-bottom: 4px; }
      .meta { font-size: 11px; color: #666; margin-bottom: 24px; }
      .section { margin-bottom: 20px; padding: 14px; background: #f8f8f8; border-radius: 8px; }
      .topic { margin-bottom: 14px; padding: 12px; background: #f0f0f0; border-radius: 6px; }
      .topic-num { color: #C9A227; font-weight: 600; margin-right: 8px; }
      .followup { padding: 10px; background: #fafafa; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #C9A227; }
      .followup-meta { font-size: 10px; color: #888; margin-top: 4px; }
      .header-bar { height: 4px; background: linear-gradient(90deg, #C9A227, #E5D188); margin-bottom: 24px; border-radius: 2px; }
      .footer { text-align: center; font-size: 9px; color: #aaa; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
      .decision { padding: 12px; background: #e8f4fd; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #3b82f6; }
      .risk { padding: 12px; background: #fef2f2; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #ef4444; }
      .insights { padding: 14px; background: #fffbeb; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #C9A227; }
      .insights h2 { margin-top: 0; }
      .next-steps { padding: 14px; background: #f0fdf4; border-radius: 8px; margin-bottom: 20px; }
      .next-steps h2 { margin-top: 0; }
      .severity-상 { background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
      .severity-중 { background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
      .severity-하 { background: #e5e7eb; color: #6b7280; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
      .priority { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; }
      .priority-상 { background: #fee2e2; color: #dc2626; }
      .priority-중 { background: #fef3c7; color: #d97706; }
      .priority-하 { background: #e5e7eb; color: #6b7280; }
    </style>
    
    <div class="header-bar"></div>
    <p class="gold" style="font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">경영진 보고서</p>
    <h1>${reportData.title}</h1>
    <p class="meta">📅 ${reportData.date} &nbsp;&nbsp;|&nbsp;&nbsp; 👥 ${reportData.participants.join(", ")}</p>
    
    <div class="section">
      <h2 style="margin-top: 0;">📋 요약</h2>
      <p>${reportData.summary}</p>
    </div>
    
    ${insightsHtml}
    
    <h2>📌 주요 논의 사항</h2>
    ${reportData.topics.map((topic, i) => `
      <div class="topic">
        <h3><span class="topic-num">0${i + 1}</span>${topic.title}</h3>
        <p style="margin: 0;">${topic.content}</p>
      </div>
    `).join('')}
    
    ${decisionsHtml}
    ${risksHtml}
    
    <h2>✅ 후속 조치 사항</h2>
    ${reportData.followUps.map((item, i) => `
      <div class="followup">
        <p style="margin: 0; font-weight: 500;">${i + 1}. ${item.task}${item.priority ? `<span class="priority priority-${item.priority}">${item.priority}</span>` : ''}</p>
        <p class="followup-meta">담당: ${item.assignee} &nbsp;|&nbsp; 기한: ${item.deadline}</p>
      </div>
    `).join('')}
    
    ${nextStepsHtml}
    
    <div class="footer">Generated by MeetingMind | AI 기반 스마트 회의록 솔루션</div>
  `;

  document.body.appendChild(container);
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

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
