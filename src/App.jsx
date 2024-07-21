import React, { useState } from "react";
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { Button, Grid } from "@mui/material";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_KEY = "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" // insert own API Key

function App() {
  const [chatStarted, setChatStarted] = useState(false); // for start page button
  // storing messages in an array
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Rex!",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]); //[] initial message from chatGPT

  // pie chart variables
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [chatGPTMessageCount, setChatGPTMessageCount] = useState(1);

  // for first page button
  const startChat = () => {
    setChatStarted(true);
  };

  const handleSend = async (message) => {
    const newMessage = {
      message: message, // message is the text we receive
      sender: "user",
      direction: "outgoing" //// means user input (i.e. our message) should show on the right
    };
   
    // takes all the messages already in our state and adds the newMessage to the top
    const newMessages = [...messages, newMessage]; // all old messages + new message
    setMessages(newMessages); // update our messages state
    setUserMessageCount(userMessageCount + 1); // increment user message count
    setTyping(true); //set a typing indicator (ex. chatgpt is typing). will run forever, we need to make it false at some point
    await processMessageToChatGPT(newMessages); // process message to chatGPT (send it over and see the response)
  };

  // processing current message over to chatGPT
  async function processMessageToChatGPT(chatMessages) {
    // chatMessages { sender: "user" or "ChatGPT", message: "The message content here"} // in brackets, we have the objects of chatMessages
    // apiMessages { role: "user" or "assistant", content: "The message content here"} // this is the format we want for the api

    // building array, going through every single chat message and creating new objects for the api
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // 3 different roles:
    // role: "user" -> a message from the user, "assistant" -> a response from chatGPT
    // "system" -> generally one initial message defining HOW we want chatGPT to talk

    // tells the system how to respond
    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old." // can change to 'speak like a pirate,' explain like I am a 10 years of experience software engineer
    };

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages // all the messages we have in our conversation [message1,message2,message3]
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { // as defined on openAI site
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => { // data returned as json
      return data.json();
    }).then((data) => {
      console.log(data); // right click 'inspect,' go into console when application is running to see the objects
      // in console, we can see the response. we want to print this response in our chat application
      // console.log(data.choices[0].message.content); // response is under data, then, in the first array of choices, we follow message then content to get the response
      // displaying response in application
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setTyping(false);
      setChatGPTMessageCount(chatGPTMessageCount + 1); // increment chatGPT count for pie chart
    });
  }

  // data for pie chart
  const data = {
    labels : ['User Messages', 'Rex Messages'],
    datasets : [{
      label : 'Total Messages',
      data : [userMessageCount, chatGPTMessageCount],
      backgroundColor : [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
      ],
      borderWidth: 1,
    }],
  };

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
        //flex layout means side by side
        <div style={{ display: "flex", position: "relative", height: "800px", width: "1500px"}}> 
        <div style = {{ flex: 1}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                // if chatGPT typing, show text, else nothing
                typingIndicator={typing ? <TypingIndicator content="ReX is typing" /> : null}>
                {/* goes through current message (i.e. object) and grabs its index and returns a message component
                the key is the index number, the model is the message at the index
                by doing so, every message in array has a message component */}
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />
                })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
          </div>
          <div style = {{ flex: 1, marginLeft: '20px'}}>
            <Pie data={data} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
