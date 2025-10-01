import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import environment from "@/constants/environment";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log(body);
  const { number, message } = body;

  if (!number || !message) {
    return NextResponse.json(
      { error: "number and message are required" },
      { status: 400 }
    );
  }

  const payload = {
    apikey: environment.semaphore.apiKey,
    number,
    message,
  };

  try {
    const resp = await axios.post(
      "https://api.semaphore.co/api/v4/messages",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(resp);
    return NextResponse.json(resp.data);
  } catch (err) {
    console.log(err);
    return NextResponse.json(err);
  }
}
