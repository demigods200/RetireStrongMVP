// Export all handlers
export { handler as healthHandler } from "./health";
export { handler as signupHandler } from "./auth/signup";
export { handler as loginHandler } from "./auth/login";
export { handler as onboardingHandler } from "./users/onboarding";
export { handler as getQuizQuestionsHandler } from "./motivation/quiz";
export { handler as submitQuizHandler } from "./motivation/submit";
export { handler as starterPlanHandler } from "./plans/starter";
export { handler as currentPlanHandler } from "./plans/current";
export { handler as getSessionHandler } from "./sessions/get";
export { handler as completeSessionHandler } from "./sessions/complete";

