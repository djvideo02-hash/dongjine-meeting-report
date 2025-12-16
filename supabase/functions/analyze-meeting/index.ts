import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialContents, transcriptContent } = await req.json();
    
    // Get current date in Korean format
    const today = new Date();
    const currentDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    
    console.log("Received material contents:", materialContents?.length || 0, "files");
    console.log("Received transcript:", transcriptContent ? "yes" : "no");
    console.log("Current date:", currentDate);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare context from uploaded files
    let context = "";
    
    if (materialContents && materialContents.length > 0) {
      context += "## 회의 자료 내용:\n\n";
      materialContents.forEach((material: { name: string; content: string }, index: number) => {
        context += `### 자료 ${index + 1}: ${material.name}\n${material.content}\n\n`;
      });
    }
    
    if (transcriptContent) {
      context += "## 회의 녹취록:\n\n" + transcriptContent + "\n\n";
    }

    const systemPrompt = `당신은 기업 CEO 및 경영진을 위한 전문 회의록 작성 비서입니다.
제공된 회의 자료와 녹취록을 분석하여 간결하고 명확한 경영진 보고서를 작성해주세요.

다음 JSON 형식으로만 응답하세요:
{
  "title": "회의 제목 (핵심 주제를 반영한 구체적인 제목)",
  "date": "${currentDate}",
  "participants": ["참석자1", "참석자2"],
  "summary": "회의 전체 요약 (핵심 결론 위주로 2-3문장)",
  "topics": [
    {
      "title": "주요 논의 사항 제목",
      "content": "핵심 내용만 간결하게 정리 (2-3문장). 중요한 수치나 결론 위주로 작성"
    }
  ],
  "decisions": [
    {
      "decision": "결정된 사항",
      "rationale": "결정 근거 (1문장)",
      "impact": "예상 효과 (1문장)"
    }
  ],
  "risks": [
    {
      "risk": "리스크 사항",
      "severity": "상/중/하",
      "mitigation": "대응 방안 (1문장)"
    }
  ],
  "keyInsights": [
    "핵심 인사이트 (1문장씩)"
  ],
  "followUps": [
    {
      "task": "후속 조치 사항",
      "assignee": "담당자",
      "deadline": "기한",
      "priority": "상/중/하"
    }
  ],
  "nextSteps": "다음 단계 (1-2문장)"
}

핵심 작성 지침:
1. **시간 정보 제외**: 녹취록의 타임스탬프(예: 46:15-53:42, 00:00 등)는 절대 포함하지 마세요.
2. **간결하게 작성**: 각 항목은 핵심만 담아 2-3문장 이내로 작성하세요.
3. **핵심 수치만 포함**: 중요한 숫자, 금액, 비율만 기재하세요.
4. **주요 논의사항**: 3-5개로 제한하고 각각 간결하게 정리하세요.
5. **참석자 미명시 시**: ["회의 참석자"]로 표시
6. **담당자/기한 미명시 시**: "미정"으로 표시
7. **리스크나 결정사항이 없는 경우**: 빈 배열 []로 표시`;

    const userPrompt = `다음 회의 내용을 분석하여 CEO 및 경영진을 위한 간결한 보고서를 작성해주세요.
시간 정보(타임스탬프)는 제외하고, 핵심 내용만 정리해주세요.

${context}`;

    console.log("Sending request to Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 설정에서 크레딧을 충전해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI Response received:", content?.substring(0, 200));

    // Parse JSON from response
    let reportData;
    try {
      // Extract JSON from markdown code block if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      reportData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Try to parse the raw content
      try {
        reportData = JSON.parse(content);
      } catch {
        throw new Error("AI 응답을 파싱할 수 없습니다.");
      }
    }

    return new Response(JSON.stringify({ report: reportData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-meeting function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
