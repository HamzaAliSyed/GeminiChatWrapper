import React, { useState, useEffect } from "react";
import { BsChatRightTextFill, BsChatLeftTextFill, BsSendFill } from "react-icons/bs";

const ChatPage = () => {
  const [prompt, setPrompt] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);

  const composePrompt = (writingEvent) => {
    setPrompt(writingEvent.target.value);
  };

  const geminiQuery = async (userMessage) => {

    const requestBody = {
      contents: [
        { parts: [{ text: userMessage }] }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    return response;
  };

  const queryPrompt = async () => {
    if (prompt.trim() !== "") {
      setTyping(true);

      const newMessages = [...messages, { sender: "User", message: prompt }];
      setMessages(newMessages);
      const userMessage = prompt;
      setPrompt("");

      try {
        const response = await geminiQuery(userMessage);
        const data = await response.json();
        const geminiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiMessage) {
          setMessages([...newMessages, { sender: "Gemini", message: geminiMessage }]);
        } else {
          setTyping(false);
        }
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        setTyping(false);
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "Gemini") {
      setTyping(false);
    }
  }, [messages]);

  return (
    <>
      <div className="relative h-[600px] mx-auto lg:max-w-2xl xl:max-w-3xl p-[10px]">
        <div className="wrapper overflow-auto scroll-smooth flex flex-col h-[calc(100vh-87px)]">
          {messages.length > 0 &&
            messages.map((message, index) => (
              <React.Fragment key={index}>
                <div className="flex px-3">
                  <div
                    className={`container mx-auto flex items-start ${
                      message.sender === "Gemini" ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    {message.sender === "Gemini" ? (
                      <BsChatRightTextFill
                        style={{ fontSize: "30px", color: "#62ac9c", marginRight: "20px", marginTop: "10px" }}
                      />
                    ) : (
                      <BsChatLeftTextFill
                        style={{ fontSize: "30px", color: "#fff", marginLeft: "20px", marginTop: "10px" }}
                      />
                    )}
                    <p
                      className={`text-lg min-h-[52px] ${
                        message.sender === "Gemini" ? "bg-[#62ac9c] text-[#fff]" : "bg-[#fff] text-[#000]"
                      } py-3 px-5 rounded-lg w-[calc(100%-42px)] my-1`}
                    >
                      {message.message}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            ))}
        </div>
        <div className="absolute flex p-[5px] w-full justify-center">
          <div className="container relative">
            <div className="p-4 bg-[#3e414e] rounded-sm flex justify-between">
              {typing && (
                <span className="absolute self-start top-[-20px] text-xs left-0 text-[#9ca3af]">
                  Thinking...
                </span>
              )}
              <input
                type="text"
                placeholder="Query poor Gemini 🐺"
                id="promptarea"
                onChange={composePrompt}
                onKeyDown={(enterPressed) => { if (enterPressed.key === "Enter") queryPrompt(); }}
                value={prompt}
                className="w-[calc(100%-6rem)] m-0 rounded-sm outline-none bg-[#353641] p-[10px] h-[45px] text-[#fff]"
              />
              <button
                className="w-[5rem] flex items-center justify-center cursor-pointer bg-[#353641]"
                onClick={queryPrompt}
              >
                <BsSendFill style={{ fontSize: 20, color: "white" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
