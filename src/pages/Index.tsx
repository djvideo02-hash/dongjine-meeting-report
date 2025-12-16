import { useState } from "react";
import { Header } from "@/components/Header";
import { FileUploadZone, type UploadedFile } from "@/components/FileUploadZone";
import { ReportPreview } from "@/components/ReportPreview";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Download, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportToPDF } from "@/lib/pdfExport";
import type { ReportData } from "@/types/report";

export default function Index() {
  const [materialFiles, setMaterialFiles] = useState<UploadedFile[]>([]);
  const [transcriptFiles, setTranscriptFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async () => {
    if (materialFiles.length === 0 && transcriptFiles.length === 0) {
      toast.error("분석할 파일을 업로드해주세요");
      return;
    }

    setIsAnalyzing(true);
    toast.info("AI 분석을 시작합니다...");

    try {
      const materialContents = await Promise.all(
        materialFiles.map(async (f) => {
          try {
            if (f.name.endsWith('.txt') || f.name.endsWith('.md')) {
              const content = await readFileAsText(f.file);
              return { name: f.name, content };
            }
            return { name: f.name, content: `[${f.name} 파일이 첨부되었습니다.]` };
          } catch {
            return { name: f.name, content: `[${f.name} 파일을 읽을 수 없습니다]` };
          }
        })
      );

      let transcriptContent = "";
      if (transcriptFiles.length > 0) {
        try {
          transcriptContent = await readFileAsText(transcriptFiles[0].file);
        } catch {
          toast.error("녹취록 파일을 읽을 수 없습니다");
        }
      }

      const { data, error } = await supabase.functions.invoke("analyze-meeting", {
        body: { materialContents, transcriptContent },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.report) {
        setReportData(data.report);
        toast.success("회의록 생성이 완료되었습니다!");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "분석 중 오류가 발생했습니다");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReport = (updatedData: ReportData) => {
    setReportData(updatedData);
    toast.success("회의록이 저장되었습니다!");
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    await exportToPDF(reportData);
  };

  const totalFiles = materialFiles.length + transcriptFiles.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI 기반 스마트 회의록 생성
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            회의를 <span className="text-gradient-gold">인사이트</span>로
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            회의 자료와 녹취록 파일만 업로드하세요.
            <br />
            AI가 경영진 보고용 회의록을 자동으로 생성합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <FileText className="w-5 h-5 text-info" />
                </div>
                회의 자료 업로드
              </h2>
              <FileUploadZone
                title="발표 자료 첨부"
                description="TXT, PDF, PPT, Excel 등 회의에 사용된 문서"
                accept=".txt,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                files={materialFiles}
                onFilesChange={setMaterialFiles}
              />
            </div>

            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                회의 녹취록
              </h2>
              <FileUploadZone
                title="녹취록 텍스트 파일"
                description="TXT 파일 (녹음을 텍스트로 변환한 파일)"
                accept=".txt"
                icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                files={transcriptFiles}
                onFilesChange={setTranscriptFiles}
                multiple={false}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
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

              {reportData && !isEditing && (
                <Button variant="outline" size="xl" onClick={handleDownloadPDF} className="sm:w-auto">
                  <Download className="w-5 h-5" />
                  PDF 다운로드
                </Button>
              )}
            </div>

            {totalFiles > 0 && (
              <div className="text-sm text-muted-foreground text-center animate-fade-in">
                총 {totalFiles}개 파일 준비됨
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 lg:p-8 min-h-[600px] animate-slide-up overflow-y-auto max-h-[calc(100vh-200px)]" style={{ animationDelay: "400ms" }}>
            <ReportPreview 
              data={reportData} 
              isLoading={isAnalyzing} 
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onSave={handleSaveReport}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 MeetingMind. AI 기반 스마트 회의록 솔루션</p>
        </div>
      </footer>
    </div>
  );
}
