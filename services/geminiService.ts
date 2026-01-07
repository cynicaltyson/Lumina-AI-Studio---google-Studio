import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowNode, WorkflowConnection, Workflow } from "../types";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the assistant
const ASSISTANT_SYSTEM_INSTRUCTION = `
You are Lumina, an expert AI workflow architect specializing in n8n-style automation.
Your goal is to help users design, debug, and optimize automation workflows.
Be concise, technical but accessible, and always suggest practical node configurations.
`;

export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error in chat stream:", error);
    onChunk("I encountered an error processing your request. Please check your API key.");
  }
};

export const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a JSON representation of an automation workflow based on this request: "${prompt}".
      
      The structure must strictly follow this schema:
      {
        "name": "Workflow Name",
        "description": "Short description",
        "nodes": [
          { "id": "1", "name": "Webhook", "type": "trigger", "position": { "x": 100, "y": 100 }, "data": {}, "icon": "webhook" },
          ...
        ],
        "connections": [
           { "id": "c1", "source": "1", "target": "2" }
        ]
      }
      
      Available node types: 'trigger', 'action', 'function', 'webhook'.
      Spread nodes out horizontally (x axis increments by 250).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['trigger', 'action', 'function', 'webhook'] },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER }
                    }
                  },
                  data: { type: Type.OBJECT, properties: {} },
                  icon: { type: Type.STRING }
                }
              }
            },
            connections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      return {
        id: crypto.randomUUID(),
        active: false,
        status: 'idle',
        ...rawData
      } as Workflow;
    }
    return null;

  } catch (error) {
    console.error("Error generating workflow:", error);
    return null;
  }
};

export const analyzeWorkflow = async (workflow: Workflow): Promise<string> => {
  try {
    const workflowJson = JSON.stringify({ nodes: workflow.nodes, connections: workflow.connections });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this workflow structure and provide 3 brief bullet points on potential improvements or security risks: ${workflowJson}`,
    });
    return response.text || "Unable to analyze workflow.";
  } catch (error) {
    console.error("Error analyzing workflow:", error);
    return "Error analyzing workflow.";
  }
}
