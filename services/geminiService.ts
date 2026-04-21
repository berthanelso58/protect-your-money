import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { FraudNews, GameRound } from "../types";

export const getAI = (customKey?: string) => {
  return new GoogleGenAI({ apiKey: customKey || (process.env.API_KEY as string) });
};

export async function fetchFraudNews(keywords: string[]): Promise<FraudNews[]> {
  const ai = getAI();
  const prompt = `搜寻关于这些关键词的最新诈骗和骗局新闻：${keywords.join(", ")}。
    
    要求：
    1. 请搜寻并提取 **20条** 不同的最新新闻。
    2. **过滤重复：** 如果发现手法高度相似的诈骗手段（例如针对同一银行的相同变体），请只保留最具代表性的一条。
    3. 内容必须是最新的、真实发生的案例。
    
    请以 JSON 数组形式返回对象，结构如下：
    - title: 标题（中文）
    - summary: 诈骗手段的简短摘要（中文）
    - sourceUrl: 新闻来源 URL
    - date: 大致日期
    
    所有内容必须使用简体中文。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ["title", "summary", "sourceUrl", "date"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function generateGameRounds(newsItems: FraudNews[]): Promise<GameRound[]> {
  const ai = getAI();
  const prompt = `根据提供的真实诈骗新闻，生成 **10个** 演练关卡。
    
    要求：
    1. 为每个关卡创建一个逼真的信息或电话脚本。
    2. 比例：70% 诈骗 (isFraud: true)，30% 真实通讯 (isFraud: false)。
    3. **发件人 (sender) 逻辑：**
       - 诈骗信息：**严禁使用姓名**，必须使用极其逼真的号码。如虚拟运营商号段 (170/171)、伪装的官方号 (如把 95588 改成 0095588)、或含有异常后缀的号码。
       - 真实信息：使用正规官方号码 (如 95533, 10086, 12381 等)。
    4. **金额损毁 (estimatedLoss) 逻辑：**
       - 针对 isFraud: true 的案例，根据新闻背景估算一笔合理的被骗金额（500 到 500000 之间，以元为单位）。
    
    新闻背景：${JSON.stringify(newsItems)}

    以 JSON 数组形式返回：
    - id: 唯一标识
    - sender: 电话号码或短信号码（字符串，如 '+86 17012345678'）
    - content: 内容（中文，放大小部分，包含钓鱼链接或正式链接）
    - type: "sms" 或 "call"
    - isFraud: 是否为诈骗
    - newsContext: 关联的新闻标题
    - explanation: 简短理由（中文）
    - estimatedLoss: 整数，可能的损失金额（仅诈骗件需要）
    
    内容必须极度逼真，模拟真实的心理陷阱。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              sender: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING },
              isFraud: { type: Type.BOOLEAN },
              newsContext: { type: Type.STRING },
              explanation: { type: Type.STRING },
              estimatedLoss: { type: Type.INTEGER },
            },
            required: ["id", "sender", "content", "type", "isFraud", "newsContext", "explanation"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating rounds:", error);
    return [];
  }
}

export async function generateHighQualityImage(prompt: string, size: "1K" | "2K" | "4K"): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `A professional, high-quality asset for fraud awareness: ${prompt}. Cinematic lighting, highly detailed.` }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data received");
}

export async function editImage(base64Image: string, editPrompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: editPrompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data received from edit");
}