import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const app = express();
const port = 8080;
const apiKey = process.env.UPSTAGE_API_KEY;
const solar = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.upstage.ai/v1/solar'
  })

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getResFromSolar = async (concept:string, text: string) => {
    try {
        const chatCompletion = await solar.chat.completions.create({
            model: 'solar-1-mini-chat',
            messages: [
                {
                    role: 'system',
                    content: '역할은 다음과 같습니다.' + concept
                },
              {
                 role: 'user',
                 content: text
              }
            ],
          });
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
};

const getResFromGpt4o = async (concept:string, text: string) => {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'gpt 역할은 다음과 같습니다. user 질문에 짧게 답해주세요.' + concept
                },
              {
                 role: 'user',
                 content: text
              }
            ],
          });
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
};

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    const indexPath = path.join(__dirname, "src", "index.html");
    fs.readFile(indexPath, "utf-8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).send("Server Error");
        } else {
            res.send(data);
        }
    });
});

app.post("/text-solar", async (req: Request, res: Response) => {
    let {concept, text} = req.body;
    if (text === '') {
        text = '취미가 뭐에요?'
    } else if (!text) {
        res.status(400).send("Bad Request");
    }
    const textResFromSolar = await getResFromSolar(concept, text);
    if (!textResFromSolar) {
        res.status(500).send("Server Error");
    }
    res.json({ text: textResFromSolar });
});

app.post("/text-gpt4o", async (req: Request, res: Response) => {
    let {concept, text} = req.body;
    if (text === '') {
        text = '취미가 뭐에요?'
    } else if (!text) {
        res.status(400).send("Bad Request");
    }
    const textResFromGpt4o = await getResFromGpt4o(concept, text);
    if (!textResFromGpt4o) {
        res.status(500).send("Server Error");
    }
    res.json({ text: textResFromGpt4o });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
