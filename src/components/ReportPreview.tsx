import { FileText, Calendar, Users, Target, CheckCircle2, ArrowRight } from "lucide-react";

interface ReportData {
  title: string;
  date: string;
  participants: string[];
  summary: string;
  topics: { title: string; content: string }[];
  followUps: { task: string; assignee: string; deadline: string }[];
}

interface ReportPreviewProps {
  data: ReportData | null;
  isLoading?: boolean;
}

export function ReportPreview({ data, isLoading }: ReportPreviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-secondary rounded-lg w-3/4" />
        <div className="h-4 bg-secondary rounded w-1/2" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="p-6 rounded-full bg-secondary/50 mb-6">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          회의록 미리보기
        </h3>
        <p className="text-muted-foreground max-w-sm">
          파일을 업로드하고 AI 분석을 시작하면
          <br />
          여기에 결과가 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium uppercase tracking-wider">경영진 보고서</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
          {data.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{data.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{data.participants.join(", ")}</span>
          </div>
        </div>
      </div>

      <section className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-foreground">요약</h2>
        </div>
        <p className="text-foreground/90 leading-relaxed">{data.summary}</p>
      </section>

      <section>
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4 flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          주요 논의 사항
        </h2>
        <div className="space-y-4">
          {data.topics.map((topic, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all duration-300"
            >
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary font-mono text-sm">0{index + 1}</span>
                {topic.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {topic.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-gradient-gold rounded-xl p-6 bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-foreground">
            후속 조치 사항
          </h2>
        </div>
        <div className="space-y-3">
          {data.followUps.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.task}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>담당: {item.assignee}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span>기한: {item.deadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
