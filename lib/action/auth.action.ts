"use server";

import { feedbackSchem } from "@/constants";
import { auth, db } from "@/firebasee/admin";
import { google } from "@ai-sdk/google";
import { generateObject, jsonSchema } from "ai";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });
    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.user_id)
      .get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviwes")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}


export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviwes")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}




export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;
  console.log("Creating feedback with params:;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;", params);
  if (!interviewId || !userId) {
    console.error("Missing interviewId or userId, aborting feedback creation", { interviewId, userId });
    return { success: false, error: new Error("Missing interviewId or userId") };
  }
  try {
    // Format transcript as readable bullet points
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Call Gemini with a JSON schema wrapper supported by the AI SDK.
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: jsonSchema(feedbackSchem as any),
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to produce highly structured, strict JSON that matches the provided schema.",
      prompt: `
        You are an AI interviewer analyzing a mock interview.

        Transcript:
        ${formattedTranscript}

        Score the candidate from 0 to 100 ONLY for the following categories:
        - Communication Skills
        - Technical Knowledge
        - Problem-Solving
        - Cultural & Role Fit
        - Confidence & Clarity

        Then provide:
        - strengths (as a single string, separate items with newlines)
        - areasForImprovement (as a single string, separate items with newlines)
        - finalAssessment
        but for now create a test object with dummy data to test the flow of the application without actually calling the Gemini API, you can replace it with actual call later.

         Remember, your response MUST be a JSON object that strictly adheres to the provided schema. Do not include any explanations or text outside of the JSON structure. If you do not have enough information to provide a score for a category, set its value to null.
      
    

        Respond ONLY with data matching the schema.
      `,
    });
    const generatedFeedback = object as Record<string, any>;
    console.log("Generated feedback object:**********************************************", generatedFeedback);
    // Build Firestore document
    // Parse strengths and areas into arrays if returned as strings
    const parseList = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean).map(String);
      if (typeof val === "string") {
        return val
          .split(/\r?\n|\r|,|;/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const strengths = parseList(generatedFeedback.strengths);
    const areasForImprovement = parseList(generatedFeedback.areasForImprovement);

    const categoryScores = [
      { name: "Communication Skills", score: generatedFeedback.communicationSkills ?? null, comment: "" },
      { name: "Technical Knowledge", score: generatedFeedback.technicalKnowledge ?? null, comment: "" },
      { name: "Problem Solving", score: generatedFeedback.problemSolving ?? null, comment: "" },
      { name: "Cultural Fit", score: generatedFeedback.culturalRoleFit ?? null, comment: "" },
      { name: "Confidence and Clarity", score: generatedFeedback.confidenceClarity ?? null, comment: "" },
    ];

    const feedback = {
      interviewId,
      userId,
      createdAt: new Date().toISOString(),
      totalScore: generatedFeedback.totalScore ?? null,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment: generatedFeedback.finalAssessment ?? "",
    };

    // Save to Firestore
    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback (AI generation or save failed):", error);

    try {
      // Fallback: save a minimal feedback document so the interview still records feedback
      const fallback = {
        interviewId,
        userId,
        createdAt: new Date().toISOString(),
        totalScore: 0,
        categoryScores: [],
        strengths: [],
        areasForImprovement: [],
        finalAssessment: "Feedback generation failed; no assessment available.",
      };

      const fallbackRef = feedbackId
        ? db.collection("feedback").doc(feedbackId)
        : db.collection("feedback").doc();

      await fallbackRef.set(fallback);

      return { success: true, feedbackId: fallbackRef.id, fallback: true };
    } catch (saveError) {
      console.error("Error saving fallback feedback:", saveError);
      return { success: false, error: saveError };
    }
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviwes").doc(id).get();
  if (!interview.exists) return {} as Interview;
  return interview.data() as Interview;
}

