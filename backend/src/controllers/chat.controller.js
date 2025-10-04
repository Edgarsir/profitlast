const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const GeminiService = require('../services/gemini.service');
const jsonStorage = require('../utils/jsonStorage');

const router = express.Router();
const geminiService = new GeminiService();

// Helper function to get relevant context from database
async function getRelevantContext(userId, queryAnalysis) {
  try {
    const context = [];
    
    // Get relevant products if query is about products
    if (queryAnalysis.dataSources.includes('shopify') && 
        (queryAnalysis.queryType === 'product_info' || queryAnalysis.queryType === 'analytics')) {
      const products = await jsonStorage.find('products', { userId });
      
      // Sort by sales and limit to 10
      const sortedProducts = products
        .sort((a, b) => (b.analytics?.totalSales || 0) - (a.analytics?.totalSales || 0))
        .slice(0, 10);
      
      sortedProducts.forEach(product => {
        context.push({
          type: 'product',
          text: `Product: ${product.title}, Sales: ${product.analytics?.totalSales || 0}, Revenue: ${product.analytics?.totalRevenue || 0}`
        });
      });
    }
    
    // Add more context based on query analysis
    // This can be expanded to include orders, shipping data, etc.
    
    return context;
  } catch (error) {
    console.error('Error getting relevant context:', error);
    return [];
  }
}

// Send message to chatbot
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, sessionId = uuidv4() } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const startTime = Date.now();
    
    // Get or create chat session
    let chatSession = await jsonStorage.findOne('chatHistory', {
      userId: req.user._id,
      sessionId: sessionId,
      isActive: true
    });
    
    if (!chatSession) {
      chatSession = {
        userId: req.user._id,
        sessionId: sessionId,
        messages: [],
        isActive: true
      };
    }
    
    // Add user message to history
    chatSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Analyze the query to understand intent
    const queryAnalysis = await geminiService.analyzeQuery(message);
    
    // Get relevant context from database based on query analysis
    const relevantContext = await getRelevantContext(req.user._id, queryAnalysis);
    
    // Prepare conversation history for context
    const conversationHistory = chatSession.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Generate response using Gemini
    const response = await geminiService.generateChatResponse(
      conversationHistory,
      relevantContext
    );
    
    const processingTime = Date.now() - startTime;
    
    // Add assistant response to history
    chatSession.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: {
        queryType: queryAnalysis.queryType,
        dataSourcesUsed: queryAnalysis.dataSources,
        processingTime: processingTime,
        tokensUsed: response.usage?.total_tokens
      }
    });
    
    // Save chat session
    if (chatSession._id) {
      await jsonStorage.updateOne('chatHistory', { _id: chatSession._id }, chatSession);
    } else {
      await jsonStorage.insertOne('chatHistory', chatSession);
    }
    
    res.json({
      sessionId: sessionId,
      response: response.content,
      metadata: {
        processingTime: processingTime,
        tokensUsed: response.usage?.total_tokens,
        queryType: queryAnalysis.queryType,
        contextUsed: relevantContext.length > 0
      }
    });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const chatSessions = await ChatHistory.find({
      userId: req.user._id,
      isActive: true
    })
    .sort({ updatedAt: -1 })
    .limit(limit * page)
    .skip((page - 1) * limit)
    .select('sessionId summary tags updatedAt messages');
    
    const formattedSessions = chatSessions.map(session => ({
      sessionId: session.sessionId,
      summary: session.summary || session.messages[0]?.content?.substring(0, 100) + '...',
      tags: session.tags,
      lastMessage: session.updatedAt,
      messageCount: session.messages.length
    }));
    
    res.json({
      sessions: formattedSessions,
      total: await ChatHistory.countDocuments({ userId: req.user._id, isActive: true }),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get specific chat session
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const chatSession = await ChatHistory.findOne({
      userId: req.user._id,
      sessionId: sessionId,
      isActive: true
    });
    
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json({
      sessionId: chatSession.sessionId,
      messages: chatSession.messages,
      summary: chatSession.summary,
      tags: chatSession.tags,
      createdAt: chatSession.createdAt,
      updatedAt: chatSession.updatedAt
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({ error: 'Failed to get chat session' });
  }
});

// Delete chat session
router.delete('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await ChatHistory.updateOne(
      { userId: req.user._id, sessionId: sessionId },
      { isActive: false }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// Generate summary for chat session
router.post('/session/:sessionId/summary', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const chatSession = await ChatHistory.findOne({
      userId: req.user._id,
      sessionId: sessionId,
      isActive: true
    });
    
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    if (chatSession.messages.length < 2) {
      return res.status(400).json({ error: 'Not enough messages to generate summary' });
    }
    
    const summary = await geminiService.generateSummary(chatSession.messages);
    
    chatSession.summary = summary;
    await chatSession.save();
    
    res.json({ summary: summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Stream chat response (for real-time typing effect)
router.post('/stream', authMiddleware, async (req, res) => {
  try {
    const { message, sessionId = uuidv4() } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
      // Get chat session and prepare context (same as above)
      let chatSession = await ChatHistory.findOne({
        userId: req.user._id,
        sessionId: sessionId,
        isActive: true
      });
      
      if (!chatSession) {
        chatSession = new ChatHistory({
          userId: req.user._id,
          sessionId: sessionId,
          messages: []
        });
      }
      
      chatSession.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      const queryAnalysis = await geminiService.analyzeQuery(message);
      const relevantContext = await getRelevantContext(req.user._id, queryAnalysis);
      
      const conversationHistory = chatSession.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get streaming response
      const stream = await geminiService.generateStreamingResponse(
        conversationHistory,
        relevantContext
      );
      
      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.text() || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content, type: 'chunk' })}\n\n`);
        }
      }
      
      // Save complete response
      chatSession.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        metadata: {
          queryType: queryAnalysis.queryType,
          dataSourcesUsed: queryAnalysis.dataSources
        }
      });
      
      await chatSession.save();
      
      res.write(`data: ${JSON.stringify({ type: 'done', sessionId })}\n\n`);
      res.end();
      
    } catch (streamError) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to process message' })}\n\n`);
      res.end();
    }
    
  } catch (error) {
    console.error('Error in streaming chat:', error);
    res.status(500).json({ error: 'Failed to start streaming chat' });
  }
});

module.exports = router;