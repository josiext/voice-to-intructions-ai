"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Copy, Download, StopCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";

const Chat = () => {
  const { messages, status, append } = useChat();
  const router = useRouter();

  const recognitionRef = useRef<SpeechRecognition>(null);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>();

  const prevLastMsg = useRef<string | null>(null);

  const language = "es-ES";

  const availableVoices = voices?.filter(({ lang }) => lang === language);
  const activeVoice =
    availableVoices?.find(({ name }) => name.includes("Google")) ||
    availableVoices?.find(({ name }) => name.includes("Luciana")) ||
    availableVoices?.[0];

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    if (Array.isArray(voices) && voices.length > 0) {
      setVoices(voices);
      return;
    }
    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = function () {
        const voices = window.speechSynthesis.getVoices();
        setVoices(voices);
      };
    }
  }, []);

  useEffect(() => {
    const lastAIMessage = messages.findLast(
      (message) => message.role === "assistant"
    );

    if (
      prevLastMsg.current !== lastAIMessage?.id &&
      lastAIMessage &&
      status === "ready"
    ) {
      prevLastMsg.current = lastAIMessage.id;
      speak(lastAIMessage.content);

      const toolInvocation =
        lastAIMessage.parts[0].type === "tool-invocation" &&
        lastAIMessage.parts[0];

      console.log(toolInvocation);

      if (toolInvocation) {
        if (toolInvocation.toolInvocation.toolName === "seeAllProjects")
          router.push("/projects");

        if (toolInvocation.toolInvocation.toolName === "seeProject")
          router.push(`/projects/${toolInvocation.toolInvocation.args.name}`);

        if (toolInvocation.toolInvocation.toolName === "createProject") {
          const result = prompt(
            `Descripción del proyecto con el nombre ${toolInvocation.toolInvocation.args.name}`
          );
          router.push(
            `/projects/${toolInvocation.toolInvocation.args.name}?description=${result}`
          );
        }
      }
    }
  }, [status]);

  console.log(messages);

  function speak(text: string) {
    console.log({ text });

    const utterance = new SpeechSynthesisUtterance(text);

    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  function handleOnRecord() {
    if (isActive) {
      recognitionRef.current?.stop();
      setIsActive(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.onstart = function () {
      setIsActive(true);
    };

    recognitionRef.current.onend = function () {
      setIsActive(false);
    };

    recognitionRef.current.onresult = async function (event) {
      const userText = event.results[0][0].transcript;

      append({
        role: "user",
        content: userText,
        createdAt: new Date(),
      });
    };

    recognitionRef.current.start();
  }

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-2 max-w-[80%]",
                message.role === "user" && "ml-auto"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary flex-shrink-0" />
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {message.role === "assistant" ? "AI" : "Usuario"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {message.createdAt?.toLocaleTimeString()}
                  </span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}

                    {message.parts ? (
                      <pre>{JSON.stringify(message.parts, null, 2)}</pre>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2 items-center justify-center">
          <Button className="px-8" onClick={handleOnRecord}>
            {isActive && <StopCircle />}
            {isActive ? "Detener" : "Hablar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
