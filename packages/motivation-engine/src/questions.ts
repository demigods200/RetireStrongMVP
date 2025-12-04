/**
 * Motivation Quiz Questions
 * 10-15 questions to identify user's motivation style
 */

export interface QuizQuestion {
  id: string;
  text: string;
  category: MotivatorType;
  options: QuizOption[];
}

export interface QuizOption {
  value: number; // 1-5 scale
  label: string;
}

import type { MotivatorType } from "./types.js";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "What matters most to you when starting a new wellness routine?",
    category: "purpose",
    options: [
      { value: 1, label: "Feeling stronger and more capable" },
      { value: 2, label: "Staying independent as I age" },
      { value: 3, label: "Being able to travel and enjoy life" },
      { value: 4, label: "Avoiding health problems and pain" },
      { value: 5, label: "Setting and achieving personal goals" },
    ],
  },
  {
    id: "q2",
    text: "How do you prefer to receive feedback on your progress?",
    category: "autonomy",
    options: [
      { value: 1, label: "I want detailed data and metrics" },
      { value: 2, label: "Simple encouragement is enough" },
      { value: 3, label: "I like to see my own progress without comparison" },
      { value: 4, label: "I prefer gentle reminders and support" },
      { value: 5, label: "I want to be challenged and pushed" },
    ],
  },
  {
    id: "q3",
    text: "What concerns you most about your health as you age?",
    category: "health_fear",
    options: [
      { value: 1, label: "Losing my independence" },
      { value: 2, label: "Experiencing falls or injuries" },
      { value: 3, label: "Becoming a burden to family" },
      { value: 4, label: "Not being able to do things I enjoy" },
      { value: 5, label: "Declining physical capabilities" },
    ],
  },
  {
    id: "q4",
    text: "How do you feel about structured routines?",
    category: "autonomy",
    options: [
      { value: 1, label: "I prefer flexibility and choice" },
      { value: 2, label: "I like having a clear plan to follow" },
      { value: 3, label: "A mix of structure and freedom works best" },
      { value: 4, label: "I need guidance but want to adapt it" },
      { value: 5, label: "I work best with complete autonomy" },
    ],
  },
  {
    id: "q5",
    text: "What motivates you to exercise on days you don't feel like it?",
    category: "achievement",
    options: [
      { value: 1, label: "The satisfaction of completing a goal" },
      { value: 2, label: "Knowing it's good for my long-term health" },
      { value: 3, label: "The feeling of accomplishment afterward" },
      { value: 4, label: "Remembering why I started this journey" },
      { value: 5, label: "Building a streak or maintaining consistency" },
    ],
  },
  {
    id: "q6",
    text: "How important is it to you to master new skills or movements?",
    category: "mastery",
    options: [
      { value: 1, label: "Very important - I enjoy learning and improving" },
      { value: 2, label: "Somewhat important - I like progress" },
      { value: 3, label: "Not very important - I just want to stay active" },
      { value: 4, label: "I prefer familiar activities" },
      { value: 5, label: "I'm not interested in learning new things" },
    ],
  },
  {
    id: "q7",
    text: "How do you prefer to interact with a coach or guide?",
    category: "social",
    options: [
      { value: 1, label: "Friendly and conversational" },
      { value: 2, label: "Professional and knowledgeable" },
      { value: 3, label: "Supportive and understanding" },
      { value: 4, label: "Direct and straightforward" },
      { value: 5, label: "Encouraging with a bit of humor" },
    ],
  },
  {
    id: "q8",
    text: "What does 'staying strong' mean to you?",
    category: "independence",
    options: [
      { value: 1, label: "Being able to do daily tasks without help" },
      { value: 2, label: "Maintaining my current abilities" },
      { value: 3, label: "Feeling confident in my body" },
      { value: 4, label: "Avoiding dependence on others" },
      { value: 5, label: "Living life on my own terms" },
    ],
  },
  {
    id: "q9",
    text: "How do you respond to setbacks or missed sessions?",
    category: "achievement",
    options: [
      { value: 1, label: "I get discouraged and need encouragement" },
      { value: 2, label: "I accept it and get back on track" },
      { value: 3, label: "I analyze what went wrong and adjust" },
      { value: 4, label: "I need gentle reminders to restart" },
      { value: 5, label: "I'm resilient and bounce back quickly" },
    ],
  },
  {
    id: "q10",
    text: "What role does social connection play in your wellness journey?",
    category: "social",
    options: [
      { value: 1, label: "Very important - I thrive with support" },
      { value: 2, label: "Somewhat important - occasional check-ins help" },
      { value: 3, label: "Not important - I prefer to work alone" },
      { value: 4, label: "I like sharing progress but don't need constant interaction" },
      { value: 5, label: "I prefer private, personal guidance" },
    ],
  },
  {
    id: "q11",
    text: "How do you feel about tracking your progress?",
    category: "achievement",
    options: [
      { value: 1, label: "I love seeing numbers and data improve" },
      { value: 2, label: "I like simple progress indicators" },
      { value: 3, label: "I prefer qualitative feedback over numbers" },
      { value: 4, label: "I don't want to track anything" },
      { value: 5, label: "I like occasional progress updates" },
    ],
  },
  {
    id: "q12",
    text: "What's your biggest goal for the next year?",
    category: "purpose",
    options: [
      { value: 1, label: "Improve my physical strength and balance" },
      { value: 2, label: "Maintain my current level of health" },
      { value: 3, label: "Feel more confident in my daily activities" },
      { value: 4, label: "Prepare for upcoming travel or events" },
      { value: 5, label: "Build sustainable healthy habits" },
    ],
  },
];

