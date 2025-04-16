import { NextResponse } from "next/server";
import { auth, db, doc, setDoc } from "@/lib/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username, firstName, lastName, contactNumber } =
      body;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(userCredential);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      username,
      firstName,
      lastName,
      contactNumber,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        uid: user.uid,
        message: "Registration successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
