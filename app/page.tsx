"use client";

import { useChat } from "ai/react";
import BackgroundSVG from "./assets/bg";
import Button from "./components/Button";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";

export default function Chat() {
  const [parent] = useAutoAnimate();
  const [startActionPending, setStartActionPending] = useState(true);

  const onStay = () => {
    console.log("onStay called");
    setStartActionPending(false);
  };
  const onLeave = () => {
    console.log("onLeave called");
    setStartActionPending(false);
  };

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onResponse: (res) => console.log(res, "res"),
    onFinish(message) {
      console.log("message", message);
    },
  });
  return (
    <div className="relative h-screen overflow-hidden">
      <div className="mx-4 pt-4 pb-24 flex flex-col text-white absolute z-20 overflow-y-scroll w-full max-h-full">
        <div ref={parent}>
          {/* TODO: Refactor into severity message component */}
          {startActionPending && (
            <div className="  bg-white rounded-xl mb-4 text-[#ff0000] p-6 w-[90%]">
              {/* TODO: Display only if there is detected. How to detect? */}
              <p className="font-bold text-sm text-center">
                We have detected there is an emergency in your area
              </p>
              <div className="flex flex-row w-full gap-4 pt-4">
                <Button filled={true} onClick={onLeave}>
                  Leave
                </Button>
                <Button onClick={onStay}>Stay</Button>
              </div>
            </div>
          )}
          {startActionPending && (
            <div className="w-[90%] bg-white rounded-xl mb-4 text-[#ff0000] p-6">
              <h3 className="font-medium text-slate-600 pb-2 text-lg">
                Actions
              </h3>
              <div className="flex flex-row gap-x-4 pb-4">
                <div className="h-60 w-full bg-black rounded-lg"></div>
                <div className="h-60 w-full bg-black rounded-lg"></div>
              </div>
              <h4 className="font-medium text-slate-600 text-sm pb-2">
                More information
              </h4>
              <div className="flex flex-row gap-x-4 pb-4 w-full">
                <div className="h-6 w-full bg-blue-400 text-white rounded-lg hover:underline px-4 text-xs flex items-center italic">
                  DFES Emergency
                </div>
                <div className="h-6 bg-blue-400 text-white rounded-lg hover:underline px-4 text-xs whitespace-nowrap flex items-center italic">
                  DFES Info
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col w-[90%]">
            {messages.length > 0 &&
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`whitespace-pre-wrap py-2 bg-white px-4 text-sm w-fit mb-4 ${
                    m.role == "user"
                      ? "ml-auto rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl text-black"
                      : "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl bg-slate-800 text-white"
                  }`}
                >
                  {m.role == "user" ? "User: " : "AI: "}
                  {m.content}
                </div>
              ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center mx-2">
          <input
            className="focus-visible:border-blue-400 backdrop-blur-sm fixed max-w-md bottom-4 rounded-full right-4 text-white placeholder:text-white left-4 border-white text-sm p-2 px-4 border bg-transparent"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
      <div className="h-screen overflow-hidden absolute z-10">
        <BackgroundSVG />
      </div>
    </div>
  );
}
