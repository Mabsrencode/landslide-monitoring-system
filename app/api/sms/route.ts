import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import environment from "@/constants/environment";
import { adminAuth } from "@/lib/firebase/admin";
import { db, doc } from "@/lib/firebase/config";
import { getDoc } from "firebase/firestore";

interface FirestoreUserData {
  contactNumber?: string;
  role?: string;
  status?: string;
}

interface UserData {
  uid: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  disabled: boolean;
  contactNumber?: string;
  role?: string;
  status?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const listUsersResult = await adminAuth.listUsers(1000);

  const users: UserData[] = await Promise.all(
    listUsersResult.users.map(async (userRecord) => {
      let customData: FirestoreUserData = {};

      try {
        const userDoc = await getDoc(doc(db, "users", userRecord.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as FirestoreUserData;
          customData = data;
        }
      } catch (error) {
        console.error(
          `Error fetching Firestore data for UID ${userRecord.uid}:`,
          error
        );
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email ?? undefined,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName ?? undefined,
        disabled: userRecord.disabled,
        ...customData,
      };
    })
  );

  const filteredUsers = users.filter(
    (u) =>
      u.role !== "admin" &&
      u.status === "active" &&
      typeof u.contactNumber === "string" &&
      /^09\d{9}$/.test(u.contactNumber.trim())
  );

  const contactNumbers = filteredUsers.map((u) => u.contactNumber!.trim());

  if (contactNumbers.length === 0) {
    return NextResponse.json(
      { error: "No valid numbers found" },
      { status: 400 }
    );
  }

  const payload = {
    apikey: environment.semaphore.apiKey,
    number: contactNumbers.join(","),
    message,
    sendername: "BantayLS",
  };

  try {
    const resp = await axios.post(
      "https://api.semaphore.co/api/v4/messages",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return NextResponse.json(resp.data, { status: 200 });
  } catch (error) {
    console.error("Semaphore API Error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS", details: (error as Error).message },
      { status: 500 }
    );
  }
}
