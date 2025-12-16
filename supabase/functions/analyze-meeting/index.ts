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
    
    console.log("Received material contents:", materialContents?.length || 0, "files");
    console.log("Received transcript:", transcriptContent ? "yes" : "no");

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
제공된 회의 자료와 녹취록을 분석하여 상세하고 명확한 경영진 보고서를 작성해주세요.

다음 JSON 형식으로만 응답하세요:
{
  "title": "회의 제목 (핵심 주제를 반영한 구체적인 제목)",
  "date": "오늘 날짜 (YYYY년 MM월 DD일 형식)",
  "participants": ["참석자1", "참석자2"],
  "summary": "회의 전체 요약 (핵심 내용, 결론, 의의를 포함한 4-5문장의 상세한 요약)",
  "topics": [
    {
      "title": "주요 논의 사항 제목",
      "content": "상세 내용 설명 - 원문에서 구체적인 수치, 사례, 발언 내용을 인용하여 상세히 기술. 배경 설명과 논의 맥락을 포함하여 회의에 참석하지 않은 사람도 이해할 수 있도록 작성"
    }
  ],
  "decisions": [
    {
      "decision": "결정된 사항 (구체적으로 무엇이 결정되었는지)",
      "rationale": "결정 근거 및 배경",
      "impact": "예상되는 영향 또는 기대 효과"
    }
  ],
  "risks": [
    {
      "risk": "리스크 또는 우려 사항",
      "severity": "상/중/하",
      "mitigation": "대응 방안 또는 권고 사항"
    }
  ],
  "keyInsights": [
    "경영진이 알아야 할 핵심 인사이트 1",
    "경영진이 알아야 할 핵심 인사이트 2"
  ],
  "followUps": [
    {
      "task": "후속 조치 사항 (구체적인 액션 아이템)",
      "assignee": "담당자",
      "deadline": "기한",
      "priority": "상/중/하"
    }
  ],
  "nextSteps": "다음 단계 및 향후 일정에 대한 설명"
}

핵심 작성 지침:
1. **원문 발췌 필수**: 원본 자료의 내용을 구체적으로 인용하고 발췌하여 작성하세요. "~라고 언급됨", "~로 보고됨" 형태로 출처를 명시하세요.
2. **상세한 맥락 제공**: 회의에 참석하지 않은 경영진도 내용을 완전히 이해할 수 있도록 배경과 맥락을 충분히 설명하세요.
3. **구체적인 수치 포함**: 언급된 모든 숫자, 금액, 날짜, 비율 등을 정확히 기재하세요.
4. **의사결정 명확화**: 무엇이 결정되었고, 왜 그렇게 결정되었는지 명확히 기술하세요.
5. **리스크 식별**: 논의 중 언급된 우려사항, 리스크, 장애 요소를 빠짐없이 기록하세요.
6. **실행 가능한 액션**: 후속 조치는 구체적이고 측정 가능하게 작성하세요.
7. **참석자 미명시 시**: ["회의 참석자"]로 표시
8. **담당자/기한 미명시 시**: "미정"으로 표시
9. **리스크나 결정사항이 없는 경우**: 빈 배열 []로 표시`;

    const userPrompt = `다음 회의 내용을 분석하여 CEO 및 경영진을 위한 상세한 보고서를 작성해주세요.
원본 내용을 정확히 발췌하고 인용하여 작성해주세요.

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
