"use client";

import { useChat, useCompletion } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onResponse: (res) => console.log(res, "res"), onFinish(message) {
      console.log('message', message);

    },
  });
  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col text-slate-500">
      {messages.length > 0 &&
        messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap pb-2">
            {m.role == "user" ? "User: " : "AI: "}
            {m.content}
          </div>
        ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed mb-2 w-full max-w-md bottom-0 border-slate-400 text-sm p-2 rounded border"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
