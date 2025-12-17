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
제공된 회의 자료와 녹취록을 분석하여 **핵심 내용 중심의 간결한** 경영진 보고서를 작성해주세요.

중요: 장황한 설명 대신 **핵심 정보만 bullet point 형식**으로 정리하세요.

다음 JSON 형식으로만 응답하세요:
{
  "title": "회의 제목 (핵심 주제를 반영한 구체적인 제목)",
  "date": "${currentDate}",
  "participants": ["참석자1", "참석자2"],
  "meetingPurpose": [
    "회의 목적 1 (1문장)",
    "회의 목적 2",
    "회의 목적 3"
  ],
  "summary": "회의 전체 요약 (핵심 결론 위주로 2-3문장)",
  "topics": [
    {
      "title": "주요 논의 사항 제목 (구체적인 카테고리명)",
      "content": "이 섹션의 한 줄 개요 (선택사항, 없어도 됨)",
      "subItems": [
        "핵심항목: 구체적 내용, 일정, 수치 등 (1-2문장)",
        "핵심항목: 구체적 내용 (1-2문장)",
        "핵심항목: 구체적 내용 (1-2문장)"
      ]
    }
  ],
  "decisions": [
    {
      "decision": "결정된 사항 (구체적으로)",
      "rationale": "결정 근거",
      "impact": "예상 효과 및 영향",
      "deadline": "실행 기한 (있는 경우)"
    }
  ],
  "risks": [
    {
      "risk": "리스크 사항 (구체적으로)",
      "severity": "상/중/하",
      "mitigation": "대응 방안 (구체적인 액션 포함)",
      "owner": "담당자 (있는 경우)"
    }
  ],
  "keyInsights": [
    "핵심 인사이트 (구체적인 내용 포함)"
  ],
  "followUps": [
    {
      "task": "후속 조치 사항 (구체적인 액션)",
      "assignee": "담당자",
      "deadline": "기한",
      "priority": "상/중/하",
      "details": "추가 세부사항 (있는 경우)"
    }
  ],
  "nextSteps": "다음 단계 및 향후 일정 (구체적으로 2-3문장)"
}

핵심 작성 지침:
1. **원문 정확성 필수**: 고유명사, 약어, 영문 용어, 제품명, 기술 용어는 원문 그대로 정확히 표기하세요. 
   - 예: "RULE8", "Rule 8"은 그대로 유지 (UL로 변경 금지)
   - 예: "재작업"은 그대로 유지 (제작업으로 변경 금지)
2. **오타 주의**: 원본 텍스트의 단어를 임의로 변경하거나 유사 단어로 대체하지 마세요.
3. **시간 정보 제외**: 녹취록의 타임스탬프는 절대 포함하지 마세요.
4. **간결하게 작성**: 장황한 문장 대신 "항목명: 핵심내용" 형식의 bullet point로 작성하세요.
5. **subItems 적극 활용**: topics의 content는 짧게 쓰고, 세부 내용은 subItems에 bullet point로 정리하세요.
6. **구체적 수치 포함**: 금액, 수량, 일정, 비율 등 모든 구체적 수치를 포함하세요.
7. **주요 논의사항**: 5-8개로 카테고리별로 구분하여 작성하세요.
8. **참석자 미명시 시**: ["회의 참석자"]로 표시
9. **담당자/기한 미명시 시**: "미정"으로 표시
10. **리스크나 결정사항이 없는 경우**: 빈 배열 []로 표시`;

    const userPrompt = `다음 회의 내용을 분석하여 CEO 및 경영진을 위한 간결한 보고서를 작성해주세요.

중요: 
- 시간 정보(타임스탬프)는 제외하세요.
- 영문 약어, 제품명, 기술 용어는 원문 그대로 정확히 표기하세요 (예: RULE8, UL인증 등).
- 한글 단어도 원문을 임의로 변경하지 마세요 (예: "재작업"을 "제작업"으로 바꾸지 않음).

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
