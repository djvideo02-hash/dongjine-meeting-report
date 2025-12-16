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

    const systemPrompt = `당신은 기업 경영진 보고서를 작성하는 전문 비서입니다. 
제공된 회의 자료와 녹취록을 분석하여 CEO 및 경영진이 빠르게 파악할 수 있는 보고서를 작성해주세요.

다음 JSON 형식으로만 응답하세요:
{
  "title": "회의 제목 (핵심 주제를 반영)",
  "date": "오늘 날짜 (YYYY년 MM월 DD일 형식)",
  "participants": ["참석자1", "참석자2"],
  "summary": "회의 전체 요약 (2-3문장으로 핵심 내용 요약)",
  "topics": [
    {
      "title": "주요 논의 사항 제목",
      "content": "상세 내용 설명"
    }
  ],
  "followUps": [
    {
      "task": "후속 조치 사항",
      "assignee": "담당자",
      "deadline": "기한"
    }
  ]
}

중요 지침:
1. 원본 내용을 정확하게 발췌하여 사용하세요
2. 추측이나 가정은 하지 마세요
3. 핵심 의사결정 사항과 액션 아이템을 명확히 정리하세요
4. 경영진이 5분 내에 파악할 수 있도록 간결하게 작성하세요
5. 참석자가 명시되지 않으면 ["회의 참석자"] 로 표시하세요
6. 후속 조치의 담당자와 기한이 명시되지 않으면 "미정"으로 표시하세요`;

    const userPrompt = `다음 회의 내용을 분석하여 경영진 보고서를 작성해주세요:\n\n${context}`;

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
