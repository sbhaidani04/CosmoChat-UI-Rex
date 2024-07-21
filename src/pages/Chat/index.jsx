/*IDEALLY, the purpose of this file would be to manage the chat page, as well as the start button, as done in App.js*/

import React, { useEffect, useState } from "react"; // useState allows us to create state variables and useEffect is a hook used to perform side effects such as fetching data
import { Button, Grid } from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import Images from "../../constants/images";
import ChatStyles from "../../styles/chat";
import ReXMessage from "../../components/ReXMessage";
import api from "../../api/sessions";
import OpenAI from "openai"; // initializes connection to openAI which will power chat bot's responses
import { useParams } from "react-router-dom"; // useParams is a hook from react-router-dom package used to fetch route parameters, in this case the chat session ID
import UserMessage from "../../components/UserMessage";
import useMediaQuery from "@mui/material/useMediaQuery";

// STATE VARIABLES
const Chat = () => {
    const { id } = useParams();
    const [userPrompt, setUserPrompt] = useState(""); // userPrompt holds user's input
    const [reXReply, setReXReply] = useState(""); // reXReply holds AI's response
    const [sessions, setSessions] = useState([]); // sessions holds collection of chat sessions
    const [thisSession, setThisSession] = useState({}); // thisSession is the current session
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];
    const API_KEY = "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"
    //const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true});
    const matches = useMediaQuery("(min-width:600px)");
    let chatKeys = [];

    // where we fetch existing chat sessions from ./api/sessions.js
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get("/sessions");
                setSessions(response.data);
                // finds current session based on URL id parameter
                setThisSession(response.data.find((session) => parseInt(session?.id, 10) === parseInt(id,10)));
                handleScroll();
                window.addEventListener("scroll", handleScroll);
            } catch (err) {
                if (err.response){
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                } else {
                    console.log(err);
                }
            }
            //fetchSessions();
            return() => {
                window.removeEventListener("scroll", handleScroll); // function manages any scrolling actions on chat page
            };
        };
        fetchSessions();
    }, []);

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        let updatedSession = {};

        setTimeout(async function () {
            const date = new Date();
            const month = date.getMonth();
            const day = date.getDate();
            const year = date.getFullYear();
            const formattedDate = months[month] + " " + day + ", " + year;
            callOpenAIAPI();
            thisSession.chats.push({
                user: userPrompt,
                ReX: reXReply
            });
            updatedSession = {
                id: id,
                date: formattedDate,
                chats: thisSession.chats,
                isSessionEnded: thisSession.isSessionEnded,
            };
            for (let i = 0; i < updatedSession.chats.length; i++){
                chatKeys.push(Object.keys(updatedSession.chats[i]));
            }

            try{
                const response = await api.patch(`sessions/${id}/`, updatedSession);
                setSessions(sessions.map((session) => session.id == id ? response.data : session));
                setUserPrompt("");
            } catch (err) {
                console.log(`Error: ${err.message}`);
            }
        }, 5000);
    };

    // user input
    async function callOpenAIAPI() {
        const completion = await openai.chat.completions.create({
            messages:[
                {
                    role: "system",
                    content: "Your name is ReX. You are a career advice assistant. You give advice to Andrew about his career.",
                },
            ],
            model: "gpt-3.5-turbo",
            max_tokens: 100,
        });
        setReXReply(completion.choices[0].message.content);
    }

    // chat formatting
    return (
        <Grid container style = {{ display : matches ? "none" : "block"}}>
            <Grid style = {{ padding: "40px 24px 24px 24px", position: "sticky"}}>
                <img src={Images.HomRex} alt="ReX" style={{ width: "105px"}} />
            </Grid>
            <Grid {...ChatStyles.textDisplayBackground}>
                <Grid>
                    {thisSession?.chats?.length
                        ? thisSession?.chats?.map((chat,i) =>
                            Object.keys(chat).map((k) =>
                                k === "ReX" ? (
                                    <ReXMessage reXMessage={chat.ReX} key={"rex" + i} />
                                ) : (
                                    <UserMessage UserMessage={chat.user} key={"user" + i}/>
                                )
                            )
                        )
                    : null}
                </Grid>
               {/*  {thisSession && !thisSession.isSessionEnded ?(
                    <Grid {...ChatStyles.toSendArea}>
                        <Textarea>
                            {...ChatStyles.textArea}
                            name="Soft"
                            placeholder="Type a message to ReX..."
                            variant="soft"
                            onChange={(e) => setUserPrompt(e.target.value)}
                        </Textarea>

                    </Grid>
                )
                } */}
            </Grid>
        </Grid>
    )
   

}