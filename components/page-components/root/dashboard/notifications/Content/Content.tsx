"use client";
import { useSendSms } from "@/hooks/useSendSms";
import React, { useState } from "react";

const Content = () => {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  const { mutate, isPending, isError, isSuccess, data, error } = useSendSms();

  const handleSend = () => {
    mutate({ number, message });
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Phone number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="border px-2 py-1"
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border px-2 py-1"
      />

      <button
        onClick={handleSend}
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isPending ? "Sending..." : "Send SMS"}
      </button>

      {isSuccess && (
        <div className="mt-2 text-green-600">
          Success: <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      {isError && (
        <div className="mt-2 text-red-600">
          Error: { (error as Error).message}
        </div>
      )}
    </div>
  );
};

export default Content;
