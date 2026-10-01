import type { LessonContent } from "./types";
import { getDay, targetSoundNote } from "./curriculum";

/**
 * Fully authored lessons for Days 1–7. Days 8–70 are generated once by
 * Gemini and cached; `templateLesson()` below is the offline fallback so a
 * lesson page is never empty.
 */
export const AUTHORED_LESSONS: Record<number, LessonContent> = {
  1: {
    day: 1,
    title: "Meet a New Client — Introduce Yourself with Confidence",
    source: "authored",
    targetSound: "/v/ vs /w/",
    targetSoundNote: targetSoundNote("v-w"),
    dialogue: [
      { speaker: "Client (Sarah)", line: "Hi! Thanks for joining the call. Can you tell me a little about yourself?", urdu: "Client pooch raha hai: apne baare mein kuch batayein." },
      { speaker: "You", line: "Of course. My name is Dawood, and I am a website developer from Pakistan. I have been building websites for local and international clients for over two years." },
      { speaker: "Client (Sarah)", line: "Great. What kind of websites do you usually build?" },
      { speaker: "You", line: "I mostly build business websites and online stores. I work with modern tools, and I always deliver the project in versions, so you can review every step." },
      { speaker: "Client (Sarah)", line: "That sounds good. We need a website for our travel company." },
      { speaker: "You", line: "Wonderful. I would love to work on it. Before we start, could you tell me what your visitors should do on the website — book a tour, or contact you first?" },
      { speaker: "Client (Sarah)", line: "Mostly book a tour. Can you send me some of your previous work?" },
      { speaker: "You", line: "Absolutely. I will send you five links today, and we can have a second call this week to discuss the details." },
    ],
    shadowing: [
      "I have been building websites for over two years.",
      "I always deliver the project in versions.",
      "Could you tell me what your visitors should do?",
      "I will send you five links today.",
      "We can have a second call this week.",
    ],
    listeningText:
      "When you meet a new client, the first sixty seconds matter the most. The client is not only checking your skills — they are checking whether communication with you will be easy. Speak slowly, use short sentences, and finish with a question. A question shows confidence and keeps the conversation moving. Always repeat the client's main need in your own words before you finish the call. This small habit prevents most misunderstandings later.",
    listeningQuestions: [
      { q: "What is the client checking in the first minute?", options: ["Only your prices", "Your skills and how easy communication will be", "Your office location"], answer: 1 },
      { q: "What should you do at the end of the call?", options: ["Send the invoice immediately", "Repeat the client's main need in your own words", "Talk about your other clients"], answer: 1 },
      { q: "Why should you finish with a question?", options: ["It shows confidence and keeps the conversation moving", "It makes the call longer", "It hides your weak English"], answer: 0 },
    ],
    drills: [
      { sentence: "We will develop a wonderful website.", note: "we → lips round; develop → teeth on lip" },
      { sentence: "I have five years of experience with WordPress." },
      { sentence: "Welcome to our village office." },
      { sentence: "The video will be ready on Wednesday." },
      { sentence: "We value every visitor to the website." },
      { sentence: "Which version would you like to review?" },
    ],
    speakingPrompt:
      "Record 1–2 minutes: introduce yourself to a new client. Say your name, where you are from, what you build, how long you have worked, and finish with one question for the client.",
    writingPrompt:
      "Write 4 sentences about yourself as a developer: your skills, your experience, the kind of clients you like, and one goal for this year.",
    phrases: [
      { en: "Let me introduce myself.", urdu: "Mein apna taaruf karwa dun." },
      { en: "I have been working as a developer for two years.", urdu: "Mein do saal se developer ke tor par kaam kar raha hun." },
      { en: "Could you tell me more about your project?", urdu: "Kya aap apne project ke baare mein mazeed bata sakte hain?" },
      { en: "I will send you some of my previous work.", urdu: "Mein aap ko apna pichla kaam bhej dunga." },
      { en: "Let us have a second call this week.", urdu: "Is hafte hum dusri call kar lete hain." },
    ],
    vocab: [
      { word: "deliver", meaning: "to finish and hand over work", example: "I will deliver the first version on Friday." },
      { word: "visitor", meaning: "a person who opens your website", example: "Every visitor should find the price quickly." },
      { word: "previous", meaning: "from an earlier time", example: "Please see my previous projects." },
      { word: "discuss", meaning: "to talk about something in detail", example: "We will discuss the design on the call." },
      { word: "version", meaning: "one stage of a product", example: "This is version one of the homepage." },
    ],
  },
  2: {
    day: 2,
    title: "My Daily Routine — Talking About Your Day",
    source: "authored",
    targetSound: "th — /θ/ and /ð/",
    targetSoundNote: targetSoundNote("th"),
    dialogue: [
      { speaker: "Friend (Tom)", line: "So, what does a normal day look like for you?", urdu: "Dost pooch raha hai: tumhara aam din kaisa hota hai?" },
      { speaker: "You", line: "I usually wake up early, around five thirty. First, I pray, then I have breakfast with my family." },
      { speaker: "Friend (Tom)", line: "That's early! What do you do after that?" },
      { speaker: "You", line: "I start work at nine. I check my messages, think about the day's tasks, and then I write code until lunch." },
      { speaker: "Friend (Tom)", line: "And in the evening?" },
      { speaker: "You", line: "In the evening I go for a walk with my brother. We talk about everything — work, cricket, family. Then I study English for thirty minutes before dinner." },
      { speaker: "Friend (Tom)", line: "Thirty minutes every day? That's a good habit." },
      { speaker: "You", line: "Yes. I think small habits are stronger than big plans." },
    ],
    shadowing: [
      "I usually wake up early, around five thirty.",
      "First, I pray, then I have breakfast with my family.",
      "I think about the day's tasks.",
      "We talk about everything — work, cricket, family.",
      "Small habits are stronger than big plans.",
    ],
    listeningText:
      "Most people think fluency comes from learning difficult words. This is not true. Fluency comes from talking easily about normal things: your morning, your work, your family, your food. These topics appear in every conversation, in every country. If you can describe your own day without stopping, you already own the most useful English in the world. Practise your routine until it feels boring — boring means automatic, and automatic means fluent.",
    listeningQuestions: [
      { q: "What does real fluency come from?", options: ["Difficult words", "Talking easily about normal things", "Expensive courses"], answer: 1 },
      { q: "Which topics appear in every conversation?", options: ["Politics and science", "Your morning, work, family and food", "Grammar rules"], answer: 1 },
      { q: "What does 'boring' mean in this text?", options: ["Bad practice", "The skill has become automatic", "You should stop practising"], answer: 1 },
    ],
    drills: [
      { sentence: "I think about three things every morning.", note: "think, three — tongue out, no voice" },
      { sentence: "This is my brother, and that is his mother." },
      { sentence: "Thank you for everything." },
      { sentence: "They bathe the baby on Thursdays." },
      { sentence: "The weather is healthy this month." },
      { sentence: "Breathe with your mouth open." },
    ],
    speakingPrompt:
      "Record 1–2 minutes: describe your full day, from waking up to sleeping. Use time words: first, then, after that, in the evening, finally.",
    writingPrompt:
      "Write 4–5 sentences about your routine on a free day (Sunday). How is it different from a work day?",
    phrases: [
      { en: "I usually wake up around…", urdu: "Mein aam tor par … baje uthta hun." },
      { en: "After that, I…", urdu: "Us ke baad, mein…" },
      { en: "On weekdays I…, but on Sundays I…", urdu: "Hafte ke dinon mein…, lekin Itwaar ko…" },
      { en: "Before dinner, I study for thirty minutes.", urdu: "Khane se pehle, mein tees minute parhta hun." },
      { en: "That's my normal routine.", urdu: "Ye meri aam routine hai." },
    ],
    vocab: [
      { word: "usually", meaning: "most of the time", example: "I usually start work at nine." },
      { word: "routine", meaning: "the things you do regularly", example: "A good routine saves energy." },
      { word: "habit", meaning: "something you do again and again", example: "Reading is a healthy habit." },
      { word: "until", meaning: "up to a time", example: "I work until lunch." },
      { word: "stronger", meaning: "more powerful", example: "Small habits are stronger than big plans." },
    ],
  },
  3: {
    day: 3,
    title: "Talk About Your Skills — The Interview Question",
    source: "authored",
    targetSound: "Word stress",
    targetSoundNote: targetSoundNote("stress"),
    dialogue: [
      { speaker: "Interviewer", line: "Welcome. So — what would you say is your biggest strength?", urdu: "Interviewer pooch raha hai: aap ki sab se bari khoobi kya hai?" },
      { speaker: "You", line: "Thank you. My biggest strength is that I am reliable. When I promise a date, I deliver on that date." },
      { speaker: "Interviewer", line: "Can you give me an example?" },
      { speaker: "You", line: "Certainly. Last year, a client's shop had to open before Eid. The deadline was very tight. I planned the work in small parts, finished two days early, and the shop opened on time." },
      { speaker: "Interviewer", line: "And what about a weakness?" },
      { speaker: "You", line: "Honestly, my spoken English is still improving. That is why I practise every day. For written work — emails and documents — I am fully comfortable." },
      { speaker: "Interviewer", line: "I appreciate the honest answer. How do you keep improving?" },
      { speaker: "You", line: "I follow a daily plan: speaking practice, listening, and a review of my mistakes every evening." },
    ],
    shadowing: [
      "My biggest strength is that I am reliable.",
      "When I promise a date, I deliver on that date.",
      "The deadline was very tight.",
      "I planned the work in small parts.",
      "I follow a daily plan.",
    ],
    listeningText:
      "Interviewers ask about strengths because they want proof, not adjectives. Anyone can say 'I am hardworking.' A strong answer gives a real example with a result: the situation, your action, and what happened in the end. Notice the order — example first, quality second. Also notice the honest weakness answer. It names a real weakness, shows a system for fixing it, and finishes with a strength. That structure turns a dangerous question into a good moment.",
    listeningQuestions: [
      { q: "What do interviewers really want when they ask about strengths?", options: ["Adjectives", "Proof — a real example with a result", "Your certificates"], answer: 1 },
      { q: "What is the order of a strong answer?", options: ["Quality first, example later", "Example first, quality second", "Only the result matters"], answer: 1 },
      { q: "A good weakness answer has three parts. Which set is correct?", options: ["Weakness, excuse, complaint", "Real weakness, a fixing system, a closing strength", "Joke, weakness, apology"], answer: 1 },
    ],
    drills: [
      { sentence: "I am a deVELoper, and I am reLIable.", note: "stress the capital syllables" },
      { sentence: "The DEADline was very tight." },
      { sentence: "She gave an exCELlent PREsentation." },
      { sentence: "We need to deCIDE the IMportant things first." },
      { sentence: "His aBILity to MANage time is imPRESSive." },
      { sentence: "COMfortable work needs good COMmunication." },
    ],
    speakingPrompt:
      "Record 1–2 minutes: answer 'What is your biggest strength?' Use the structure: strength → real example → result. Then name one weakness and your system for fixing it.",
    writingPrompt:
      "Write 4 sentences: one about your strength with an example, one about a weakness, and two about how you are improving it.",
    phrases: [
      { en: "My biggest strength is…", urdu: "Meri sab se bari khoobi hai…" },
      { en: "Let me give you an example.", urdu: "Mein aap ko ek misaal deta hun." },
      { en: "As a result, the project finished on time.", urdu: "Nateeja ye hua ke project waqt par mukammal ho gaya." },
      { en: "Honestly, I am still improving my…", urdu: "Sach ye hai ke mein abhi apni … behtar bana raha hun." },
      { en: "I practise every day to improve it.", urdu: "Mein usay behtar karne ke liye roz practice karta hun." },
    ],
    vocab: [
      { word: "reliable", meaning: "people can trust you to do what you promised", example: "A reliable developer answers messages on time." },
      { word: "tight deadline", meaning: "very little time to finish", example: "We had a tight deadline before Eid." },
      { word: "strength", meaning: "a good quality or skill", example: "Patience is her strength." },
      { word: "weakness", meaning: "an area that needs improvement", example: "He is honest about his weakness." },
      { word: "improve", meaning: "to make or become better", example: "I improve a little every day." },
    ],
  },
};

AUTHORED_LESSONS[4] = {
  day: 4,
  title: "Asking Good Questions — Learning Without Shame",
  source: "authored",
  targetSound: "Schwa /ə/ — the weak vowel",
  targetSoundNote: targetSoundNote("schwa"),
  dialogue: [
    { speaker: "Teacher", line: "Today we learned about past tenses. Does anyone have a question?", urdu: "Teacher pooch raha hai: kisi ka koi sawal hai?" },
    { speaker: "You", line: "Excuse me, could you explain the difference between 'I have done' and 'I did' again?" },
    { speaker: "Teacher", line: "Of course. 'I did' is a finished past action. 'I have done' connects the past to the present — the result still matters now." },
    { speaker: "You", line: "So if I finished my homework an hour ago, which one is better?" },
    { speaker: "Teacher", line: "Both work, but 'I have done my homework' sounds more natural — the result is still with you now." },
    { speaker: "You", line: "Could you give me one more example with 'already'?" },
    { speaker: "Teacher", line: "Certainly: 'I have already sent the email.' You cannot say 'I already sent' in British English, but Americans say it all the time." },
    { speaker: "You", line: "That's very clear. Thank you for the examples." },
  ],
  shadowing: [
    "Could you explain the difference again?",
    "The result still matters now.",
    "Could you give me one more example?",
    "That's very clear.",
    "Thank you for the examples.",
  ],
  listeningText:
    "A good question has three parts: a polite opening, one clear question, and a thank-you. Never ask three questions at once — the other person will forget the first two. The best students are not the ones who understand everything; they are the ones who ask clearly about the parts they do not understand. In English, a question like 'Could you explain X again?' is never rude. It is respectful. It says: your explanation is worth hearing a second time.",
  listeningQuestions: [
    { q: "A good question has which three parts?", options: ["Long story, two questions, silence", "Polite opening, one clear question, thank-you", "Apology, joke, question"], answer: 1 },
    { q: "Who are the best students?", options: ["Those who understand everything", "Those who ask clearly about what they don't understand", "Those who stay silent"], answer: 1 },
    { q: "'Could you explain X again?' is…", options: ["Rude", "Respectful", "A waste of time"], answer: 1 },
  ],
  drills: [
    { sentence: "Could you repeat that again?", note: "uh-GAIN — first 'a' shrinks to schwa" },
    { sentence: "About the lesson, it's better to ask." },
    { sentence: "The teacher explained the common mistake." },
    { sentence: "I support the doctor's suggestion." },
    { sentence: "Above the door, there's a sofa." },
    { sentence: "A banana a day keeps the doctor away." },
  ],
  speakingPrompt:
    "Record 1–2 minutes: ask three questions about something you learned this week (English, coding, anything). Use the polite pattern: opening → question → thank-you.",
  writingPrompt:
    "Write 4 sentences: two questions you would ask a teacher, and two questions you would ask a client about a project.",
  phrases: [
    { en: "Excuse me, could you explain… again?", urdu: "Maaf kijiye, kya aap … dobara samjha sakte hain?" },
    { en: "So if I…, which one is better?", urdu: "To agar mein…, to kaun sa behtar hai?" },
    { en: "Could you give me one more example?", urdu: "Kya aap ek aur misaal de sakte hain?" },
    { en: "That's very clear.", urdu: "Ye bohat wazeh ho gaya." },
    { en: "Thanks for explaining.", urdu: "Samjhane ke liye shukriya." },
  ],
  vocab: [
    { word: "explain", meaning: "to make something clear", example: "Could you explain the difference?" },
    { word: "difference", meaning: "the way two things are not the same", example: "What is the difference between these?" },
    { word: "example", meaning: "something that shows the rule", example: "Give me one more example." },
    { word: "result", meaning: "what happens because of something", example: "The result still matters now." },
    { word: "natural", meaning: "sounds like a native speaker", example: "That sentence sounds natural." },
  ],
};

AUTHORED_LESSONS[5] = {
  day: 5,
  title: "The Discovery Call — Understanding the Client's Real Need",
  source: "authored",
  targetSound: "Sentence rhythm & linking",
  targetSoundNote: targetSoundNote("rhythm"),
  dialogue: [
    { speaker: "Client (David)", line: "Hi! We need a new website. Our old one is slow and nobody calls us from it.", urdu: "Client keh raha hai: purani website slow hai aur koi call nahi aati." },
    { speaker: "You", line: "Thanks for telling me. Let me ask a few questions so I understand exactly what you need. First — what does your business do?" },
    { speaker: "Client (David)", line: "We sell handmade shoes. Most of our customers are in the UK." },
    { speaker: "You", line: "Great. And when a visitor opens the website, what should they do first — see the shoes, or read about your story?" },
    { speaker: "Client (David)", line: "See the shoes, definitely. The photos should be the star of the show." },
    { speaker: "You", line: "Understood. Photos first. What about your budget and timeline — when do you need the site to be live?" },
    { speaker: "Client (David)", line: "We need it before Christmas. Budget is around two thousand pounds." },
    { speaker: "You", line: "That is clear. Let me repeat: a fast site with big shoe photos, live before Christmas, around two thousand pounds. Did I get that right?" },
  ],
  shadowing: [
    "Let me ask a few questions so I understand exactly what you need.",
    "What should they do first — see the shoes, or read about your story?",
    "The photos should be the star of the show.",
    "When do you need the site to be live?",
    "Did I get that right?",
  ],
  listeningText:
    "On a discovery call, your job is not to sell. Your job is to listen and repeat. Clients often describe the wrong solution — 'we need a new website' — when the real problem is different: their photos are bad, their prices are hidden, or their checkout is broken. Ask about goals, not features. Then repeat everything back in your own words. This one habit — the repeat-back — makes you sound professional even with simple English. The client feels heard, and you get the truth before you quote a price.",
  listeningQuestions: [
    { q: "Your job on a discovery call is…", options: ["To sell as much as possible", "To listen and repeat", "To talk about your tools"], answer: 1 },
    { q: "Clients often describe…", options: ["The real problem perfectly", "The wrong solution — the real problem is different", "Nothing useful"], answer: 1 },
    { q: "What should you ask about?", options: ["Features", "Goals", "Competitors' prices"], answer: 1 },
  ],
  drills: [
    { sentence: "Turn_it_off and start_it_again.", note: "link the words: no gaps between" },
    { sentence: "What_do_you_need? When_do_you_need_it?" },
    { sentence: "She'll_send_it_in_a_minute." },
    { sentence: "We_can_talk_about_it_tomorrow." },
    { sentence: "I've_got_a_good_idea_for_the_logo." },
    { sentence: "Could_you_repeat_that, please?" },
  ],
  speakingPrompt:
    "Record 1–2 minutes: act as the developer on a discovery call. Ask four questions (business, goal, timeline, budget) and finish with a repeat-back of what you heard.",
  writingPrompt:
    "Write 4 sentences summarising a discovery call: the business, the real problem, the goal, and the deadline.",
  phrases: [
    { en: "Let me ask a few questions so I understand exactly what you need.", urdu: "Mujhe kuch sawal poochne dein taake mein samajh sakun." },
    { en: "When do you need it to be live?", urdu: "Aap ko ye kab tak live chahiye?" },
    { en: "Let me repeat: …, did I get that right?", urdu: "Mein dohra dun: …, kya mein ne theek samjha?" },
    { en: "What should the visitor do first?", urdu: "Visitor ko sab se pehle kya karna chahiye?" },
    { en: "Thanks for telling me.", urdu: "Batane ke liye shukriya." },
  ],
  vocab: [
    { word: "goal", meaning: "what you want to achieve", example: "Our goal is more phone calls." },
    { word: "timeline", meaning: "the schedule of dates", example: "What is the timeline for launch?" },
    { word: "budget", meaning: "the money planned for something", example: "The budget is two thousand pounds." },
    { word: "repeat back", meaning: "say what you heard in your own words", example: "Let me repeat back what you said." },
    { word: "solution", meaning: "the answer to a problem", example: "The real solution is better photos." },
  ],
};

AUTHORED_LESSONS[6] = {
  day: 6,
  title: "At the Market — Numbers, Prices and Small Talk",
  source: "authored",
  targetSound: "/ʒ/ — measure, usually, decision",
  targetSoundNote: targetSoundNote("zh"),
  dialogue: [
    { speaker: "Shopkeeper", line: "As-salam-u-alaikum! Welcome, brother. Fresh tomatoes today, only two hundred rupees per kilo.", urdu: "Dukandar keh raha hai: aaj taza timatar hain." },
    { speaker: "You", line: "Wa-alaikum-as-salam. Two hundred? That's quite expensive. What about one fifty?" },
    { speaker: "Shopkeeper", line: "One fifty is too low. The price went up this week. I can do one seventy-five for you." },
    { speaker: "You", line: "Okay, one kilo of tomatoes, and half a kilo of onions. How much is the total?" },
    { speaker: "Shopkeeper", line: "That will be two hundred and forty. Anything else? We have fresh coriander." },
    { speaker: "You", line: "No, that's all. Usually I buy from the shop near the mosque, but your tomatoes look better." },
    { speaker: "Shopkeeper", line: "Thank you! Come again. I'll give you a good price next time too." },
    { speaker: "You", line: "Inshallah. Khuda hafiz!" },
  ],
  shadowing: [
    "That's quite expensive. What about one fifty?",
    "The price went up this week.",
    "How much is the total?",
    "Usually I buy from the shop near the mosque.",
    "I'll give you a good price next time too.",
  ],
  listeningText:
    "Bargaining in English uses soft words, not hard words. Never say 'Too much! Less!' — it sounds rude. Use 'That's quite expensive' and 'What about…?' The word 'usually' is powerful: 'I usually pay one fifty' tells the seller you know the real price, without a fight. Listen for the seller's real message too: 'The price went up this week' is an excuse, but it is also information. Markets, shops and taxis are the best classrooms in the world — free, daily, and very real.",
  listeningQuestions: [
    { q: "Bargaining in English uses…", options: ["Hard words like 'Too much! Less!'", "Soft words like 'That's quite expensive'", "No words at all"], answer: 1 },
    { q: "Why is 'usually' a powerful word?", options: ["It sounds fancy", "It shows you know the real price", "Sellers love it"], answer: 1 },
    { q: "'The price went up this week' is…", options: ["Only an excuse", "Only information", "An excuse that is also information"], answer: 2 },
  ],
  drills: [
    { sentence: "Usually, I measure twice before I decide.", note: "usually, measure, decision — soft 'zh', not hard 'j'" },
    { sentence: "It was a pleasure to meet you." },
    { sentence: "The television is on the usual channel." },
    { sentence: "Treasure those casual moments." },
    { sentence: "My vision of Asia is changing." },
    { sentence: "We need a revision of the pricing page." },
  ],
  speakingPrompt:
    "Record 1–2 minutes: you are at a market. Buy three things, ask prices, bargain once politely, and pay. Then tell a friend what you bought.",
  writingPrompt:
    "Write 4 sentences about shopping in your city: where you go, what is expensive this week, and how you decide.",
  phrases: [
    { en: "How much is the total?", urdu: "Kul kitne hue?" },
    { en: "That's quite expensive. What about…?", urdu: "Ye kafi mehanga hai. … ka kya khayal hai?" },
    { en: "Usually I buy from…", urdu: "Aam tor par mein … se khareedta hun." },
    { en: "The price went up this week.", urdu: "Is hafte qeemat barh gayi hai." },
    { en: "That's all. Thank you.", urdu: "Bas yehi. Shukriya." },
  ],
  vocab: [
    { word: "expensive", meaning: "costs a lot of money", example: "Two hundred is quite expensive." },
    { word: "total", meaning: "the full amount together", example: "How much is the total?" },
    { word: "usually", meaning: "normally, most times", example: "Usually I buy from that shop." },
    { word: "discount", meaning: "a lower price", example: "Can you give me a small discount?" },
    { word: "quality", meaning: "how good something is", example: "Your tomatoes are good quality." },
  ],
};

AUTHORED_LESSONS[7] = {
  day: 7,
  title: "Week 1 Review — Your First 60-Second Self-Introduction",
  source: "authored",
  targetSound: "/v/ vs /w/ + review of all Week 1 sounds",
  targetSoundNote: "This week you trained five target sounds: /v/ vs /w/, th, /ʒ/, word stress, schwa and linking. Today, repeat each drill set once and record the introduction below — it is your first fluency snapshot.",
  dialogue: [
    { speaker: "You", line: "Hello, my name is Dawood, and I am a website developer from Pakistan." },
    { speaker: "You", line: "I have been building websites for over two years — mostly for small businesses." },
    { speaker: "You", line: "My strengths are that I am reliable, I communicate clearly, and I deliver in versions." },
    { speaker: "You", line: "Right now I am improving my spoken English so I can work with clients anywhere in the world." },
    { speaker: "You", line: "I would love to work with you. Shall we have a call this week to discuss your project?" },
  ],
  shadowing: [
    "Hello, my name is Dawood, and I am a website developer.",
    "I have been building websites for over two years.",
    "I communicate clearly, and I deliver in versions.",
    "I am improving my spoken English.",
    "Shall we have a call this week?",
  ],
  listeningText:
    "One week is finished. Read these numbers carefully: seven dialogues, thirty-five shadowing lines, twenty-one listening answers, and forty-two drill sentences. That is more real English than most people speak in a month. Your fluency did not jump — fluency never jumps — but your foundation got wider. The introduction you record today is a snapshot. On Day 30, Day 60 and Day 90 you will record it again, with the same words, and you will hear your own progress. That is how motivation survives: not by feeling fluent, but by measuring the difference.",
  listeningQuestions: [
    { q: "What is the main point of this week's work?", options: ["Fluency jumps quickly", "The foundation got wider — real, measured progress", "Grammar is finished"], answer: 1 },
    { q: "Why record the same introduction again later?", options: ["To fill time", "To hear your own measured progress", "To impress the app"], answer: 1 },
    { q: "Motivation survives by…", options: ["Feeling fluent", "Measuring the difference", "Avoiding recordings"], answer: 1 },
  ],
  drills: [
    { sentence: "We will develop a wonderful website with five visitors in view." },
    { sentence: "I think this version is worth reviewing with the team." },
    { sentence: "Usually, I measure progress and make a decision on Thursdays." },
    { sentence: "The DEADline is imPORTant for reLIable deVELopers." },
    { sentence: "Could you repeat the question again, please?" },
    { sentence: "Turn_it_off and start_it_again with_a_smile." },
  ],
  speakingPrompt:
    "Record the 60-second self-introduction from the dialogue above, word for word. Speak slowly and clearly. This recording is your Week 1 snapshot — you will compare it on Day 30.",
  writingPrompt:
    "Write 5 sentences: what you learned this week, which sound was hardest, what you will do differently next week.",
  phrases: [
    { en: "I have been building websites for over two years.", urdu: "Mein do saal se zyada se websites bana raha hun." },
    { en: "My strengths are…", urdu: "Meri khoobiyan hain…" },
    { en: "Right now I am improving my…", urdu: "Is waqt mein apni … behtar bana raha hun." },
    { en: "Shall we have a call this week?", urdu: "Kya hum is hafte ek call kar lein?" },
    { en: "One week is finished — sixty-three more to go.", urdu: "Ek hafta mukammal — abhi aur baqi hain." },
  ],
  vocab: [
    { word: "snapshot", meaning: "a record of one moment, for comparison later", example: "This recording is your Week 1 snapshot." },
    { word: "foundation", meaning: "the base everything stands on", example: "This week widened your foundation." },
    { word: "measure", meaning: "to count or compare so you know the truth", example: "Measure your progress, don't guess it." },
    { word: "compare", meaning: "to look at two things side by side", example: "Compare your Day 1 and Day 30 recordings." },
    { word: "motivation", meaning: "the energy that keeps you going", example: "Small visible progress feeds motivation." },
  ],
};

/** Get a lesson: authored (days 1–7) → generated (cached in Mongo) → template. */
export async function getLesson(day: number, dbGetCached: () => Promise<LessonContent | null>) {
  if (AUTHORED_LESSONS[day]) return AUTHORED_LESSONS[day];
  const cached = await dbGetCached();
  if (cached) return cached;
  return templateLesson(day);
}

/** Offline-safe template lesson built from the day's outline. Used when no
 *  Gemini key is configured or generation hasn't happened yet. */
export function templateLesson(day: number): LessonContent {
  const o = getDay(day);
  const soundNote = targetSoundNote(o.targetSoundKey);
  const [v1, v2, v3, v4] = [...o.vocabFocus, "practice", "improve", "example", "skill"];
  return {
    day,
    title: `${o.theme}`,
    source: "template",
    targetSound: o.targetSound,
    targetSoundNote: soundNote,
    dialogue: [
      { speaker: "A", line: `Today we talk about: ${o.scenario}` },
      { speaker: "You", line: `Let me think. The most important word here is "${v1}". I want to learn how to use it in a sentence.` },
      { speaker: "A", line: `A good question. "${v1}" means you should try it in your own life first, then explain it to someone else.` },
      { speaker: "You", line: `That makes sense. And what about "${v2}"? How would you use it on a call?` },
      { speaker: "A", line: `I would say: "Our ${v2} is ${v3}." Short, clear, and easy to repeat.` },
      { speaker: "You", line: `Thank you. Let me repeat that slowly so I remember it.` },
    ],
    shadowing: [
      `Today we talk about ${o.theme.toLowerCase()}.`,
      `The most important word here is ${v1}.`,
      `Short, clear, and easy to repeat.`,
      `Let me repeat that slowly so I remember it.`,
      `Thank you. That is very clear.`,
    ],
    listeningText:
      `This lesson is about "${o.theme}". The main idea is simple: take one real situation — ${o.scenario.toLowerCase()} — and practise it until the words come without thinking. First, read the dialogue slowly and understand every line. Then shadow each line three times. Then close your eyes and say the main ideas from memory. Memory is the muscle; the dialogue is only the weight.`,
    listeningQuestions: [
      { q: "What is the main idea of this lesson?", options: ["Memorise grammar rules", `Practise "${o.theme}" until the words come without thinking`, "Avoid speaking"], answer: 1 },
      { q: "What is the 'muscle' and what is the 'weight'?", options: ["Memory is the muscle; the dialogue is the weight", "The dialogue is the muscle", "Both are weights"], answer: 0 },
    ],
    drills: [
      { sentence: `We need ${v1} before we talk about ${v2}.` },
      { sentence: `Our ${v2} is better than their ${v3}.` },
      { sentence: `Think about ${v3} and ${v4} every day.` },
      { sentence: `This is a very ${v4} example.` },
    ],
    speakingPrompt: `Record 1–2 minutes: ${o.scenario} Speak slowly, in short sentences, and finish with a question.`,
    writingPrompt: `Write 4 sentences about "${o.theme}", using at least two of these words: ${o.vocabFocus.join(", ")}.`,
    phrases: [
      { en: "Let me think about that.", urdu: "Mujhe is par sochne dein." },
      { en: "The most important thing is…", urdu: "Sab se ahem baat hai…" },
      { en: "Let me repeat that slowly.", urdu: "Mein usay aahista dohra dun." },
    ],
    vocab: o.vocabFocus.map((w) => ({ word: w, meaning: "— look it up and write your own example", example: "—" })),
  };
}
