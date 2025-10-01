import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export interface SmsPayload {
  number: string;
  message: string;
  sendername?: string;
}

export function useSendSms() {
  return useMutation({
    mutationFn: async (payload: SmsPayload) => {
      const resp = await axios.post("/api/sms", payload);
      return resp.data;
    },
  });
}
