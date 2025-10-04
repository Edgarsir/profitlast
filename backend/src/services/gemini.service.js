const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });
  }

  async generateChatResponse(messages, context = null) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Convert messages to Gemini format
      const conversationHistory = messages.map(msg => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        }
        return msg.content;
      }).join('\n');

      const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nPlease provide a helpful response based on the context and conversation history.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        content: response.text(),
        usage: {
          total_tokens: response.text().length // Approximate token count
        },
        model: 'gemini-pro'
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  }

  async generateStreamingResponse(messages, context = null) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Convert messages to Gemini format
      const conversationHistory = messages.map(msg => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        }
        return msg.content;
      }).join('\n');

      const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nPlease provide a helpful response based on the context and conversation history.`;

      const result = await this.model.generateContentStream(prompt);
      
      return result.stream;
    } catch (error) {
      console.error('Error generating streaming response:', error);
      throw error;
    }
  }

  buildSystemPrompt(context) {
    let systemPrompt = `You are an intelligent e-commerce analytics assistant. You help users understand their business data from multiple platforms including Shopify, Meta (Facebook/Instagram), and Shiprocket.

Your capabilities include:
- Analyzing sales data and trends
- Providing insights on product performance
- Explaining marketing campaign results
- Tracking shipping and logistics metrics
- Answering questions about customer behavior
- Generating actionable business recommendations

Guidelines:
- Always base your responses on the provided data context
- If you don't have enough information to answer a question, say so clearly
- Provide specific numbers and metrics when available
- Offer actionable insights and recommendations
- Be concise but thorough in your explanations
- Use a professional but friendly tone`;

    if (context && context.length > 0) {
      systemPrompt += `\n\nRelevant business data context:\n${context.map(item => `- ${item.text || item.description || JSON.stringify(item)}`).join('\n')}`;
    }

    return systemPrompt;
  }

  async analyzeQuery(query) {
    try {
      const analysisPrompt = `Analyze the following user query and determine:
1. The type of information they're looking for (analytics, product_info, order_status, shipping, marketing, etc.)
2. The time period they're interested in (if mentioned)
3. The specific metrics or data points they want
4. Which data sources would be most relevant (shopify, meta, shiprocket)

Query: "${query}"

Respond in JSON format with the analysis. Example:
{
  "queryType": "analytics",
  "timePeriod": "last_month",
  "metrics": ["sales", "revenue"],
  "dataSources": ["shopify"]
}`;

      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      
      try {
        const responseText = response.text();
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
        return JSON.parse(jsonString);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          queryType: 'general',
          timePeriod: null,
          metrics: [],
          dataSources: ['shopify', 'meta', 'shiprocket']
        };
      }
    } catch (error) {
      console.error('Error analyzing query:', error);
      throw error;
    }
  }

  async generateSummary(conversation) {
    try {
      const summaryPrompt = `Generate a brief summary of this conversation between a user and an e-commerce analytics assistant. Focus on the key topics discussed and insights provided.

Conversation:
${conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Summary:`;

      const result = await this.model.generateContent(summaryPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }
}

module.exports = GeminiService;