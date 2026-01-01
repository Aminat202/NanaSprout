/**
 * Service to interact with the Deployed Cloudflare Worker
 * URL: https://purple-breeze-8f7c.aminatukekere.workers.dev/
 */

const WORKER_URL = "https://purple-breeze-8f7c.aminatukekere.workers.dev/";

export const generateConsequence = async (action, currentTheme, gameState) => {
    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action,
                dayTheme: currentTheme,
                hp: gameState?.health || 100,
                toxicity: gameState?.toxicity || 0
            }),
        });

        if (!response.ok) {
            throw new Error(`Worker Error: ${response.statusText}`);
        }

        const data = await response.json();

        // The worker returns the raw AI response. 
        let aiContent = data.response || data;

        // Handle potential double-stringified JSON or markdown wrapping
        if (typeof aiContent === 'string') {
            aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                aiContent = JSON.parse(aiContent);
            } catch (e) {
                console.error("Failed to parse AI JSON:", aiContent);
                return {
                    narrative: "The system hums but fails to compute the biological impact. (JSON Parse Error)",
                    visual_keyword: "error", // Default for error
                    stat_impact: { hp: 0, toxicity: 0, xp: 0 },
                    theme_match: true
                };
            }
        }

        return {
            narrative: aiContent.narrative,
            biological_mechanism: aiContent.biological_mechanism,
            status_effect: aiContent.status_effect,
            visual_keyword: aiContent.visual_keyword,
            stat_impact: {
                hp: aiContent.stat_updates?.hp_change || 0,
                toxicity: aiContent.stat_updates?.toxicity_change || 0,
                xp: aiContent.stat_updates?.xp_gained || 0
            },
            theme_match: true
        };

    } catch (error) {
        console.error("LLM Service Error:", error);
        return {
            narrative: "Connection to Bio-Monitor lost. (Network Error)",
            stat_impact: { hp: 0, toxicity: 0, xp: 0 },
            theme_match: false
        };
    }
};

/**
 * Generate a SINGLE scenario for prefetch strategy
 * Simpler than batch - fetch one at a time with better reliability
 */
export const generateSingleScenario = async (theme, scenarioIndex = 0) => {
    // Fallback scenarios for errors
    const FALLBACKS = [
        {
            situation: "A factory is dumping waste into the nearby river. You witness this while walking by.",
            choices: [
                { text: "Report to environmental authorities", consequence: "Officials investigate and stop the pollution!", stats: { hp: 5, toxicity: -5, xp: 30 }, isCorrect: true, reason: "Reporting pollution helps stop it." },
                { text: "Ignore it and walk away", consequence: "The pollution continues unchecked.", stats: { hp: -10, toxicity: 8, xp: 0 }, isCorrect: false, reason: "Ignoring problems lets them grow." },
                { text: "Take a video for social media only", consequence: "Views go up but nothing changes.", stats: { hp: -5, toxicity: 5, xp: 5 }, isCorrect: false, reason: "Action beats awareness alone." }
            ]
        },
        {
            situation: "Your neighborhood has no recycling bins and trash is piling up.",
            choices: [
                { text: "Organize a community cleanup", consequence: "Neighbors join and streets are clean!", stats: { hp: 8, toxicity: -4, xp: 35 }, isCorrect: true, reason: "Community action creates change." },
                { text: "Burn the trash", consequence: "Toxic smoke fills the air.", stats: { hp: -15, toxicity: 12, xp: 0 }, isCorrect: false, reason: "Burning releases toxic gases." },
                { text: "Wait for government help", consequence: "Nothing happens for months.", stats: { hp: -5, toxicity: 5, xp: 0 }, isCorrect: false, reason: "Waiting delays solutions." }
            ]
        },
        {
            situation: "You notice your tap water looks cloudy and smells strange.",
            choices: [
                { text: "Test the water quality", consequence: "You identify contamination and alert others!", stats: { hp: 5, toxicity: -3, xp: 25 }, isCorrect: true, reason: "Testing reveals hidden dangers." },
                { text: "Drink it anyway", consequence: "You feel sick from contaminants.", stats: { hp: -20, toxicity: 10, xp: 0 }, isCorrect: false, reason: "Contaminated water harms health." },
                { text: "Buy bottled water only for yourself", consequence: "Others keep drinking bad water.", stats: { hp: 0, toxicity: 3, xp: 5 }, isCorrect: false, reason: "Individual action isn't enough." }
            ]
        }
    ];

    try {
        console.log(`[PREFETCH] Fetching scenario ${scenarioIndex + 1} for theme: ${theme}`);

        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: "batch",
                count: 1,  // Just one scenario
                dayTheme: theme,
                hp: 100,
                toxicity: 0
            }),
        });

        if (!response.ok) {
            throw new Error(`Worker Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.response || data;

        // Parse if string
        if (typeof content === 'string') {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            content = JSON.parse(content);
        }

        // Extract first scenario from array
        const scenario = Array.isArray(content) ? content[0] : content;

        // Validate structure
        if (scenario?.situation && scenario?.choices?.length >= 2) {
            console.log(`[PREFETCH] ✓ Scenario ${scenarioIndex + 1} ready`);
            return { scenario, error: null };
        }

        throw new Error("Invalid scenario structure");

    } catch (error) {
        console.error(`[PREFETCH] Error fetching scenario ${scenarioIndex + 1}:`, error.message);
        // Return fallback
        const fallback = FALLBACKS[scenarioIndex % FALLBACKS.length];
        return {
            scenario: fallback,
            error: `Using fallback: ${error.message}`
        };
    }
};

export const generateTournamentQuestions = async (topic) => {
    // If creds are missing, return valid mock data for testing
    if (!isConfigured()) {
        return [
            { q: "Mock Question: Why are trees good?", options: ["Oxygen", "Candy", "Noise"], answer: 0 }
        ];
    }

    const systemPrompt = `
### ROLE
You are a gamified educational engine for children. 
Create a 3-question mini-tournament about: "${topic}".

### FORMAT
Output ONLY valid JSON array:
[
  { "q": "Question text?", "options": ["A", "B", "C"], "answer": 0 } // answer is index
]
`;

    try {
        const response = await fetch(
            `/api/cloudflare/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: "Generate quiz now." }
                    ]
                }),
            }
        );

        const data = await response.json();
        let content = data.result?.response;

        if (typeof content === 'string') {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(content);
        }
        return content;

    } catch (error) {
        console.error("Tournament Gen Error:", error);
        return [];
    }
};

export const generateDailyScenario = async (theme, toxicity) => {
    const FALLBACK_SCENARIOS = [
        {
            situation: "A sudden smog cloud descends upon the city, making it hard to breathe.",
            choices: ["Stay indoors", "Plant air-purifying moss", "Drive to work anyway"]
        },
        {
            situation: "A local river has turned a strange neon color due to factory runoff.",
            choices: ["Report to authorities", "Organize a cleanup", "Collect a sample for analysis"]
        },
        {
            situation: "A heatwave is causing the community garden to wither rapidly.",
            choices: ["Water extra heavily", "Install shade cloths", "Plant drought-resistant crops"]
        },
        {
            situation: "You find a bird entangled in plastic rings on your morning walk.",
            choices: ["Untangle it carefully", "Call animal control", "Take a photo and post it"]
        },
        {
            situation: "Your neighborhood's recycling bin is overflowing and spilling onto the street.",
            choices: ["Sort it yourself", "Call the city", "Burn the excess trash"]
        }
    ];

    const getRandomFallback = () => FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];

    // Mock response for dev/fallback
    if (!WORKER_URL && !import.meta.env.VITE_CLOUDFLARE_API_TOKEN) {
        return getRandomFallback();
    }

    const systemPrompt = `
### ROLE
You are an interactive fiction game master for an eco-conscious RPG.
Create a "Daily Scenario" based on the Theme: "${theme}" and Current Toxicity: ${toxicity}%.

### OBJECTIVE
1. Describe a specific, urgent situation that requires player intervention.
2. Provide THREE distinct choices for the player.
   - Choice 1: A small, immediate fix.
   - Choice 2: A lazy or harmful choice.
   - Choice 3: A creative, long-term solution.

### FORMAT
Output ONLY valid JSON:
{
  "situation": "string (max 2 sentences)",
  "choices": ["string (short action)", "string (short action)", "string (short action)"]
}
`;

    try {
        // Use the Worker instead of direct API to avoid CORS
        // We overload the 'action' parameter to act as a system instruction since we can't change the worker's hardcoded prompt easily.
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: `[SYSTEM OVERRIDE] GENERATE DAILY SCENARIO.
Theme: ${theme}, Toxicity: ${toxicity}%.
Format: JSON { "situation": "...", "choices": ["...", "...", "..."] }.
Ignore other game logic.`,
                dayTheme: theme,
                hp: 100,
                toxicity: toxicity
            }),
        });

        if (!response.ok) throw new Error(`Worker Error: ${response.statusText}`);

        const data = await response.json();
        let content = data.response || data;

        if (typeof content === 'string') {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(content);
            } catch (e) {
                console.warn("JSON Parse failed for scenario, using fallback");
                return getRandomFallback();
            }
        }
        return content || getRandomFallback();

    } catch (error) {
        console.error("Scenario Gen Error:", error);
        // Return fallback + specific error flag for UI handling
        const fallback = getRandomFallback();
        return {
            ...fallback,
            error: error.message || "Unknown error"
        };
    }
};

/**
 * Generate multiple scenarios at once with pre-computed consequences
 * @param {number} count - Number of scenarios (3 for classic, 10 for survival)
 * @param {string} theme - Current day theme
 * @returns {Array} Array of scenarios with choices and consequences
 */
export const generateBatchScenarios = async (count, theme) => {
    const FALLBACK_BATCH = [
        {
            situation: "A sudden smog cloud descends upon the city, making it hard to breathe.",
            choices: [
                {
                    text: "Stay indoors and close windows",
                    consequence: "You protected yourself from the harmful particles. Smart thinking!",
                    stats: { hp: 5, toxicity: -2, xp: 20 },
                    isCorrect: true,
                    reason: "Reducing exposure to air pollution protects your respiratory system."
                },
                {
                    text: "Go outside to investigate",
                    consequence: "You inhaled harmful particles. Your lungs feel heavy.",
                    stats: { hp: -10, toxicity: 5, xp: 5 },
                    isCorrect: false,
                    reason: "Exposing yourself to smog damages your health."
                },
                {
                    text: "Drive through it to work",
                    consequence: "Your car added more pollution. The smog got worse.",
                    stats: { hp: -5, toxicity: 8, xp: 0 },
                    isCorrect: false,
                    reason: "Vehicle emissions contribute to air pollution."
                }
            ]
        },
        {
            situation: "You find a bird entangled in plastic rings on your morning walk.",
            choices: [
                {
                    text: "Carefully untangle the bird",
                    consequence: "You freed the bird! It chirps gratefully and flies away.",
                    stats: { hp: 5, toxicity: -3, xp: 30 },
                    isCorrect: true,
                    reason: "Direct action saves wildlife from plastic pollution."
                },
                {
                    text: "Take a photo and post it online",
                    consequence: "While you fumbled with your phone, the bird struggled more.",
                    stats: { hp: -5, toxicity: 2, xp: 5 },
                    isCorrect: false,
                    reason: "Social media doesn't help an animal in immediate distress."
                },
                {
                    text: "Walk away - it's not your problem",
                    consequence: "The bird remains trapped. You feel a pang of guilt.",
                    stats: { hp: -8, toxicity: 5, xp: 0 },
                    isCorrect: false,
                    reason: "Ignoring environmental problems allows them to persist."
                }
            ]
        },
        {
            situation: "Your neighborhood's recycling bin is overflowing onto the street.",
            choices: [
                {
                    text: "Sort the recyclables properly",
                    consequence: "You organized the mess and prevented contamination!",
                    stats: { hp: 3, toxicity: -4, xp: 25 },
                    isCorrect: true,
                    reason: "Proper sorting ensures materials can be recycled effectively."
                },
                {
                    text: "Burn the excess trash",
                    consequence: "Toxic fumes filled the air. Neighbors started coughing.",
                    stats: { hp: -15, toxicity: 10, xp: 0 },
                    isCorrect: false,
                    reason: "Burning waste releases harmful chemicals into the air."
                },
                {
                    text: "Push it into the storm drain",
                    consequence: "The waste flowed into the water system, contaminating it.",
                    stats: { hp: -10, toxicity: 8, xp: 0 },
                    isCorrect: false,
                    reason: "Storm drains lead to rivers and oceans, causing water pollution."
                }
            ]
        }
    ];

    // Shuffle and return requested count
    const getRandomFallbacks = (n) => {
        const shuffled = [...FALLBACK_BATCH].sort(() => Math.random() - 0.5);
        const result = [];
        for (let i = 0; i < n; i++) {
            result.push(shuffled[i % shuffled.length]);
        }
        return result;
    };

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mode: "batch",
                count: count,
                dayTheme: theme,
                hp: 100,
                toxicity: 0
            }),
        });

        if (!response.ok) {
            throw new Error(`Worker HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[DEBUG] Raw API response:", data);

        let content = data.response || data;
        console.log("[DEBUG] Extracted content:", content);

        if (typeof content === 'string') {
            // Clean up markdown if present
            const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("[DEBUG] Cleaned string content:", cleanedContent.substring(0, 200) + "...");

            try {
                const parsed = JSON.parse(cleanedContent);
                console.log("[DEBUG] Parsed JSON:", parsed);

                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Validate structure of first scenario
                    const firstScenario = parsed[0];
                    if (!firstScenario.situation || !firstScenario.choices) {
                        throw new Error("Invalid scenario structure: missing 'situation' or 'choices'");
                    }
                    console.log("[DEBUG] Validation passed, returning scenarios");
                    return { scenarios: parsed.slice(0, count), error: null };
                } else {
                    return {
                        scenarios: getRandomFallbacks(count),
                        error: `[DEV] Parsed JSON is not a valid array.\n\nReceived type: ${typeof parsed}\nIs Array: ${Array.isArray(parsed)}\nLength: ${parsed?.length || 0}\n\nRaw response (first 300 chars):\n${cleanedContent.substring(0, 300)}`
                    };
                }
            } catch (parseError) {
                console.error("[DEBUG] JSON Parse Error:", parseError);
                return {
                    scenarios: getRandomFallbacks(count),
                    error: `[DEV] JSON Parse Failed.\n\nError: ${parseError.message}\n\nExpected format:\n[{ "situation": "...", "choices": [...] }]\n\nActual response (first 500 chars):\n${cleanedContent.substring(0, 500)}`
                };
            }
        }

        // Content is already an object/array
        if (Array.isArray(content) && content.length > 0) {
            console.log("[DEBUG] Content is already array, returning");
            return { scenarios: content.slice(0, count), error: null };
        }

        // Unexpected format
        return {
            scenarios: getRandomFallbacks(count),
            error: `[DEV] Unexpected response format.\n\nExpected: JSON array of scenarios\nReceived type: ${typeof content}\n\nRaw response:\n${JSON.stringify(content).substring(0, 500)}`
        };

    } catch (error) {
        console.error("[DEBUG] Fetch/Network Error:", error);
        return {
            scenarios: getRandomFallbacks(count),
            error: `[DEV] Network/Fetch Error.\n\nError: ${error.message}\n\nWorker URL: ${WORKER_URL}\n\nCheck:\n1. Worker deployed?\n2. CORS enabled?\n3. Network connection?`
        };
    }
};

/**
 * Smart Scenario Parser - detects complete scenario objects in a stream
 * without needing the entire JSON array to be complete
 * NOW HANDLES SSE FORMAT from Cloudflare AI
 */
class SmartScenarioParser {
    constructor() {
        this.rawBuffer = '';      // Raw SSE data
        this.buffer = '';         // Extracted JSON content
        this.parsedScenarios = [];
        this.debugLogs = [];
    }

    log(msg) {
        console.log(`[PARSER] ${msg}`);
        this.debugLogs.push(msg);
    }

    /**
     * Parse SSE format: data: {"response":"...","p":"..."}
     * Extracts response field and appends to buffer
     */
    addChunk(chunk) {
        this.rawBuffer += chunk;

        // Split by newlines and process each line
        const lines = chunk.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) continue;

            // Check for SSE data format
            if (trimmed.startsWith('data: ')) {
                const dataContent = trimmed.substring(6); // Remove "data: "

                // Skip [DONE] marker
                if (dataContent === '[DONE]') {
                    this.log('Stream finished');
                    continue;
                }

                // Parse the SSE JSON payload
                try {
                    const sseData = JSON.parse(dataContent);
                    if (sseData.response !== undefined) {
                        this.buffer += sseData.response;
                    }
                } catch (e) {
                    // Not valid JSON, might be partial - skip
                }
            } else {
                // Not SSE format, treat as raw content
                this.buffer += trimmed;
            }
        }
    }

    /**
     * Find a complete JSON object starting at position
     * Uses brace counting with string awareness
     */
    findCompleteObject(startPos) {
        let depth = 0;
        let inString = false;
        let escapeNext = false;

        for (let i = startPos; i < this.buffer.length; i++) {
            const char = this.buffer[i];

            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if (char === '"' && !escapeNext) {
                inString = !inString;
                continue;
            }
            if (inString) continue;

            if (char === '{') depth++;
            if (char === '}') {
                depth--;
                if (depth === 0) {
                    return { complete: true, endPos: i + 1 };
                }
            }
        }

        return { complete: false, endPos: -1 };
    }

    /**
     * Validate scenario has all required fields
     */
    isValidScenario(obj) {
        if (!obj?.situation || !Array.isArray(obj?.choices)) return false;
        if (obj.choices.length < 2) return false;

        for (const c of obj.choices) {
            if (!c.text || !c.consequence || !c.stats || typeof c.isCorrect !== 'boolean') {
                return false;
            }
        }
        return true;
    }

    /**
     * Try to extract complete scenarios from buffer
     */
    tryExtractScenarios() {
        const newScenarios = [];
        const clean = this.buffer.replace(/```json/g, '').replace(/```/g, '');

        let searchPos = 0;
        while (true) {
            // Find next scenario start
            let idx = clean.indexOf('{"situation"', searchPos);
            if (idx === -1) idx = clean.indexOf('{ "situation"', searchPos);
            if (idx === -1) break;

            // Find in original buffer
            const bufferIdx = this.buffer.indexOf(clean.substring(idx, idx + 30));
            if (bufferIdx === -1) {
                searchPos = idx + 1;
                continue;
            }

            const result = this.findCompleteObject(bufferIdx);

            if (result.complete) {
                const objStr = this.buffer.substring(bufferIdx, result.endPos);
                try {
                    const scenario = JSON.parse(objStr);

                    // Check valid and not duplicate
                    if (this.isValidScenario(scenario)) {
                        const isDupe = this.parsedScenarios.some(s => s.situation === scenario.situation);
                        if (!isDupe) {
                            this.log(`✓ Scenario ready: "${scenario.situation.substring(0, 35)}..."`);
                            this.parsedScenarios.push(scenario);
                            newScenarios.push(scenario);
                        }
                    }
                } catch (e) {
                    // Parse failed, not complete yet
                }
            }

            searchPos = idx + 1;
        }

        return newScenarios;
    }

    getDebugInfo() {
        return {
            rawBufferLength: this.rawBuffer.length,
            extractedBufferLength: this.buffer.length,
            bufferStart: this.buffer.substring(0, 500),
            bufferEnd: this.buffer.slice(-300),
            count: this.parsedScenarios.length,
            logs: this.debugLogs.slice(-15)
        };
    }
}

/**
 * STREAMING VERSION: Generate scenarios with progressive parsing
 * Calls onScenarioReady as each scenario is parsed from the stream
 * 
 * @param {number} count - Number of scenarios
 * @param {string} theme - Current day theme
 * @param {function} onScenarioReady - Callback called with each parsed scenario
 * @param {function} onComplete - Callback when all scenarios are done
 * @param {function} onError - Callback if error occurs
 */
export const generateBatchScenariosStreaming = async (count, theme, onScenarioReady, onComplete, onError) => {
    // Fallback scenarios for errors
    const FALLBACK_BATCH = [
        {
            situation: "A sudden smog cloud descends upon the city, making it hard to breathe.",
            choices: [
                { text: "Stay indoors and close windows", consequence: "You protected yourself!", stats: { hp: 5, toxicity: -2, xp: 20 }, isCorrect: true, reason: "Reducing exposure protects health." },
                { text: "Go outside to investigate", consequence: "You inhaled harmful particles.", stats: { hp: -10, toxicity: 5, xp: 5 }, isCorrect: false, reason: "Smog damages your lungs." },
                { text: "Drive through it", consequence: "Your car added more pollution.", stats: { hp: -5, toxicity: 8, xp: 0 }, isCorrect: false, reason: "Vehicles add to pollution." }
            ]
        },
        {
            situation: "You find a bird tangled in plastic rings.",
            choices: [
                { text: "Carefully untangle it", consequence: "You saved the bird!", stats: { hp: 5, toxicity: -3, xp: 30 }, isCorrect: true, reason: "Direct action saves wildlife." },
                { text: "Take a photo for social media", consequence: "The bird kept struggling.", stats: { hp: -5, toxicity: 2, xp: 5 }, isCorrect: false, reason: "Photos don't help animals." },
                { text: "Walk away", consequence: "The bird remains trapped.", stats: { hp: -8, toxicity: 5, xp: 0 }, isCorrect: false, reason: "Ignoring problems doesn't help." }
            ]
        },
        {
            situation: "The neighborhood recycling bin is overflowing.",
            choices: [
                { text: "Sort the recyclables", consequence: "You prevented contamination!", stats: { hp: 3, toxicity: -4, xp: 25 }, isCorrect: true, reason: "Sorting ensures proper recycling." },
                { text: "Burn the excess", consequence: "Toxic fumes filled the air.", stats: { hp: -15, toxicity: 10, xp: 0 }, isCorrect: false, reason: "Burning releases toxins." },
                { text: "Push it into the drain", consequence: "You contaminated the water.", stats: { hp: -10, toxicity: 8, xp: 0 }, isCorrect: false, reason: "Drains lead to water systems." }
            ]
        }
    ];

    const getRandomFallbacks = (n) => {
        const shuffled = [...FALLBACK_BATCH].sort(() => Math.random() - 0.5);
        const result = [];
        for (let i = 0; i < n; i++) {
            result.push(shuffled[i % shuffled.length]);
        }
        return result;
    };

    try {
        console.log("[STREAM] Starting streaming request...");

        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mode: "batch",
                stream: true, // Tell worker to stream
                count: count,
                dayTheme: theme,
                hp: 100,
                toxicity: 0
            }),
        });

        if (!response.ok) {
            throw new Error(`Worker HTTP Error: ${response.status}`);
        }

        // Check if response is actually streamed
        if (!response.body) {
            console.log("[STREAM] No stream body, falling back to regular parsing");
            const data = await response.json();
            const content = data.response || data;
            const scenarios = typeof content === 'string' ? JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim()) : content;
            scenarios.forEach((s, i) => onScenarioReady(s, i));
            onComplete(scenarios);
            return;
        }

        // Use SmartScenarioParser for robust parsing
        const parser = new SmartScenarioParser();
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunkCount = 0;

        // Read stream chunks
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                console.log(`[STREAM] Stream finished after ${chunkCount} chunks`);
                break;
            }

            chunkCount++;
            const chunk = decoder.decode(value, { stream: true });
            console.log(`[STREAM] Chunk ${chunkCount}: ${chunk.length} chars`);

            parser.addChunk(chunk);

            // Try to extract complete scenarios
            const newScenarios = parser.tryExtractScenarios();
            for (const scenario of newScenarios) {
                const index = parser.parsedScenarios.indexOf(scenario);
                console.log(`[STREAM] Emitting scenario ${index + 1}`);
                onScenarioReady(scenario, index);
            }
        }

        // Final extraction attempt
        const finalScenarios = parser.tryExtractScenarios();
        for (const scenario of finalScenarios) {
            const index = parser.parsedScenarios.indexOf(scenario);
            onScenarioReady(scenario, index);
        }

        // Check results
        const totalFound = parser.parsedScenarios.length;
        console.log(`[STREAM] Total scenarios: ${totalFound}`);

        if (totalFound === 0) {
            const debug = parser.getDebugInfo();
            const errorMsg = `[DEV] No scenarios parsed from stream.

Chunks: ${chunkCount}
Raw SSE: ${debug.rawBufferLength} chars
Extracted JSON: ${debug.extractedBufferLength} chars

Extracted content:
${debug.bufferStart}

Parser logs:
${debug.logs.join('\n')}

If extracted is 0, SSE parsing failed.
If extracted > 0, scenario structure invalid.`;

            onError?.(errorMsg);
            onComplete([]);
            return;
        }

        if (totalFound < count) {
            console.warn(`[STREAM] Partial: ${totalFound}/${count} scenarios`);
        }

        onComplete(parser.parsedScenarios.slice(0, count));

    } catch (error) {
        console.error("[STREAM] Fatal error:", error);

        const errorMsg = `[DEV] Streaming failed.

Error: ${error.message}

Worker URL: ${WORKER_URL}

Check:
1. Deploy updated streaming worker
2. Check worker logs
3. Verify network`;

        onError?.(errorMsg);
        onComplete([]);
    }
};
