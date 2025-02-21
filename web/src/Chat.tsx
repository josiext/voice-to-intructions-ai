"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Copy, Download, StopCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: "agent" | "user";
  content: string;
  timestamp: string;
}

const Chat = () => {
  const recognitionRef = useRef<SpeechRecognition>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>();

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

  function handleOnRecord() {
    if (isActive) {
      recognitionRef.current?.stop();
      setIsActive(false);
      return;
    }

    speak(" ");

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
      const transcript = event.results[0][0].transcript;

      /*   const results = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({
          text: transcript,
          language: "pt-BR",
        }),
      }).then((r) => r.json()); */

      const answer =
        "Esta es la respuesta a tu pregunta, llena este formulario....";

      speak(answer);
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: transcript,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          role: "agent",
          content: answer,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    };

    recognitionRef.current.start();
  }

  function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);

    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    window.speechSynthesis.speak(utterance);
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
              {message.role === "agent" && (
                <div className="h-8 w-8 rounded-full bg-primary flex-shrink-0" />
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {message.role === "agent" ? "GenerativeAgent" : "G5"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                {message.role === "agent" && (
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
