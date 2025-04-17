import { NextResponse } from "next/server";
import { getFirebaseAuthError } from "./authErrors";

export const jsonRes = <T>(data: T, status = 200) =>
  NextResponse.json<T>(data, { status });

export const errorRes = (error: unknown) => {
  const { message, status } = getFirebaseAuthError(
    (error as { code?: string })?.code ?? ""
  );
  return jsonRes<{ message: string }>({ message }, status);
};
