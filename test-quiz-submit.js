/**
 * Test script to submit motivation quiz directly to API
 * Usage: node test-quiz-submit.js <userId>
 * 
 * Make sure the API server is running on http://localhost:3001
 */

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: node test-quiz-submit.js <userId>");
  console.error("Example: node test-quiz-submit.js abc123-def456-ghi789");
  process.exit(1);
}

// Sample quiz answers - using actual question IDs from QUIZ_QUESTIONS
// Schema requires 10-15 answers with values 1-5
const quizSubmission = {
  userId: userId,
  answers: [
    { questionId: "q1", value: 4 },
    { questionId: "q2", value: 3 },
    { questionId: "q3", value: 5 },
    { questionId: "q4", value: 2 },
    { questionId: "q5", value: 4 },
    { questionId: "q6", value: 3 },
    { questionId: "q7", value: 5 },
    { questionId: "q8", value: 4 },
    { questionId: "q9", value: 3 },
    { questionId: "q10", value: 4 },
    { questionId: "q11", value: 2 },
    { questionId: "q12", value: 4 },
  ]
};

const API_URL = process.env.API_URL || "http://localhost:3001";

async function testQuizSubmission() {
  console.log("Testing quiz submission...");
  console.log("API URL:", API_URL);
  console.log("User ID:", userId);
  console.log("Submission:", JSON.stringify(quizSubmission, null, 2));
  console.log("\n");

  try {
    const response = await fetch(`${API_URL}/motivation/quiz/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizSubmission),
    });

    console.log("Response Status:", response.status, response.statusText);
    
    const responseText = await response.text();
    console.log("Response Body:", responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log("\nParsed Response:");
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log("\n✅ Quiz submission successful!");
        console.log("Profile:", data.data.profile);
        console.log("Persona:", data.data.persona);
      } else {
        console.log("\n❌ Quiz submission failed!");
        console.log("Error:", data.error);
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
    }
  } catch (error) {
    console.error("Error making request:", error);
    if (error.code === "ECONNREFUSED") {
      console.error("\n⚠️  Could not connect to API server.");
      console.error("Make sure the API server is running on", API_URL);
      console.error("Start it with: cd apps/api-gateway && npm run dev");
    }
  }
}

testQuizSubmission();

