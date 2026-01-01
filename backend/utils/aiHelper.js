import Groq from "groq-sdk";
import { createWorker } from "tesseract.js";
import { GROQ_API_KEY } from "../config/env.js";

// Initialize Groq
const groq = new Groq({ apiKey: GROQ_API_KEY });

/**
 * Extract text from image using Tesseract.js (free OCR)
 */
const extractTextFromImage = async (base64Image, mimeType) => {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, "base64");

    // Create OCR worker
    const worker = await createWorker("eng");

    // Perform OCR
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);

    // Cleanup
    await worker.terminate();

    return text;
  } catch (error) {
    console.error("OCR error:", error);
    throw new Error("Failed to extract text from image");
  }
};

/**
 * Process receipt image: OCR + Groq analysis
 * Returns extracted data for pre-filling form
 */
export const processReceiptImage = async (base64Image, mimeType) => {
  try {
    // Step 1: Extract text from image using OCR
    console.log("Extracting text from receipt image...");
    const extractedText = await extractTextFromImage(base64Image, mimeType);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text could be extracted from the image");
    }

    console.log("Extracted text:", extractedText);

    // Step 2: Use Groq to analyze the extracted text
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing receipts and bills to extract subscription information. 
Extract as much information as possible. Use smart defaults and inference where needed.

For service names: Extract the exact name from the receipt
For categories: Infer based on service type (Netflix=Entertainment, Gym=Fitness, etc.)
For currency: Try to detect from receipt, default to USD if unclear
For billing cycle: Look for keywords like "monthly", "annual", "yearly", "per month"
For dates: Extract renewal/billing dates if mentioned

Always respond with valid JSON only, no explanations.`,
        },
        {
          role: "user",
          content: `Analyze this receipt/bill text and extract subscription details.

Extracted text from receipt:
"""
${extractedText}
"""

Extract and infer the following information:
- name: The service/subscription name (REQUIRED)
- price: The cost as a number (REQUIRED)
- currency: Currency code (USD, EUR, GBP, etc.) - infer from context or default to USD
- frequency: "Monthly", "Yearly", "Weekly", or "Daily" - infer from text
- category: Best matching category - infer intelligently:
  * Entertainment: Netflix, Spotify, Disney+, HBO, YouTube Premium, Apple Music
  * Subscription: Newspapers, Magazines, Cloud Storage, Software
  * Shopping: Amazon Prime, Delivery services
  * Food: Meal kits, Food delivery
  * Travel: Airline passes, Hotel memberships
  * Others: If unsure
- startDate: Today's date in ISO format
- renewalDate: Next billing date if mentioned in receipt
- website: Company website if you can infer it
- status: Default to "Active"

Return ONLY valid JSON in this exact format:
{
  "name": "string",
  "price": number,
  "currency": "string",
  "frequency": "Monthly" | "Yearly" | "Weekly" | "Daily",
  "category": "Entertainment" | "Food" | "Travel" | "Shopping" | "Subscription" | "Others",
  "startDate": "ISO date string",
  "renewalDate": "ISO date string or null",
  "website": "URL string or empty string",
  "status": "Active"
}

If you cannot extract certain fields, use reasonable defaults. Always provide at least name and price.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from Groq");
    }

    // Parse JSON response
    let jsonText = responseText.trim();
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const extractedData = JSON.parse(jsonText);

    // Validate required fields
    if (!extractedData.name || !extractedData.price) {
      throw new Error(
        "Could not extract required subscription details from image"
      );
    }

    // Return data for form pre-filling
    return {
      extracted: true,
      data: extractedData,
      confidence: "high", // You could add confidence scoring later
    };
  } catch (error) {
    console.error("Receipt processing error:", error);
    throw new Error(`Failed to process receipt: ${error.message}`);
  }
};

/**
 * Process natural language commands with smart extraction
 * Returns either conversation or action with extracted data
 */
export const processNaturalLanguageCommand = async (
  userMessage,
  subscriptions,
  conversationHistory,
  user
) => {
  try {
    const systemPrompt = `You are a helpful subscription management assistant. The user has ${
      subscriptions.length
    } subscriptions.

Current subscriptions:
${JSON.stringify(subscriptions, null, 2)}

User information:
- Name: ${user.name || user.email}
- Email: ${user.email}

YOUR GOAL: Extract as much information as possible from the user's message to minimize manual data entry.

SMART EXTRACTION RULES:

1. ADD SUBSCRIPTION:
   - Try to extract: name, price, frequency, category from the user's message
   - Use inference and common knowledge:
     * "Netflix" → category: "Entertainment"
     * "Spotify" → category: "Entertainment"  
     * "Planet Fitness" → category: "Others"
     * "New York Times" → category: "Subscription"
     * "$15.99" or "15.99" → price: 15.99
     * "monthly", "per month", "/month" → frequency: "Monthly"
     * "yearly", "annual", "per year" → frequency: "Yearly"
   - If you extract ANY data, return action "show_subscription_form" with prefillData
   - If NO data can be extracted, ask follow-up questions conversationally

2. DELETE SUBSCRIPTION:
   - Find matching subscription by name (fuzzy match acceptable)
   - Return action "delete_subscription" with subscriptionId
   - If ambiguous, ask which one

3. UPDATE SUBSCRIPTION:
   - Find subscription and extract what needs updating
   - Return action "show_update_form" with subscriptionId and prefillData

4. VIEW/LIST/SHOW SUBSCRIPTIONS:
   - Return action "get_subscriptions" with optional filters

5. INSIGHTS/ANALYSIS:
   - Return action "get_insights"

6. GENERAL CHAT:
   - Provide helpful conversational response

RESPONSE FORMATS:

For ADD with extracted data:
{
  "responseType": "action",
  "message": "I found these details from your message. Please review and confirm.",
  "action": "show_subscription_form",
  "parameters": {
    "prefillData": {
      "name": "Netflix",
      "price": 15.99,
      "currency": "USD",
      "frequency": "Monthly",
      "category": "Entertainment",
      "startDate": "2025-01-01",
      "status": "Active"
    },
    "extracted": true
  }
}

For ADD without enough data:
{
  "responseType": "conversation",
  "message": "I'd love to help you add a subscription! Could you tell me the service name and how much it costs? For example: 'Netflix for $15.99 per month'"
}

For DELETE:
{
  "responseType": "action",
  "message": "I'll cancel your Netflix subscription.",
  "action": "delete_subscription",
  "parameters": {
    "subscriptionId": "actual_id_from_subscriptions_list"
  },
  "needsConfirmation": true
}

Always respond with valid JSON only.`;

    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from Groq");
    }

    // Parse JSON response
    let jsonText = responseText.trim();
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    try {
      const parsedResponse = JSON.parse(jsonText);
      return parsedResponse;
    } catch {
      // If not valid JSON, return as conversational response
      return {
        responseType: "conversation",
        message: responseText,
      };
    }
  } catch (error) {
    console.error("Natural language processing error:", error);
    throw new Error(`Failed to process command: ${error.message}`);
  }
};
