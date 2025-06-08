"use server";

import { cookies } from "next/headers";
import { db, auth } from "../../firebasee/admin";
import { User } from "firebase/auth";

export async function signUp(params: SignUpParams) {
  const { email, password, name, uid } = params;
  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists.",
      };
    }

    await db.collection("users").doc(uid).set({
      email,
      name,
      uid,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Account created successfully. You can now sign in.",
    };
  } catch (error: any) {
    console.error("Error during sign up:", error);
    if (error.code === "auth/email-already-in-use") {
      return {
        success: false,
        message: "Email already in use. Please try another email.",
      };
    }

    return {
      success: false,
      message: "An error occurred during sign up. Please try again later.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
  });

  cookieStore.set({
    name: "session",
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User not found. Please sign up first.",
      };
    }
    await setSessionCookie(idToken);
  } catch (error) {
    return {
      success: false,
      message: "An error occurred during sign in. Please try again later.",
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null; // No session cookie found
  }
  try {

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userRecord.exists) {
        return null; // User not found in the database
    }
    return {
        ...userRecord.data(),
        id: userRecord.id,
    } as unknown as User ; // Return user data with id
    
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAthenticated(){
    const user= await getCurrentUser();
    return user !== null; 
}
