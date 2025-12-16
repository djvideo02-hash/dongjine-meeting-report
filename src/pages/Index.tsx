import { useState } from "react";
import { Header } from "@/components/Header";
import { FileUploadZone } from "@/components/FileUploadZone";
import { ReportPreview } from "@/components/ReportPreview";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Mic,
  Sparkles,
  Download,
  Loader2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

const mockReportData = {
  title: "2024년 4분기 전략 회의",
  date: "2024년 12월 16일",
  participants: ["김대표", "이사업부장", "박팀장", "최기획"],
  summary:
    "본 회의에서는 2024년 4분기 실적 점검 및 2025년 사업 전략 방향에 대해 논의하였습니다. 주요 사업부별 성과 분석 결과, 디지털 전환 부문에서 전년 대비 32% 성장을 달성하였으며, 신규 시장 진출을 위한 구체적인 실행 계획을 수립하였습니다.",
  topics: [
    {
      title: "4분기 실적 분석",
      content:
        "전체 매출 목표 대비 108% 달성. 특히 B2B 솔루션 부문에서 예상을 상회하는 성과를 기록. 해외 시장 매출 비중이 전년 동기 대비 15% 증가.",
    },
    {
      title: "2025년 전략 방향",
      content:
        "AI 기반 서비스 고도화 및 글로벌 시장 확대를 핵심 전략으로 설정. R&D 투자 20% 확대 및 전문 인력 충원 계획 승인.",
    },
    {
      title: "리스크 관리",
      content:
        "환율 변동 및 글로벌 경기 불확실성에 대비한 헤지 전략 검토. 공급망 다변화를 통한 안정성 확보 방안 논의.",
    },
  ],
  followUps: [
    {
      task: "2025년 사업계획서 최종안 작성",
      assignee: "이사업부장",
      deadline: "2024.12.23",
    },
    {
      task: "AI 솔루션 파트너십 제안서 검토",
      assignee: "박팀장",
      deadline: "2024.12.20",
    },
    {
      task: "글로벌 시장 진출 로드맵 수립",
      assignee: "최기획",
      deadline: "2024.12.27",
    },
  ],
};

export default function Index() {
  const [materialFiles, setMaterialFiles] = useState<UploadedFile[]>([]);
  const [audioFiles, setAudioFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<typeof mockReportData | null>(
    null
  );

  const handleAnalyze = async () => {
    if (materialFiles.length === 0 && audioFiles.length === 0) {
      toast.error("분석할 파일을 업로드해주세요");
      return;
    }

    setIsAnalyzing(true);
    toast.info("AI 분석을 시작합니다...");

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setReportData(mockReportData);
    setIsAnalyzing(false);
    toast.success("회의록 생성이 완료되었습니다!");
  };

  const handleDownloadPDF = () => {
    toast.success("PDF 다운로드를 시작합니다");
    // PDF generation will be implemented with backend
  };

  const totalFiles = materialFiles.length + audioFiles.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI 기반 스마트 회의록 생성
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            회의를 <span className="text-gradient-gold">인사이트</span>로
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            회의 자료와 녹음 파일만 업로드하세요.
            <br />
            AI가 경영진 보고용 회의록을 자동으로 생성합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Section */}
          <div className="space-y-6">
            <div
              className="glass-card rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <FileText className="w-5 h-5 text-info" />
                </div>
                회의 자료 업로드
              </h2>
              <FileUploadZone
                title="발표 자료 첨부"
                description="PPT, PDF, Excel 등 회의에 사용된 문서"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                files={materialFiles}
                onFilesChange={setMaterialFiles}
              />
            </div>

            <div
              className="glass-card rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                회의 녹음 파일
              </h2>
              <FileUploadZone
                title="음성 녹음 첨부"
                description="MP3, WAV, M4A 등 녹음 파일"
                accept=".mp3,.wav,.m4a,.ogg,.webm"
                icon={<Mic className="w-8 h-8 text-muted-foreground" />}
                files={audioFiles}
                onFilesChange={setAudioFiles}
                multiple={false}
              />
            </div>

            {/* Action Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                variant="gold"
                size="xl"
                className="flex-1"
                onClick={handleAnalyze}
                disabled={isAnalyzing || totalFiles === 0}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    회의록 생성하기
                  </>
                )}
              </Button>

              {reportData && (
                <Button
                  variant="outline"
                  size="xl"
                  onClick={handleDownloadPDF}
                  className="sm:w-auto"
                >
                  <Download className="w-5 h-5" />
                  PDF 다운로드
                </Button>
              )}
            </div>

            {/* Status */}
            {totalFiles > 0 && (
              <div className="text-sm text-muted-foreground text-center animate-fade-in">
                총 {totalFiles}개 파일 준비됨
              </div>
            )}
          </div>

          {/* Right Column - Preview Section */}
          <div
            className="glass-card rounded-2xl p-6 lg:p-8 min-h-[600px] animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <ReportPreview data={reportData} isLoading={isAnalyzing} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 MeetingMind. AI 기반 스마트 회의록 솔루션</p>
        </div>
      </footer>
    </div>
  );
}
