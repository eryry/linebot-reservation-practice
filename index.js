// ライブラリの読み込み
const { Client } = require('pg');

// Postgresを使うためのパラメータ設定
const connection = new Client({
 connectionString: process.env.DATABASE_URL,
 ssl: {
   rejectUnauthorized: false
 }
});
connection.connect();


// 顧客データベースの作成
const create_userTable = {
    text:'CREATE TABLE IF NOT EXISTS users(id SERIAL NOT NULL,line_uid VARCHAR(255),display_name VARCHAR(255),timestamp VARCHAR(255),cuttime SMALLINT,shampootime SMALLINT,colortime SMALLINT,spatime SMALLINT);'
 };

// クエリを実行
connection.query(create_userTable)
   .then(()=>{
       console.log('table users created successfully!!');
   })
   .catch(e=>console.log(e));

//   テーブルへの顧客情報登録
// const table_insert = {
//     text:'INSERT INTO users (line_uid,display_name,timestamp,cuttime,shampootime,colortime,spatime) VALUES($1,$2,$3,$4,$5,$6,$7);',
//     values:[ev.source.userId,profile.displayName,ev.timestamp,INITIAL_TREAT[0],INITIAL_TREAT[1],INITIAL_TREAT[2],INITIAL_TREAT[3]]
// };
// connection.query(table_insert)
// .then(()=>{
//     console.log('insert successfully!!')
//     })
// .catch(e=>console.log(e));

//施術時間初期値
// const INITIAL_TREAT = [20,10,40,15,30,15,10];  


const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
// const { Client } = require('pg');
const PORT = process.env.PORT || 5000

const config = {
    channelAccessToken:process.env.ACCESS_TOKEN,
    channelSecret:process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app
    .post('/hook',line.middleware(config),(req,res)=> lineBot(req,res))
    .listen(PORT,()=>console.log(`Listening on ${PORT}`));

const lineBot = (req,res) => {
    res.status(200).end();
    const events = req.body.events;
    const promises = [];
    for(let i=0; i<events.length; i++) {
        const ev = events[i];
        switch(ev.type){
            case 'follow':
                promises.push(greeting_follow(ev));
                break;
            case 'message':
                promises.push(handleMessageEvent(ev));
                break;
        }
    }
    Promise
    .all(promises)
    .then(console.log('all promises passed'))
    .catch(e=>console.error(e.stack));
}

const greeting_follow = async (ev) => {
    const profile = await client.getProfile(ev.source.userId);
    return client.replyMessage(ev.replyToken, {
        "type":"text",
        "text":`${profile.displayName}さん、フォローありがとうございます\uDBC0\uDC04`
    });
}

const handleMessageEvent = async (ev) => {
    const profile = await client.getProfile(ev.source.userId);
    const text = (ev.message.type === 'text') ? ev.message.text : '';

    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":`${profile.displayName}さん、いま『${text}』って言いました？`
    });
}


