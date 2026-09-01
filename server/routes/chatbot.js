const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// A small, deterministic knowledge base so the assistant works out of the
// box with zero external dependencies or API keys. If OPENAI_API_KEY is
// set, requests are forwarded to a real language model instead.
const KNOWLEDGE_BASE = [
  {
    keywords: ['attendance', 'check in', 'check-in', 'clock in'],
    reply:
      'You can mark your attendance from the Attendance page. Click "Check In" when you arrive and "Check Out" at the end of the day. Arriving after 9:00 AM is recorded as late.',
  },
  {
    keywords: ['certificate', 'download certificate', 'training certificate'],
    reply:
      'Certificates become available once an administrator marks a training as "completed". Open the Training & Certifications page and click "Download Certificate" next to the relevant course.',
  },
  {
    keywords: ['lesson plan', 'lesson', 'submit plan'],
    reply:
      'Lesson plans can be created from the Lesson Plans page. Save a draft while you are working on it, then submit it for administrator review and approval.',
  },
  {
    keywords: ['feedback', 'rating', 'review'],
    reply:
      'Feedback you receive is summarized on your Analytics page, including your average rating and a breakdown by category.',
  },
  {
    keywords: ['password', 'reset', 'login', 'forgot'],
    reply:
      'If you have forgotten your password, please contact your school administrator to have it reset from the Admin Dashboard.',
  },
  {
    keywords: ['points', 'badge', 'gamification', 'leaderboard'],
    reply:
      'Points are awarded by administrators for milestones such as completed training, strong feedback, and recognized achievements. Your total points and badges appear on your profile.',
  },
];

function ruleBasedReply(message) {
  const lower = message.toLowerCase();
  const match = KNOWLEDGE_BASE.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  if (match) return match.reply;
  return "I can help with attendance, training certificates, lesson plans, feedback, and account questions. Could you rephrase your question, or contact your administrator for anything account-specific?";
}

router.post('/', protect, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'A message is required' });
  }

  // Optional: forward to a real LLM if a key has been configured.
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a formal, concise assistant embedded in a school Teacher Performance & Development Tracking System. Help teachers and administrators with attendance, training, certificates, lesson plans, and feedback questions.',
            },
            { role: 'user', content: message },
          ],
          max_tokens: 300,
        }),
      });
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return res.json({ reply, source: 'ai' });
    } catch (err) {
      // Fall through to the rule-based reply if the external call fails
    }
  }

  res.json({ reply: ruleBasedReply(message), source: 'rule-based' });
});

module.exports = router;
