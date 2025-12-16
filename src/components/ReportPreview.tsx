import { useState } from "react";
import { FileText, Calendar, Users, Target, CheckCircle2, ArrowRight, AlertTriangle, Lightbulb, Flag, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ReportData } from "@/types/report";

interface ReportPreviewProps {
  data: ReportData | null;
  isLoading?: boolean;
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: (data: ReportData) => void;
}

export function ReportPreview({ data, isLoading, isEditing, onEditToggle, onSave }: ReportPreviewProps) {
  const [editData, setEditData] = useState<ReportData | null>(null);

  const startEditing = () => {
    if (data) {
      setEditData(JSON.parse(JSON.stringify(data)));
      onEditToggle?.();
    }
  };

  const cancelEditing = () => {
    setEditData(null);
    onEditToggle?.();
  };

  const saveChanges = () => {
    if (editData) {
      onSave?.(editData);
      setEditData(null);
      onEditToggle?.();
    }
  };

  const currentData = isEditing && editData ? editData : data;

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

  if (!currentData) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="p-6 rounded-full bg-secondary/50 mb-6">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">회의록 미리보기</h3>
        <p className="text-muted-foreground max-w-sm">
          파일을 업로드하고 AI 분석을 시작하면
          <br />
          여기에 결과가 표시됩니다
        </p>
      </div>
    );
  }

  const updateField = (field: keyof ReportData, value: any) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const updateArrayItem = (field: keyof ReportData, index: number, key: string, value: string) => {
    if (editData) {
      const arr = [...(editData[field] as any[])];
      arr[index] = { ...arr[index], [key]: value };
      setEditData({ ...editData, [field]: arr });
    }
  };

  const addArrayItem = (field: keyof ReportData, template: any) => {
    if (editData) {
      const arr = [...(editData[field] as any[] || []), template];
      setEditData({ ...editData, [field]: arr });
    }
  };

  const removeArrayItem = (field: keyof ReportData, index: number) => {
    if (editData) {
      const arr = [...(editData[field] as any[])];
      arr.splice(index, 1);
      setEditData({ ...editData, [field]: arr });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Edit Controls */}
      {data && (
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-1" />
                취소
              </Button>
              <Button variant="gold" size="sm" onClick={saveChanges}>
                <Save className="w-4 h-4 mr-1" />
                저장
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Edit2 className="w-4 h-4 mr-1" />
              수정
            </Button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium uppercase tracking-wider">경영진 보고서</span>
        </div>
        {isEditing ? (
          <Input
            value={editData?.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="text-2xl font-serif font-bold mb-4"
          />
        ) : (
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">{currentData.title}</h1>
        )}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isEditing ? (
              <Input
                value={editData?.date || ""}
                onChange={(e) => updateField("date", e.target.value)}
                className="w-40 h-8"
              />
            ) : (
              <span>{currentData.date}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {isEditing ? (
              <Input
                value={editData?.participants?.join(", ") || ""}
                onChange={(e) => updateField("participants", e.target.value.split(", "))}
                className="w-60 h-8"
                placeholder="참석자1, 참석자2"
              />
            ) : (
              <span>{currentData.participants.join(", ")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <section className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-foreground">요약</h2>
        </div>
        {isEditing ? (
          <Textarea
            value={editData?.summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            rows={4}
          />
        ) : (
          <p className="text-foreground/90 leading-relaxed">{currentData.summary}</p>
        )}
      </section>

      {/* Key Insights */}
      {(currentData.keyInsights && currentData.keyInsights.length > 0 || isEditing) && (
        <section className="glass-card rounded-xl p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-foreground">핵심 인사이트</h2>
            </div>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={() => addArrayItem("keyInsights", "")}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <ul className="space-y-2">
            {(editData?.keyInsights || currentData.keyInsights || []).map((insight, index) => (
              <li key={index} className="flex items-start gap-3 text-foreground/90">
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={insight}
                      onChange={(e) => {
                        const arr = [...(editData?.keyInsights || [])];
                        arr[index] = e.target.value;
                        updateField("keyInsights", arr);
                      }}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("keyInsights", index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-primary font-bold">•</span>
                    <span>{insight}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full" />
            주요 논의 사항
          </h2>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={() => addArrayItem("topics", { title: "", content: "" })}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {currentData.topics.map((topic, index) => (
            <div key={index} className="p-5 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all duration-300">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={editData?.topics[index]?.title || ""}
                      onChange={(e) => updateArrayItem("topics", index, "title", e.target.value)}
                      placeholder="제목"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("topics", index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    value={editData?.topics[index]?.content || ""}
                    onChange={(e) => updateArrayItem("topics", index, "content", e.target.value)}
                    placeholder="내용"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-primary font-mono text-sm">0{index + 1}</span>
                    {topic.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{topic.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Decisions */}
      {(currentData.decisions && currentData.decisions.length > 0 || isEditing) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-3">
              <div className="w-1 h-6 bg-info rounded-full" />
              주요 의사결정
            </h2>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={() => addArrayItem("decisions", { decision: "", rationale: "", impact: "" })}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {(editData?.decisions || currentData.decisions || []).map((item, index) => (
              <div key={index} className="p-5 rounded-xl bg-info/5 border border-info/20">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={(editData?.decisions || [])[index]?.decision || ""}
                        onChange={(e) => updateArrayItem("decisions", index, "decision", e.target.value)}
                        placeholder="결정 사항"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeArrayItem("decisions", index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={(editData?.decisions || [])[index]?.rationale || ""}
                      onChange={(e) => updateArrayItem("decisions", index, "rationale", e.target.value)}
                      placeholder="결정 근거"
                    />
                    <Input
                      value={(editData?.decisions || [])[index]?.impact || ""}
                      onChange={(e) => updateArrayItem("decisions", index, "impact", e.target.value)}
                      placeholder="예상 영향"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-foreground mb-2">{item.decision}</h3>
                    <p className="text-sm text-muted-foreground mb-1"><strong>근거:</strong> {item.rationale}</p>
                    <p className="text-sm text-muted-foreground"><strong>예상 영향:</strong> {item.impact}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risks */}
      {(currentData.risks && currentData.risks.length > 0 || isEditing) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              리스크 및 우려사항
            </h2>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={() => addArrayItem("risks", { risk: "", severity: "중", mitigation: "" })}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {(editData?.risks || currentData.risks || []).map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={(editData?.risks || [])[index]?.risk || ""}
                        onChange={(e) => updateArrayItem("risks", index, "risk", e.target.value)}
                        placeholder="리스크"
                        className="flex-1"
                      />
                      <select
                        value={(editData?.risks || [])[index]?.severity || "중"}
                        onChange={(e) => updateArrayItem("risks", index, "severity", e.target.value)}
                        className="px-3 py-2 rounded border bg-background"
                      >
                        <option value="상">상</option>
                        <option value="중">중</option>
                        <option value="하">하</option>
                      </select>
                      <Button variant="ghost" size="sm" onClick={() => removeArrayItem("risks", index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={(editData?.risks || [])[index]?.mitigation || ""}
                      onChange={(e) => updateArrayItem("risks", index, "mitigation", e.target.value)}
                      placeholder="대응 방안"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{item.risk}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${item.severity === "상" ? "bg-destructive/20 text-destructive" : item.severity === "중" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground"><strong>대응:</strong> {item.mitigation}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Follow Ups */}
      <section className="border-gradient-gold rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-foreground">후속 조치 사항</h2>
          </div>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={() => addArrayItem("followUps", { task: "", assignee: "미정", deadline: "미정", priority: "중" })}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {currentData.followUps.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={editData?.followUps[index]?.task || ""}
                      onChange={(e) => updateArrayItem("followUps", index, "task", e.target.value)}
                      placeholder="조치 사항"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem("followUps", index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={editData?.followUps[index]?.assignee || ""}
                      onChange={(e) => updateArrayItem("followUps", index, "assignee", e.target.value)}
                      placeholder="담당자"
                    />
                    <Input
                      value={editData?.followUps[index]?.deadline || ""}
                      onChange={(e) => updateArrayItem("followUps", index, "deadline", e.target.value)}
                      placeholder="기한"
                    />
                    <select
                      value={editData?.followUps[index]?.priority || "중"}
                      onChange={(e) => updateArrayItem("followUps", index, "priority", e.target.value)}
                      className="px-3 py-2 rounded border bg-background"
                    >
                      <option value="상">상</option>
                      <option value="중">중</option>
                      <option value="하">하</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.task}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>담당: {item.assignee}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>기한: {item.deadline}</span>
                      {item.priority && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          <span className={`px-2 py-0.5 rounded ${item.priority === "상" ? "bg-destructive/20 text-destructive" : item.priority === "중" ? "bg-warning/20 text-warning" : "bg-muted"}`}>
                            {item.priority}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      {(currentData.nextSteps || isEditing) && (
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-foreground">향후 일정</h2>
          </div>
          {isEditing ? (
            <Textarea
              value={editData?.nextSteps || ""}
              onChange={(e) => updateField("nextSteps", e.target.value)}
              rows={3}
              placeholder="향후 일정 및 다음 단계"
            />
          ) : (
            <p className="text-foreground/90 leading-relaxed">{currentData.nextSteps}</p>
          )}
        </section>
      )}
    </div>
  );
}
