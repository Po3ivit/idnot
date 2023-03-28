const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf("5319197663:AAGo8dn39CC0LTitANQlcgXjq_O3Fekw1rU");
//const bot = new Telegraf("004885412:AAE_LuGtuyefjB5sh3S3Dkdd614jQ1hCmhw");
const formJobs = require('./jobs');
const { User, Text, Mail, Task } = require('./schemas');
const moment = require('moment-timezone');
const dateMSK = moment.tz(Date.now(), "Europe/Moscow").format('YYYY-MM-DD HH:mm');

console.log(dateMSK)
formJobs.initialize(bot)

async function cheatText(ctx) {
    await ctx.editMessageText("ры от Самоката: например, свежее молоко, сытную ореховую пасту, сладкие вареники, ароматный гель для душа или что-то, что пргодится вам в хозяйстве или порадует, когда захочется вкусного.")
    await new Promise((r) => setTimeout(r, 150));
    await ctx.editMessageText("В эмоции от американских горок, увлекательного сериала или хорошей шутки, которая подняла настроение всей компании.Яркие впечатления остались, потому что вы решились попробовать что - то новое.Сесть на аттракцион, хотя было страшно, посмот")
    await new Promise((r) => setTimeout(r, 150));
    await ctx.editMessageText("го через задние чи-код. Им можно воспользоваться 3 раза за игру! Чтобы получить баллы, вам нужно заказать любимые продукты и това")
    await new Promise((r) => setTimeout(r, 150));
}

async function idontCheck(ctx, dbuser) {
    if (dbuser.idont && dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') {
        await ctx.reply("У вас уже есть активное задание. Лучше не торопиться и выполнить сначала его.", {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Напомнить задание", "Ttest")]])
        })

    }
    // // let a = !(dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') && dbuser.idont
    // // console.log(a)
    if (!(dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') && dbuser.idont) {
        await ctx.reply("У вас уже есть активное задание. Лучше не торопиться и выполнить сначала его.", {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Напомнить задание", "lastLevel")]])
        })
    }
}

// const promols = await Message.findOne({ stage: "promocode" })
// promo = promols.link[0]
// await Message.updateOne({ stage: "promocode" }, { $pop: { link: -1 } })
// promols.save()

async function levelCheck(ctx, dbuser) {
    const key = dbuser.levelGame.replace(/[^0-9]/g, "")
    const sum = dbuser.level[key].reduce((a, b) => a + b, 0);
    const sumALL = Object.values(dbuser.level).reduce((total, arr) => { return total + arr.reduce((acc, val) => acc + val, 0) }, 0)
    console.log(sumALL)
    const text = await Text.findOne({ stage: "promo" })
    if (sum == 3) {

        let textMessage = text.text[key]
        if (key == 7) {


            let promo = text.level[2][0]
            await Text.updateOne({ stage: "promo" }, { $pop: { 'level.2': -1 } })

            textMessage = textMessage.replace("XXXXXXX", promo)

        }
        if (key == 10) {
            let promo = text.level[1][0]
            await Text.updateOne({ stage: "promo" }, { $pop: { 'level.1': -1 } })

            textMessage = textMessage.replace("XXXXXXXXXX", promo)
        }

        console.log(textMessage)
        await ctx.replyWithVideoNote({ source: `./assets/videos/${key}.mp4` })
        await ctx.reply(textMessage, {
            parse_mode: "markdown", disable_web_page_preview: true,
            // ...Markup.inlineKeyboard([
            //     [Markup.button.callback("Выбор уровня", "Game")]])
        })
    }
    if (sumALL != 30) {
        await ctx.reply("Принято! Теперь вы можете выполнять другие задания.", {
            parse_mode: "markdown", disable_web_page_preview: true,
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Выбор уровня", "Game")]])
        })
    }
    if (sumALL == 30) {
        await ctx.reply(text.text[11], {
            parse_mode: "markdown", disable_web_page_preview: true
        })
    }

}

async function sendMessage(userId, i) {
    const message = await Text.findOne({ stage: "moder" })
    const a = Math.floor(Math.random() * i)
    // console.log(message.que.image + i[a])
    if (i == 3) {
        bot.telegram.sendMediaGroup(userId, [
            {
                media: { source: message.que.image3[a] },
                caption: message.que.text3[a],
                type: 'photo'
            }])
    }

    if (i == 2) {
        bot.telegram.sendMediaGroup(userId, [
            {
                media: { source: message.que.image2[a] },
                caption: message.que.text2[a],
                type: 'photo'
            }])
    }

}

async function stopJob(userId) {
    const dick = await Task.find({ user_id: userId })
    const context = await formJobs.getContext()

    for (const vagina of dick) {
        const { user_id, date } = vagina
        const job = context[user_id + date]
        if (job) await job.stop()
    }
    const deldick = await Task.deleteMany({ user_id: userId })

}

bot.start(async (ctx) => {
    const stage = "start"
    const username = ctx.update.message.chat.username;
    const userid = ctx.update.message.chat.id;
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    // console.log(username, userid, dbuser, dateMSK)

    if (dbuser) {

        dbuser.stage = "start"
        await dbuser.save()
    }

    if (!dbuser) {
        const user = new User({
            userid: userid,
            username: username,
            stage: "start",
            promo: 0,
            lspromo: 0,
            cheat: 3,
            level: { 1: [0, 0, 0], 2: [0, 0, 0], 3: [0, 0, 0], 4: [0, 0, 0], 5: [0, 0, 0], 6: [0, 0, 0], 7: [0, 0, 0], 8: [0, 0, 0], 9: [0, 0, 0], 10: [0, 0, 0] },
            idont: false,
            moder: false,
            created: dateMSK,
            score: 0,
            testStateA: 0,
            testStateQ: 0,
            testState: false,
            sircleFirst: false,

        });
        await user.save();

    }

    // let text = new Text({
    //     stage: "level1",
    //     level: ["Название задания 1", "Название задания 2", "Название задания 3"],
    //     text: ["Текст задания 1", "Текст задания 2", "Текст задания 3"]
    // })

    // await text.save();

    //await ctx.replyWithVideo("BAACAgIAAxkBAAETP_tjmYWc4Hi3xbaeaDVaHW5Ly-I13AACByMAAmtxyEiCUW-MWRhjyywE", {})
    const mess = await Text.findOne({ stage: stage })
    // if (dbuser.moder) {
    //     await ctx.replyWithPhoto({ source: "./assets/images/hi.webp" }, {
    //         caption: mess.text[0],
    //         parse_mode: "HTML",
    //         ...Markup.inlineKeyboard([
    //             [Markup.button.callback("Сразу к игре", "Game")],
    //             [Markup.button.callback("Давай! Но начала узнаем правила", "Rules0")],
    //             [Markup.button.callback("МОДЕРИРОВАНИЕ", "Moder-00")]]),
    //     })
    // }

    await ctx.replyWithPhoto({ source: "./assets/images/hi.webp" }, {
        caption: mess.text[0],
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Сразу к игре", "Game")],
            [Markup.button.callback("Давай! Но сначала узнаем правила", "Rules0")]]),
    })


})
bot.command("score", async (ctx) => {
    const userid = ctx.update.message.chat.id;
    const dbuser = await User?.findOne({ userid: userid })
    if (!dbuser) ctx.reply("Нажмите /start")
    if (dbuser) {
        const score = dbuser.score * 5
        await ctx.reply(`Вы набрали ${score} из 825 очков.`)
        //await stopJob(userid)
        // await formJobs.formJob(userid)
        // await ctx.replyWithVideoNote({ source: `./assets/videos/1.mp4` })
        // const text = await Text.findOne({ stage: "test" })
        // ctx.reply(text.text[1], { parse_mode: "HTML" })
        // const text = await Text.findOne({ stage: "promo" })
        // let textMessage = text.text[4]
        // // console.log(text.level[2])
        // let promo = text.level[1][0]
        // await Text.updateOne({ stage: "promo" }, { $pop: { 'level.1': -1 } })
        // // console.log(promo)
        // // console.log(text.level[2])
        // textMessage = textMessage.replace("XXXXXXXXXX", promo)
        // // console.log(textMessage)
        // console.log(textMessage)
        // await ctx.reply(textMessage, {
        //     parse_mode: "markdown", disable_web_page_preview: true,
        //     ...Markup.inlineKeyboard([
        //         [Markup.button.callback("Выбор уровня", "Game")]])})
    }


    // console.log(arrayMy)
    // const dickdick = await Text.updateOne({ stage: "promo" }, { $push: { "level": arrayMy } })
    // console.log(dickdick)


}

)
bot.action("start", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "start"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = "start"
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })
    const sumALL = Object.values(dbuser.level).reduce((total, arr) => { return total + arr.reduce((acc, val) => acc + val, 0) }, 0)

    if (sumALL >= 30) {
        await ctx.replyWithPhoto({ source: "./assets/images/hi.webp" }, {
            caption: mess.text[0],
            parse_mode: "HTML", disable_web_page_preview: true,
            ...Markup.inlineKeyboard([

                [Markup.button.callback("Давай! Но сначала узнаем правила", "Rules0")]]),
        })
    }
    if (sumALL < 30) {
        await ctx.replyWithPhoto({ source: "./assets/images/hi.webp" }, {
            caption: mess.text[0],
            parse_mode: "HTML", disable_web_page_preview: true,
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Сразу к игре", "Game")],
                [Markup.button.callback("Давай! Но сначала узнаем правила", "Rules0")]]),
        })
    }
}

)

bot.action("Rules0", async (ctx) => {
    console.log(ctx)
    await ctx.answerCbQuery()
    const stage = "Rules"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))

    dbuser.stage = stage
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })


    if (dbuser.moder) {
        await ctx.reply(mess.text[0],
            Markup.inlineKeyboard([
                [Markup.button.callback("Сколько времени на задание?", "Rules1")],
                [Markup.button.callback("Вернуться в главное меню ↩️", "start")],
                [Markup.button.callback("МОДЕРИРОВАНИЕ", "Moder-00")]])
        )
    }

    if (!dbuser.moder) {
        await ctx.reply(mess.text[0],
            Markup.inlineKeyboard([
                [Markup.button.callback("Сколько времени на задание?", "Rules1")],
                [Markup.button.callback("Вернуться в главное меню ↩️", "start")],
            ])
        )
    }
}
)

bot.action("Rules1", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "Rules"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = stage
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })

    await ctx.reply(mess.text[1], {
        parse_mode: "HTML", disable_web_page_preview: true,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Как выполнять?", "Rules2")],
            [Markup.button.callback("Вернуться в главное меню ↩️", "start")]])
    }
    )
})

bot.action("Rules2", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "Rules"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = stage
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })

    await ctx.reply(mess.text[2], {
        parse_mode: "HTML", disable_web_page_preview: true,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Как рассчитываются баллы?", "Rules3")],
            [Markup.button.callback("Вернуться в главное меню ↩️", "start")]])
    }
    )
})

bot.action("Rules3", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "Rules"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = stage
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })

    await ctx.reply(mess.text[3], {
        parse_mode: "HTML", disable_web_page_preview: true,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Как выиграть призы?", "Rules4")],
            [Markup.button.callback("Вернуться в главное меню ↩️", "start")]])
    }

    )
})

bot.action("Rules4", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "Rules"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = stage
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })

    await ctx.reply(mess.text[4], {
        parse_mode: "HTML", disable_web_page_preview: true,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Класс, а что-то ещё есть?", "Rules5")],
            [Markup.button.callback("Вернуться в главное меню ↩️", "start")]])
    }
    )
})

bot.action("Rules5", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "Rules"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = stage
    await dbuser.save()

    const mess = await Text.findOne({ stage: stage })

    await ctx.reply(mess.text[5], {
        parse_mode: "HTML", disable_web_page_preview: true,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("В игру!", "Game")]])
    }
    )
})

bot.action("Game", async (ctx) => {

    await ctx.answerCbQuery()
    const stage = "Game"
    const userid = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: userid })
    await new Promise(r => setTimeout(r, 600))
    dbuser.stage = "Game"
    await dbuser.save()
    console.log(dbuser)
    const sumALL = Object.values(dbuser.level).reduce((total, arr) => { return total + arr.reduce((acc, val) => acc + val, 0) }, 0)
    if (sumALL >= 30) { }
    if (sumALL < 30) {
        if (dbuser.idont) idontCheck(ctx, dbuser)
        if (!dbuser.idont) {
            const mess = await Text.findOne({ stage: stage })
            const messArray = [];
            const levelKeys = Object.keys(dbuser.level); // получаем массив ключей объекта level
            let foundZeroSum = false;

            for (let i = 0; i < levelKeys.length; i++) {
                const levelKey = levelKeys[i];
                const levelArray = dbuser.level[levelKey];

                // вычисляем сумму значений в массиве
                const sum = levelArray.reduce((acc, value) => acc + value, 0);

                // если сумма больше нуля, добавляем значение в messArray
                if (sum > 0 && sum !== 3 && sum !== 4) {
                    messArray.push(Markup.button.callback("Задания уровня " + levelKey, "level" + levelKey));
                }

                if (!foundZeroSum && !sum) {
                    messArray.push(Markup.button.callback("Задания уровня " + levelKey, "level" + levelKey));
                    foundZeroSum = true;
                }
            }
            if (!messArray.length) messArray.push(Markup.button.callback("Задания уровня 1", "level1"))
            console.log(messArray); // выводим результат в консоль
            if (!dbuser.sircleFirst) {
                await ctx.replyWithVideoNote({ source: "./assets/videos/0.mp4" })
                dbuser.sircleFirst = true
                await dbuser.save()
            }
            await ctx.reply(mess.text[0],
                {
                    parse_mode: "HTML", disable_web_page_preview: true,
                    ...Markup.inlineKeyboard(messArray.map((button) => [button])),
                })
        }
    }
})

bot.action(/^level\d+$/, async (ctx) => {
    await ctx.answerCbQuery();
    console.log(ctx)
    const thisLevel = ctx.match[0].replace("level", "");
    const stage = "level" + thisLevel;

    const userid = ctx.update.callback_query.from.id;
    const dbuser = await User.findOne({ userid: userid });

    await new Promise((r) => setTimeout(r, 600));
    if (dbuser.idont) idontCheck(ctx, dbuser)
    if (!dbuser.idont) {
        dbuser.levelGame = stage
        await dbuser.save();

        const mess = await Text.findOne({ stage: stage });
        const messArray = [];
        let messText = "Я никогда не...\n";

        const levelArray = dbuser.level && dbuser.level[thisLevel] || [];


        const subLevelArray = levelArray.reduce((acc, cur, i) => {
            if (cur === 0) {
                acc.push(i);
            }
            return acc;
        }, []);

        if (subLevelArray.length > 0) {
            for (let i = 0; i < subLevelArray.length; i++) {
                const index = subLevelArray[i];
                messArray.push(
                    Markup.button.callback(
                        `Принять задание ${index + 1}`,
                        `subLevel${index + 1}`
                    )
                );
                // messText += `${index + 1} ▫️ ${mess.level[index]}\n`;
                messText += `${mess.level[index]}\n`;
            }
            messArray.push(
                Markup.button.callback(
                    "Вернуться на выбор уровня ↩️", "Game",

                )
            )
        }
        messText += "\n❗️ Как только вы принимаете задание, запускается отсчёт на его выполнение — 24 часа."
        console.log(messArray)
        await ctx.reply(messText, {
            parse_mode: "HTML", disable_web_page_preview: true,
            ...Markup.inlineKeyboard(messArray.map((button) => [button])),
        })
    }
});

bot.action(/^subLevel\d+$/, async (ctx) => {
    await ctx.answerCbQuery();
    console.log(ctx)
    const thisSubLevel = ctx.match[0].replace("subLevel", "");
    const stage = "sublevel" + thisSubLevel;

    const userid = ctx.update.callback_query.from.id;
    const dbuser = await User.findOne({ userid: userid });
    if (dbuser.idont) idontCheck(ctx, dbuser)
    if (!dbuser.idont) {
        await new Promise((r) => setTimeout(r, 600));
        dbuser.idont = true
        dbuser.subLevelGame = ctx.match[0]
        dbuser.stage = stage;
        await formJobs.formJob(userid)


        const mess = await Text.findOne({ stage: dbuser.levelGame });

        const messText = mess.text[thisSubLevel - 1]
        dbuser.text = messText
        await dbuser.save();
        if (dbuser.idont && dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') {
            await ctx.reply(messText, {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("Пройти тест", "test0")]])
            })
        }
        if (!(dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') && dbuser.idont) {
            await ctx.reply(messText, {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("Чит-код", "cheat")]])
            })
        }
    }
})






bot.action("Ttest", async (ctx) => {
    console.log(ctx)
    await ctx.answerCbQuery();
    const userid = ctx.update.callback_query.from.id;
    const dbuser = await User.findOne({ userid: userid });
    const stage = "test"
    dbuser.stage = stage
    if (!dbuser.testState) dbuser.testStateQ = 0
    await dbuser.save()
    const text = await Text.findOne({ stage: "test" })
    //console.log(text)
    await new Promise((r) => setTimeout(r, 600));
    if (dbuser.idont && dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') {
        if (dbuser.testState) {
            await ctx.editMessageText("Вы уже прошли тест", {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("Выбор уровня", "Game")]])
            })
        }
        if (!dbuser.testState) {
            await ctx.editMessageText(text.text[0], {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("Тест", "test0")]
                ])
            })
        }
    }

    if (!(dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') && dbuser.idont) {

        await ctx.editMessageText("Вы уже прошли тест", {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Выбор уровня", "Game")]])
        })
    }

})



bot.action(/^test\d+$/, async (ctx) => {
    await ctx.answerCbQuery();
    const userid = ctx.update.callback_query.from.id;
    const dbuser = await User.findOne({ userid: userid });
    const text = await Text.findOne({ stage: "test" })
    await new Promise((r) => setTimeout(r, 600));
    if (dbuser.idont && dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') {
        const A = ctx.update.callback_query.data.replace(/\D/g, "")
        console.log(dbuser)
        if (A != "0") dbuser.testStateA = A

        if (dbuser.testStateQ === 6) {
            if (dbuser.testState) {
                await ctx.editMessageText("Вы уже прошли тест", {
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("Выбор уровня", "Game")]])
                })

            }

            if (!dbuser.testState) {
                await ctx.deleteMessage()
                dbuser.testState = true
                dbuser.idont = false
                dbuser.score += 5

                await User.updateOne({ userid: userid }, { $set: { 'level.5.2': 1 } })
                dbuser.save()
                await ctx.replyWithPhoto(
                    { source: `./assets/TEST/${dbuser.testStateA}.jpg` },
                    {
                        caption: text.text[dbuser.testStateA],
                        parse_mode: "HTML",
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback("Выбор уровня", "Game")]])
                    })


            }

        }
        if (dbuser.testStateQ < 6) {
            const i = dbuser.testStateQ.toString()
            const textA = text.que[i][0]
            const textB = text.que[i][1]
            const buttA = text.que[i][2]
            const buttB = text.que[i][3]
            dbuser.testStateQ += 1

            dbuser.save()
            if (dbuser.testStateQ == 3) {
                await ctx.deleteMessage()
                await ctx.replyWithPhoto({ source: './assets/TEST/cat.jpg' })
                await ctx.reply(`${textA} или ${textB} ?`, {
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(textA, "test" + buttA)],
                        [Markup.button.callback(textB, "test" + buttB)]])
                })
            }
            if (dbuser.testStateQ !== 3) {
                await ctx.editMessageText(`${textA} или ${textB} ?`, {
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(textA, "test" + buttA)],
                        [Markup.button.callback(textB, "test" + buttB)]])
                })
            }
        }

        if (!(dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') && dbuser.idont) {
            await ctx.editMessageText("Вы уже прошли тест", {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("Выбор уровня", "Game")]])
            })
        }
    }
})



bot.action("lastLevel", async (ctx) => {
    console.log(ctx)
    await ctx.answerCbQuery();
    const userid = ctx.update.callback_query.from.id;
    const dbuser = await User.findOne({ userid: userid });



    const stage = "lastLevel"
    dbuser.stage = stage
    dbuser.save()

    if (dbuser.idont && dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') {
        await ctx.deleteMessage()
        await ctx.reply(dbuser.text, {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Пройти тест", "Ttest")]])
        })
    }
    if (!(dbuser.levelGame === 'level5' && dbuser.subLevelGame === 'subLevel3') && dbuser.idont) {
        await ctx.deleteMessage()
        await ctx.reply(dbuser.text, {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Чит-код", "cheat")]])
        })
    }

})


bot.action("cheat", async (ctx) => {
    await ctx.answerCbQuery();
    //console.log(ctx)
    const stage = "cheat"
    const userid = ctx.update.callback_query.from.id;
    const dbuser = await User.findOne({ userid: userid });
    const text = await Text.findOne({ stage: "cheat" });
    await new Promise((r) => setTimeout(r, 600));

    //await dbuser.save();
    console.log(dbuser.cheat)
    if (dbuser.cheat) {
        dbuser.stage = stage;
        dbuser.save()
        // await cheatText(ctx)

        await ctx.replyWithPhoto(
            { source: "./assets/images/cheat.webp" },
            {
                caption: text.text[0],
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("❌", "lastLevel")]])
            })
    }
    if (!dbuser.cheat) {
        await ctx.replyWithPhoto(
            { source: "./assets/images/NOcheat.webp" },
            {
                caption: text.text[1],
                parse_mode: "HTML",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("❌", "lastLevel")]])
            })
    }

})







//Механика отправки

bot.on("document", (ctx) => {
    ctx.reply("Я, конечно, волшебная сумка, но не могу принимать такие большие файлы. Пришлите ваш ответ в формате обычного изображения, видео или текста.")
})
bot.on("voice", async (ctx) => {

    const file_id = ctx.message.voice.file_id
    const user_id = ctx.message.from.id
    const duration = ctx.message.voice.duration
    const dbuser = await User.findOne({ userid: user_id })
    const mess = await Text.findOne({ stage: "Game" })
    const combo = dbuser.levelGame.replace(/[^0-9]/g, "")
    if (dbuser.idont && dbuser.stage !== "cheat") {
        ctx.deleteMessage()
        if (duration <= 60) {

            dbuser.mail = {
                file_id: file_id,
                user_id: user_id,
                moder: false,
                combo: combo,
                format: "voice",
                text: dbuser.text,
            }
            await dbuser.save()
            await ctx.reply(dbuser.text, {
                parse_mode: "HTML"
            })
            await ctx.replyWithAudio(file_id, {})
            await ctx.reply(mess.text[1], {
                parse_mode: "HTML", ...Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "mail-yes")]])
            })
        }
        if (duration > 60) {
            await ctx.replyWithAudio(file_id, {})
            await ctx.reply(mess.text[2],)
        }
    }
    if (dbuser.idont && dbuser.stage == "cheat") {
        await ctx.reply("Прикрепите пожалуйста скрин в формате изображения.")

    }

})

bot.on("video_note", async (ctx) => {

    const file_id = ctx.message.video_note.file_id
    const user_id = ctx.message.from.id
    const duration = ctx.message.video_note.duration
    const dbuser = await User.findOne({ userid: user_id })
    const mess = await Text.findOne({ stage: "Game" })
    const combo = dbuser.levelGame.replace(/[^0-9]/g, "")
    if (dbuser.idont && dbuser.stage !== "cheat") {
        ctx.deleteMessage()

        if (duration <= 60) {

            dbuser.mail = {
                file_id: file_id,
                user_id: user_id,
                moder: false,
                combo: combo,
                format: "video_note",
                text: dbuser.text,
            }
            await dbuser.save()
            await ctx.reply(dbuser.text, {
                parse_mode: "HTML"
            })
            await ctx.replyWithVideoNote(file_id, {})
            await ctx.reply(mess.text[1], {
                parse_mode: "HTML", ...Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "mail-yes")]])
            })
        }
        if (duration > 60) {
            await ctx.replyWithVideoNote(file_id, {})
            await ctx.reply(mess.text[2],)
        }
    }
    if (dbuser.idont && dbuser.stage == "cheat") {
        await ctx.reply("Прикрепите пожалуйста скрин в формате изображения.")

    }

})

bot.on("video", async (ctx) => {

    const file_id = ctx.message.video.file_id
    const user_id = ctx.message.from.id
    const duration = ctx.message.video.duration
    const dbuser = await User.findOne({ userid: user_id })
    const mess = await Text.findOne({ stage: "Game" })
    const combo = dbuser.levelGame.replace(/[^0-9]/g, "")
    if (dbuser.idont && dbuser.stage !== "cheat") {
        ctx.deleteMessage()

        if (duration <= 60) {

            dbuser.mail = {
                file_id: file_id,
                user_id: user_id,
                moder: false,
                combo: combo,
                format: "video",
                text: dbuser.text,
            }
            await dbuser.save()

            await ctx.reply(dbuser.text, {
                parse_mode: "HTML"
            })
            await ctx.replyWithVideo(file_id, {})
            await ctx.reply(mess.text[1], {
                parse_mode: "HTML", ...Markup.inlineKeyboard([
                    [Markup.button.callback("Отправить", "mail-yes")]])
            })
        }
        if (duration > 60) {
            await ctx.replyWithVideo(file_id, {})
            await ctx.reply(mess.text[2],)
        }
    }
    if (dbuser.idont && dbuser.stage == "cheat") {
        await ctx.reply("Прикрепите пожалуйста скрин в формате изображения.")

    }

})

bot.on("photo", async (ctx) => {
    console.log("1", ctx.message, "1")
    let file_id = 0
    if (!ctx.message.photo[1].file_id) {
        file_id = ctx.message.photo[0].file_id
    }
    if (ctx.message.photo[1].file_id) {
        file_id = ctx.message.photo[1].file_id
    }
    const user_id = ctx.message.from.id
    const dbuser = await User.findOne({ userid: user_id })
    const mess = await Text.findOne({ stage: "Game" })
    const combo = dbuser.levelGame.replace(/[^0-9]/g, "")


    if (dbuser.idont && dbuser.stage !== "cheat") {
        ctx.deleteMessage()
        //console.log(ctx.message)
        dbuser.mail = {
            file_id: file_id,
            user_id: user_id,
            moder: false,
            combo: combo,
            format: "photo",
            text: dbuser.text,
        }
        await dbuser.save()
        await ctx.reply(dbuser.text, {
            parse_mode: "HTML"
        })
        await ctx.replyWithPhoto(file_id, {})
        await ctx.reply(mess.text[1], {
            parse_mode: "HTML", ...Markup.inlineKeyboard([
                [Markup.button.callback("Да", "mail-yes")]])
        })

    }
    if (dbuser.idont && dbuser.stage == "cheat") {
        ctx.deleteMessage()
        dbuser.mail = {
            file_id: file_id,
            user_id: user_id,
            moder: false,
            combo: combo,
            format: "photo",
            text: "cheat",
        }
        await dbuser.save()

        await ctx.replyWithPhoto(file_id, {})
        await ctx.reply("Хотите применить чит-код?", Markup.inlineKeyboard([
            [Markup.button.callback("Отправить", "mail-yes")],
            [Markup.button.callback("Нет, напомнить задание", "lastLevel")]]))

    }
})



//////////////////////////////////////////////
//модеры
bot.action("Moder-00", async (ctx) => {
    await ctx.answerCbQuery()

    const user_id = ctx.update.callback_query.from.id
    const moder = await User.findOne({ userid: user_id })
    const content = await Mail.findOne({ moder: false })

    if (!content) ctx.reply("Для вас пока ничего нет)", Markup.inlineKeyboard(
        [Markup.button.callback("Вернуться в главное меню ↩️", "start")]))

    if (content) {
        if (content.format == "voice") {

            await ctx.reply(content.text)
            await ctx.replyWithAudio(content.file_id, {})
            moder.mailModer = content._id
            moder.save()
            await ctx.reply("Все ок?",
                Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "Moder-yes")],
                    [Markup.button.callback("Нет", "Moder-no")]]))
        }

        if (content.format == "video_note") {

            await ctx.reply(content.text)
            await ctx.replyWithVideoNote(content.file_id, {})
            moder.mailModer = content._id
            moder.save()
            await ctx.reply("Все ок?",
                Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "Moder-yes")],
                    [Markup.button.callback("Нет", "Moder-no")]]))
        }

        if (content.format == "video") {

            await ctx.reply(content.text)
            await ctx.replyWithVideo(content.file_id, {})
            moder.mailModer = content._id
            moder.save()
            await ctx.reply("Все ок?",
                Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "Moder-yes")],
                    [Markup.button.callback("Нет", "Moder-no")]]))
        }

        if (content.format == "photo") {

            await ctx.reply(content.text)
            await ctx.replyWithPhoto(content.file_id, {})
            moder.mailModer = content._id
            moder.save()
            await ctx.reply("Все ок?",
                Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "Moder-yes")],
                    [Markup.button.callback("Нет", "Moder-no")]]))
        }

        if (content.format == "text") {
            await ctx.reply(content.text)
            await ctx.reply(content.file_id)
            moder.mailModer = content._id
            moder.save()
            await ctx.reply("Все ок?",
                Markup.inlineKeyboard([
                    [Markup.button.callback("Да", "Moder-yes")],
                    [Markup.button.callback("Нет", "Moder-no")]]))
        }
    }


})

bot.action("Moder-yes", async (ctx) => {
    await ctx.answerCbQuery()
    const user_id = ctx.update.callback_query.from.id
    const moder = await User.findOne({ userid: user_id })
    const content = await Mail.findOne({ _id: moder.mailModer })

    content.moder = true
    moder.mailModer = {}
    const dbuser = await User.findOne({ userid: content.user_id })
    dbuser.idont = false
    // console.log(dbuser.score)
    // console.log(content.combo)
    dbuser.score += content.combo
    await sendMessage(content.user_id, 3)


    // let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
    // let i = arr[Math.floor(Math.random() * mess.link.length)]

    await dbuser.save()
    await content.save()
    await moder.save()
    await ctx.reply("Следующее?",
        Markup.inlineKeyboard([
            [Markup.button.callback("Да", "Moder-00")],
            [Markup.button.callback("Нет", "start")]]))

})

bot.action("Moder-no", async (ctx) => {
    await ctx.answerCbQuery()
    const user_id = ctx.update.callback_query.from.id
    const moder = await User.findOne({ userid: user_id })
    const content = await Mail.findOne({ _id: moder.mailModer })
    await sendMessage(content.user_id, 2)
    const content2 = await Mail.deleteOne({ _id: moder.mailModer })
    moder.mailModer = {}
    // await content.save() УДОЛИТЬ
    await moder.save()
    await ctx.reply("Следующее?",
        Markup.inlineKeyboard([
            [Markup.button.callback("Да", "Moder-00")],
            [Markup.button.callback("Нет", "start")]]))

})

bot.action("mail-yes", async (ctx) => {

    await ctx.answerCbQuery()
    const user_id = ctx.update.callback_query.from.id
    const dbuser = await User.findOne({ userid: user_id })
    const newMail = new Mail(dbuser.mail)
    const leVel = dbuser.levelGame.replace(/[^0-9]/g, "")
    const subLevel = dbuser.subLevelGame.replace(/[^0-9]/g, "") - 1
    if (!dbuser.idont) {
        await ctx.reply("Ваше задание уже смотрят модераторы.", {
            parse_mode: "markdown", disable_web_page_preview: true,
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Выбор уровня", "Game")]])
        })
    }

    if (dbuser.idont) {
        dbuser.level[leVel][subLevel] = 1
        await User.updateOne({ userid: user_id }, { $set: { [`level.${leVel}`]: dbuser.level[leVel] } });
        //console.log(dbuser)

        dbuser.idont = false
        if (dbuser.mail.text == "cheat") dbuser.cheat -= 1
        await newMail.save()
        dbuser.mail = {}
        await levelCheck(ctx, dbuser)
        await dbuser.save()
        //const del = await Task.deleteMany({ user_id: user_id })
        await stopJob(user_id)
        console.log()
        // await ctx.reply("Принято! Можно выполнять другие доступные задания.", {
        //     parse_mode: "markdown", disable_web_page_preview: true,
        //     ...Markup.inlineKeyboard([
        //         [Markup.button.callback("Выбор уровня", "Game")]])
        // })
    }

})
//отправка
bot.on("message", async (ctx) => {

    const textMess = ctx.message.text
    const user_id = ctx.message.from.id
    const dbuser = await User.findOne({ userid: user_id })
    const mess = await Text.findOne({ stage: "Game" })
    const combo = dbuser.levelGame.replace(/[^0-9]/g, "")
    //console.log(dbuser)

    if (dbuser.idont && dbuser.stage !== "cheat") {
        ctx.deleteMessage()

        dbuser.mail = {
            file_id: textMess,
            user_id: user_id,
            moder: false,
            combo: combo,
            format: "text",
            text: dbuser.text,
        }
        await dbuser.save()
        await ctx.reply(dbuser.text, {
            parse_mode: "HTML"
        })
        await ctx.reply(textMess)
        await ctx.reply(mess.text[1], {
            parse_mode: "HTML", ...Markup.inlineKeyboard([
                [Markup.button.callback("Да", "mail-yes")]])
        })
    }
    if (dbuser.idont && dbuser.stage == "cheat") {
        await ctx.reply("Прикрепите, пожалуйста, скрин к вашему ответу.")

    }


})



bot.launch()
