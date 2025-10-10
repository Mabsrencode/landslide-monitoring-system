"use client";
import Section from "@/components/reusable/Section/Section";
import { useSendSms } from "@/hooks/useSendSms";
import React, { useState } from "react";

const Content = () => {
  const [message, setMessage] = useState("");

  const { mutate, isPending, isError, isSuccess, error } = useSendSms();

  const handleSend = () => {
    mutate({ message });
  };

  return (
    <Section className="flex items-center justify-center">
      <div className="w-[800px] border border-accent p-4 rounded bg-gray-200">
        <h3 className="text-primary text-2xl manrope text-center my-2">
          Announcement
        </h3>
        <textarea
          placeholder="Message"
          value={message}
          rows={6}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-2 py-1 w-full rounded bg-white outline-none border-none"
        />

        <button
          onClick={handleSend}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded block w-full cursor-pointer"
        >
          {isPending ? "Sending..." : "Send SMS"}
        </button>

        {isSuccess && (
          <div className="mt-2 text-green-600">
            Successfully sent the alert message.
          </div>
        )}
        {isError && (
          <div className="mt-2 text-red-600">
            Error: {(error as Error).message}
          </div>
        )}
      </div>
    </Section>
  );
};

export default Content;
