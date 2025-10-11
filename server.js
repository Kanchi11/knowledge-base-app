require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
    console.error('Please create a .env file with: GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
}

function callGeminiAPI(prompt) {
    return new Promise((resolve, reject) => {
        const model = 'gemini-2.0-flash-exp';
        console.log(`📤 Calling Gemini API with model: ${model}`);

        const postData = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                console.log('📥 Status code:', res.statusCode);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(body);
                        const text = response.candidates[0].content.parts[0].text;
                        console.log('✅ SUCCESS! Got response from Gemini');
                        resolve(text);
                    } catch (parseError) {
                        console.error('❌ Parse error:', parseError);
                        reject(new Error('Failed to parse API response'));
                    }
                } else {
                    console.error('❌ API Error:', body);
                    try {
                        const errorData = JSON.parse(body);
                        if (errorData.error?.message) {
                            reject(new Error(errorData.error.message));
                        } else {
                            reject(new Error('API request failed'));
                        }
                    } catch {
                        reject(new Error('API request failed'));
                    }
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(new Error('Network error: Unable to reach API'));
        });

        req.write(postData);
        req.end();
    });
}

function buildEnrichmentPrompt(query, documents) {
    const allDocuments = documents.map((doc, idx) => 
        `═══════════════════════════════════════
DOCUMENT ${idx + 1}: "${doc.name}"
Type: ${doc.type}
═══════════════════════════════════════
${doc.content.substring(0, 50000)}${doc.content.length > 50000 ? '\n[Content truncated...]' : ''}
═══════════════════════════════════════`
    ).join('\n\n');

    return `You are a helpful assistant for a knowledge base system. Your role is to help users find answers and guide them on what to do when information is incomplete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S QUESTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${query}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE DOCUMENTS (${documents.length} total):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allDocuments}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR TASK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Read through ALL the documents to find relevant information
2. Answer the user's question using ONLY what's in the documents
3. Be honest about what you don't know
4. When information is missing, give practical, friendly advice on what the user should do next

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANSWER:
[Write a clear, natural answer. If you can answer fully, provide all the details. If you can only partially answer, share what you know and mention what's missing. If you can't answer at all, say so clearly.]

CONFIDENCE: [high | medium | low]
- high: You found everything needed to fully answer the question
- medium: You found some information but there are gaps
- low: Very little or no relevant information in the documents

COVERAGE: [0-100]
How much of the question you could answer (percentage)

SOURCES:
[List the documents you used:]
Document: [document name]
Relevance: [high | medium | low]
Key Information: [what this document told you in 1-2 sentences]
Excerpt: "[a brief quote from the document]"

ENRICHMENT:
[This is where you help the user fill the gaps! Write in a friendly, conversational tone.]

If confidence is "high": Write "You're all set! I found everything needed to answer your question."

If confidence is "medium" or "low", provide practical, conversational suggestions. Write them as if you're talking to a colleague:

- Start suggestions with action verbs: "Upload...", "Ask...", "Check...", "Request...", "Contact...", "Review..."
- Be specific about what documents to upload (exact names or types)
- Suggest who to contact (HR, Legal, Manager, etc.) and what to ask them
- Tell them where to find information (company intranet, specific departments, etc.)
- Offer to help analyze documents once they upload them
- Be encouraging and helpful

EXAMPLE GOOD SUGGESTIONS:
- "Upload your company's 'Employee Termination Policy 2025' document, and I can provide specific termination procedures"
- "Contact your HR department to get the severance calculation guidelines - once you upload that document, I'll help you understand the details"
- "Check your company intranet under HR > Policies for the complete termination checklist. Upload it here and I'll break it down for you"
- "Ask your manager for the 'Performance Improvement Plan (PIP) Template' - I can then show you exactly how to use it"
- "Request the legal compliance checklist from your legal team, then I can help ensure you follow all required steps"

EXAMPLE BAD SUGGESTIONS (Don't write like this):
- "More documentation needed" ❌ (too vague)
- "Consult official sources" ❌ (not specific enough)
- "Additional information required" ❌ (doesn't help the user)

Remember: Write each suggestion as a complete, actionable sentence. Be friendly, specific, and helpful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now provide your response:`;
}

function parseGeminiResponse(geminiText) {
    const result = {
        answer: '',
        confidence: 'low',
        coverage: 0,
        sources: [],
        suggestions: []
    };

    try {
        // Extract ANSWER
        const answerMatch = geminiText.match(/ANSWER:\s*([\s\S]*?)(?=CONFIDENCE:|$)/i);
        if (answerMatch) {
            result.answer = answerMatch[1].trim();
        }

        // Extract CONFIDENCE
        const confidenceMatch = geminiText.match(/CONFIDENCE:\s*(high|medium|low)/i);
        if (confidenceMatch) {
            result.confidence = confidenceMatch[1].toLowerCase();
        }

        // Extract COVERAGE
        const coverageMatch = geminiText.match(/COVERAGE:\s*(\d+)/i);
        if (coverageMatch) {
            result.coverage = Math.min(100, Math.max(0, parseInt(coverageMatch[1])));
        }

        // Extract SOURCES
        const sourcesSection = geminiText.match(/SOURCES:\s*([\s\S]*?)(?=ENRICHMENT:|$)/i);
        if (sourcesSection) {
            const sourcesText = sourcesSection[1];
            const sourceEntries = sourcesText.split(/(?=Document:)/i);
            
            sourceEntries.forEach(entry => {
                const docMatch = entry.match(/Document:\s*([^\n]+)/i);
                const relevanceMatch = entry.match(/Relevance:\s*(high|medium|low)/i);
                const excerptMatch = entry.match(/Excerpt:\s*"([^"]+)"/i) || 
                                    entry.match(/Key Information:\s*([^\n]+)/i);
                
                if (docMatch) {
                    result.sources.push({
                        docName: docMatch[1].trim(),
                        relevance: relevanceMatch ? relevanceMatch[1].toLowerCase() : 'medium',
                        excerpt: excerptMatch ? excerptMatch[1].trim() : ''
                    });
                }
            });
        }

        // Extract ENRICHMENT suggestions
        const enrichmentSection = geminiText.match(/ENRICHMENT:\s*([\s\S]*?)$/i);
        if (enrichmentSection) {
            const enrichmentText = enrichmentSection[1];
            
            // Check if no enrichment needed
            if (enrichmentText.toLowerCase().includes("you're all set") || 
                enrichmentText.toLowerCase().includes('none needed')) {
                result.suggestions = [];
            } else {
                const lines = enrichmentText.split('\n');
                
                lines.forEach(line => {
                    const trimmed = line.trim();
                    
                    if (!trimmed) return;
                    
                    // Skip header lines
                    if (trimmed.match(/^(EXAMPLE|DOCUMENTS|DATA|ACTIONS|RECOMMENDATIONS?)[:_\s]*$/i)) {
                        return;
                    }
                    
                    // Skip example lines
                    if (trimmed.toLowerCase().includes('example good') || 
                        trimmed.toLowerCase().includes('example bad') ||
                        trimmed.includes('❌')) {
                        return;
                    }
                    
                    // Clean up the suggestion
                    let suggestion = trimmed
                        .replace(/^[-•*]\s*/, '')
                        .replace(/^\d+\.\s*/, '')
                        .replace(/^["'"]/, '')
                        .replace(/["'"]$/, '')
                        .trim();
                    
                    // Validate and add suggestion
                    if (suggestion.length > 20 && 
                        !suggestion.match(/^(DOCUMENTS|DATA|ACTIONS|ENRICHMENT)/i) &&
                        (suggestion.match(/^(Upload|Ask|Contact|Check|Request|Review|Get|Find|Look|Reach|Schedule|Consult|Obtain)/i) ||
                         suggestion.includes('department') ||
                         suggestion.includes('document') ||
                         suggestion.includes('help'))) {
                        result.suggestions.push(suggestion);
                    }
                });
            }
        }
    } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        // Return partial result with fallback values
        if (!result.answer) {
            result.answer = "I had trouble processing the response, but I'm here to help. Please try rephrasing your question.";
        }
    }

    return result;
}

// Main search endpoint
app.post('/api/search', async (req, res) => {
    try {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📨 New search request received');
        
        const { query, documents } = req.body;
        
        // Validate request
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid query parameter' 
            });
        }

        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ 
                error: 'No documents provided' 
            });
        }

        // Validate documents structure
        for (const doc of documents) {
            if (!doc.name || !doc.content) {
                return res.status(400).json({ 
                    error: 'Invalid document structure' 
                });
            }
        }

        console.log(`🔍 Query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
        console.log(`📚 Documents: ${documents.length}`);
        
        const prompt = buildEnrichmentPrompt(query, documents);
        const geminiResponse = await callGeminiAPI(prompt);
        
        const parsedResult = parseGeminiResponse(geminiResponse);
        
        console.log(`✅ Result: Confidence=${parsedResult.confidence}, Coverage=${parsedResult.coverage}%, Sources=${parsedResult.sources.length}, Suggestions=${parsedResult.suggestions.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        res.json(parsedResult);
        
    } catch (error) {
        console.error('❌ Error in /api/search:', error.message);
        res.status(500).json({ 
            error: error.message || 'Search service temporarily unavailable',
            details: 'Please try again in a moment'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        geminiConfigured: !!GEMINI_API_KEY,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: [
            'POST /api/search',
            'GET /health'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

app.listen(port, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🤖 Gemini 2.0 Flash ready!`);
    console.log(`✅ API Key configured: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
    console.log('\n📍 Available endpoints:');
    console.log(`   POST http://localhost:${port}/api/search`);
    console.log(`   GET  http://localhost:${port}/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});