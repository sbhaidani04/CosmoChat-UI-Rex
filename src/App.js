import React, { useState } from "react";
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { Button, Grid } from "@mui/material";

const API_KEY = " " // insert own API Key

function App() {
  const [chatStarted, setChatStarted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Rex!",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);

  const startChat = () => {
    setChatStarted(true);
  };

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old."
    };

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setTyping(false);
    });
  }

  return (
    <div className="App">
      {!chatStarted ? (
        <Grid container direction="column" alignItems="center" justifyContent="center" style={{ height: "100vh" }}>
          <h1>Welcome to ReX</h1>
          <p>Your virtual assistant</p>
          <Button variant="contained" color="primary" onClick={startChat}>
            Start Chat
          </Button>
        </Grid>
      ) : (
        <div style={{ position: "relative", height: "800px", width: "700px"}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                typingIndicator={typing ? <TypingIndicator content="ReX is typing" /> : null}>
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />
                })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
    </div>
  );
}

export default App;
