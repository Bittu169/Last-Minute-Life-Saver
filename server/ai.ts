import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Gemini SDK if key exists
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Helper to retry asynchronous operations with exponential backoff for robustness
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 4, delay = 800): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = (error.message || String(error)).toLowerCase();
    
    // Check if we hit a hard daily or project quota limit where retrying is futile
    const isPermanentQuotaExceeded = 
      errorStr.includes('quota exceeded') || 
      errorStr.includes('exceeded your current quota') || 
      errorStr.includes('resource_exhausted') || 
      errorStr.includes('limit: 20');
      
    if (isPermanentQuotaExceeded) {
      // Do not waste time retrying if the daily limit of 20 free requests is fully exhausted
      throw new Error('Gemini API Quota Exceeded. Using local rules-based fallback engine.');
    }

    const isRateLimit = errorStr.includes('429') || (error.status === 429);
    const isServiceUnavailable = errorStr.includes('503') || (error.status === 503);
    const isOverloaded = errorStr.includes('overloaded') || errorStr.includes('unavailable') || errorStr.includes('demand') || errorStr.includes('temporarily');
    
    if ((isRateLimit || isServiceUnavailable || isOverloaded) && retries > 0) {
      console.log(`[AI SERVICE] Transient issue encountered. Retrying in ${delay}ms (${retries} attempts remaining).`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

/**
 * Fallback AI prioriterizer in case API key is missing or calls fail.
 */
function fallbackPrioritize(title: string, deadlineStr: string): { priority: 'High' | 'Medium' | 'Low', reason: string } {
  const daysDiff = (new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  let priority: 'High' | 'Medium' | 'Low' = 'Medium';
  let reason = 'Based on proximity to deadline.';
  
  if (daysDiff <= 1.5) {
    priority = 'High';
    reason = `Critical: Due in ${daysDiff.toFixed(1)} days. High priority to prevent late completion.`;
  } else if (daysDiff > 5) {
    priority = 'Low';
    reason = `Relaxed: Due in ${daysDiff.toFixed(0)} days. Ample time remains for scheduling.`;
  } else {
    priority = 'Medium';
    reason = `Important: Due in ${daysDiff.toFixed(0)} days. Routine prioritization applied.`;
  }
  return { priority, reason };
}

/**
 * AI Prioritization: Urgency & Importance Analyzer
 */
export async function analyzeTaskPriority(
  title: string,
  description: string,
  deadline: string,
  category: string,
  estimatedDuration: number
): Promise<{ priority: 'High' | 'Medium' | 'Low', reason: string }> {
  if (!ai) {
    return fallbackPrioritize(title, deadline);
  }

  try {
    const prompt = `Analyze this upcoming task and assign a priority (High, Medium, or Low) based on deadline proximity, estimated duration, category, and urgency.
Task: ${title}
Description: ${description}
Category: ${category}
Deadline: ${deadline} (Current time is ${new Date().toISOString()})
Estimated Completion Time: ${estimatedDuration} minutes

Provide a concise explanation (1-2 sentences) of why this priority was assigned. Ensure response conforms to the JSON schema.`;

    const response = await callWithRetry(() => ai!.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: ['High', 'Medium', 'Low'],
              description: 'The assigned priority rating.',
            },
            reason: {
              type: Type.STRING,
              description: 'A brief, action-oriented explanation of the assignment (e.g. Due tomorrow and requires 4 hours of work. High priority.)',
            }
          },
          required: ['priority', 'reason'],
        }
      }
    }));

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return {
        priority: data.priority as 'High' | 'Medium' | 'Low',
        reason: data.reason || 'Automatically analyzed by AI companion.'
      };
    }
  } catch (error: any) {
    console.log('Gemini Priority Analysis fallback logic executed.');
  }
  return fallbackPrioritize(title, deadline);
}

/**
 * AI Task Breakplanner (Subtasks Generator)
 */
export async function generateTaskBreakdown(
  title: string,
  description: string
): Promise<{ title: string, duration: number }[]> {
  const fallback = [
    { title: 'Initial preparation & resource gathering', duration: 30 },
    { title: 'Core implementation & execution phase', duration: 90 },
    { title: 'Testing, verification, and feedback', duration: 45 },
    { title: 'Final cleanup and submission prep', duration: 30 }
  ];

  if (!ai) return fallback;

  try {
    const prompt = `Break down the following major project task into 3 to 6 logical, sequential subtasks. Estimate the duration of each subtask in minutes.
Task Title: ${title}
Description: ${description}

Conform strictly to the response JSON schema containing an array of subtasks.`;

    const response = await callWithRetry(() => ai!.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Descriptive subtask title.' },
              duration: { type: Type.INTEGER, description: 'Duration in minutes.' }
            },
            required: ['title', 'duration']
          }
        }
      }
    }));

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error: any) {
    console.log('Gemini Task Breakplanner fallback logic executed.');
  }
  return fallback;
}

/**
 * Hour-by-Hour Smart Scheduling Assistant
 */
export async function generateDailySchedule(
  workingHours: { start: string, end: string },
  tasks: any[],
  freeTimeSlotCount: number = 4
): Promise<{ time: string, taskTitle: string, type: 'work' | 'personal' | 'buffer' | 'break', duration: number }[]> {
  
  const fallback = [
    { time: '09:00 AM', taskTitle: 'Review Daily Priorities', type: 'buffer' as const, duration: 30 },
    { time: '09:30 AM', taskTitle: tasks[0]?.title || 'Tackle Outstanding Tasks', type: 'work' as const, duration: 120 },
    { time: '11:30 AM', taskTitle: 'Mid-day Break & Refresh', type: 'break' as const, duration: 30 },
    { time: '12:00 PM', taskTitle: 'Secondary Priority Focus', type: 'work' as const, duration: 90 },
    { time: '01:30 PM', taskTitle: 'Lunch & Relax', type: 'break' as const, duration: 60 },
    { time: '02:30 PM', taskTitle: tasks[1]?.title || 'Administrative Work / Email / Calls', type: 'personal' as const, duration: 60 },
    { time: '03:30 PM', taskTitle: 'Check Upcoming Deadlines & Wrap Up', type: 'buffer' as const, duration: 30 }
  ];

  if (!ai || tasks.length === 0) return fallback;

  try {
    const prompt = `Create an optimized hour-by-hour daily schedule starting at ${workingHours.start} and ending at ${workingHours.end}.
Outstanding Tasks to schedule:
${tasks.map(t => `- ${t.title} (Category: ${t.category}, Priority: ${t.priority}, Duration: ${t.estimatedDuration} mins, Deadline: ${t.deadline})`).join('\n')}

Rules:
1. Schedule high priority tasks first, preferably in morning hours.
2. Intersperse necessary short breaks (type: 'break') and buffers (type: 'buffer') so the user doesn't burn out.
3. Keep times clean (e.g. "09:00 AM", "10:30 AM", "01:00 PM").
4. Respond in the requested JSON structure.`;

    const response = await callWithRetry(() => ai!.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: 'Formatted time string (e.g. 09:00 AM)' },
              taskTitle: { type: Type.STRING, description: 'The task title or activity name' },
              type: { type: Type.STRING, enum: ['work', 'personal', 'buffer', 'break'] },
              duration: { type: Type.INTEGER, description: 'Estimated block duration in minutes' }
            },
            required: ['time', 'taskTitle', 'type', 'duration']
          }
        }
      }
    }));

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error: any) {
    console.log('Gemini Scheduling fallback logic executed.');
  }
  return fallback;
}

/**
 * Personal Performance Coach & Predictive Analytics
 */
export async function generateProductivityInsights(
  analytics: any[],
  tasks: any[],
  activeHours: string[]
): Promise<{ bestTime: string, efficiencyRate: number, focusRecommendation: string, habitsAdvice: string }> {
  const fallback = {
    bestTime: activeHours.join(' and ') || 'Morning (9:00 AM - 12:00 PM)',
    efficiencyRate: 80,
    focusRecommendation: 'Tackle High-Priority and bulky Study/Work assignments early during your active hours. Block off 90-minute hyper-focus sessions.',
    habitsAdvice: 'You are on a good streak! Complete daily habits early to build momentum.'
  };

  if (!ai || analytics.length === 0) return fallback;

  try {
    const prompt = `Analyze the user's historical productivity logs and active profile.
Historical logs (past days):
${JSON.stringify(analytics)}

Active Hours setting: ${activeHours.join(', ')}
Pending items: ${tasks.length} tasks outstanding.

Provide a personalized evaluation:
1. Estimate "bestTime" to work.
2. Estimate "efficiencyRate" (percentage 0-100).
3. Provide an actionable "focusRecommendation" (concrete study/work style advice).
4. Provide customized "habitsAdvice".
Conform strictly to the schema.`;

    const response = await callWithRetry(() => ai!.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestTime: { type: Type.STRING },
            efficiencyRate: { type: Type.INTEGER },
            focusRecommendation: { type: Type.STRING },
            habitsAdvice: { type: Type.STRING }
          },
          required: ['bestTime', 'efficiencyRate', 'focusRecommendation', 'habitsAdvice']
        }
      }
    }));

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error: any) {
    console.log('Gemini Insights generation fallback logic executed.');
  }
  return fallback;
}

/**
 * Natural Language Voice Intent Processing
 */
export interface VoiceActionResponse {
  action: 'add_task' | 'show_tasks' | 'show_schedule' | 'complete_task' | 'unknown';
  parameters?: {
    title?: string;
    deadline?: string; // ISO or human description
    category?: string;
  };
  spokenAnswer: string;
}

function localParseVoiceCommand(command: string): VoiceActionResponse {
  const cmdLower = command.toLowerCase().trim();
  
  // 1. ADD TASK
  // Matches: "add task [title]", "create task [title]", "remind me to [title]", "add [title] tomorrow/today/at 5pm"
  const addTaskRegex = /^(?:add\s+task|create\s+task|remind\s+me\s+to|add)\s+(.+)$/i;
  const matchAdd = command.match(addTaskRegex);
  
  if (matchAdd || cmdLower.startsWith('add ') || cmdLower.startsWith('create ') || cmdLower.includes('add task') || cmdLower.includes('create task')) {
    let title = matchAdd ? matchAdd[1].trim() : command;
    // Clean up title
    // Strip common prefixes from the title
    title = title.replace(/^(?:add\s+task|create\s+task|remind\s+me\s+to|add|create)\s+/gi, '').trim();
    
    let deadline = new Date(Date.now() + 86400000).toISOString(); // Default to tomorrow
    if (cmdLower.includes('today')) {
      deadline = new Date().toISOString();
      title = title.replace(/\btoday\b/gi, '').trim();
    } else if (cmdLower.includes('tomorrow')) {
      deadline = new Date(Date.now() + 86400000).toISOString();
      title = title.replace(/\btomorrow\b/gi, '').trim();
    }
    
    // Clean up remaining words
    title = title.replace(/\s+at\s+\d+.*$/gi, '').trim(); // strip "at 5pm" style
    title = title.replace(/\s+for\s+.*$/gi, '').trim(); // strip "for tomorrow" style
    
    // Remove trailing periods or question marks
    title = title.replace(/[.?]+$/, '').trim();
    
    if (!title) title = 'Voice Assistant Task';

    return {
      action: 'add_task',
      parameters: { 
        title, 
        deadline,
        category: 'Personal'
      },
      spokenAnswer: `I've prepared to add the task "${title}" to your list.`
    };
  }

  // 2. SHOW TASKS / VIEW TASKS
  if (
    cmdLower.includes('show task') || 
    cmdLower.includes('view task') || 
    cmdLower.includes('list task') || 
    cmdLower.includes("what's my task") || 
    cmdLower.includes('show today') ||
    cmdLower.includes('my tasks') ||
    cmdLower.includes('open tasks')
  ) {
    return {
      action: 'show_tasks',
      spokenAnswer: 'Opening your tasks dashboard.'
    };
  }

  // 3. SHOW SCHEDULE
  if (
    cmdLower.includes('schedule') || 
    cmdLower.includes('calendar') || 
    cmdLower.includes('what is my schedule') || 
    cmdLower.includes('view schedule') ||
    cmdLower.includes('open schedule')
  ) {
    return {
      action: 'show_schedule',
      spokenAnswer: 'Here is your daily schedule.'
    };
  }

  // 4. COMPLETE TASK
  if (
    cmdLower.includes('complete') || 
    cmdLower.includes('finish') || 
    cmdLower.includes('mark') ||
    cmdLower.includes('check off')
  ) {
    let title = command.replace(/^(complete task|complete|finish|mark|check off)\s+/gi, '');
    title = title.replace(/\s+as\s+complete(d)?/gi, '').trim();
    title = title.replace(/[.?]+$/, '').trim();
    return {
      action: 'complete_task',
      parameters: { title: title || 'Task' },
      spokenAnswer: `Marking task "${title || 'Task'}" as completed.`
    };
  }

  return {
    action: 'unknown',
    spokenAnswer: `I heard "${command}". If you want to perform an action, try saying "Add task [title]", "Show tasks", "Show schedule", or "Complete task [title]".`
  };
}

export async function processVoiceCommand(
  command: string
): Promise<VoiceActionResponse> {
  if (!ai) {
    return localParseVoiceCommand(command);
  }

  try {
    const prompt = `The user gave a voice command: "${command}"
Map this command to one of these core actions:
1. add_task (User wants to add/create a task, e.g. "Add task tomorrow 5 PM")
2. show_tasks (User wants to see/list tasks, e.g. "Show today's tasks")
3. show_schedule (User wants to view their daily schedule, e.g. "What's my schedule?")
4. complete_task (User wants to check off/complete a task, e.g. "Mark assignment complete")
5. unknown (None of the above)

Provide parameters where relevant, and write a helpful, friendly "spokenAnswer" response (1-2 sentences) to read out loud to the user.`;

    const response = await callWithRetry(() => ai!.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ['add_task', 'show_tasks', 'show_schedule', 'complete_task', 'unknown'] },
            parameters: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Task title requested.' },
                deadline: { type: Type.STRING, description: 'Determined ISO string or time window of the task.' },
                category: { type: Type.STRING, description: 'Work, Study, Personal, Finance, Health, etc.' }
              }
            },
            spokenAnswer: { type: Type.STRING, description: 'Text-to-speech friendly message to speak to the user.' }
          },
          required: ['action', 'spokenAnswer']
        }
      }
    }));

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (error: any) {
    console.log('Gemini Voice Command fallback logic executed.');
  }

  // Fallback to local parsing on Gemini error
  return localParseVoiceCommand(command);
}
