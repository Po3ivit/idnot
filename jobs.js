const CronJob = require('cron').CronJob;
const { User, Task } = require('./schemas')

class FormJobs {
    context;
    tgBot;

    initialize = bot => {
        this.tgBot = bot;
        this.restoreTask()
    }

    getContext = () => {
        return this.context;
    }

    saveTask = async (userId, taskData) => {
        for (const info of taskData) {
            const { date, message, image } = info;
            const task = new Task({
                user_id: userId,
                date,
                message,
                image
            })
            task.save()
        }
    }
    createJob = (userId, date, message, image) => {
        const job = new CronJob(
            new Date(date),
            async () => {
                this.tgBot.telegram.sendMediaGroup(userId, [
                    {
                        media: { source: image },
                        caption: message,
                        type: 'photo'
                    }]);


                job.stop()
                const del = await Task.deleteOne({ date: date })
                console.log("JobDone")
            },

            () => {
            },
            true
        )
        this.context = { ...this.context, [userId + date]: job }
        job.start()
    }

    restoreTask = async () => {
        const tasks = await Task.find({});
        console.log('Восстановление задач')
        if (tasks?.length) {
            for (let task of tasks) {
                const { date, message, image, user_id } = task;
                if (Date.now() > date) {
                    continue;
                }
                this.createJob(user_id, date, message, image)
            }
        }
    }

    formJob = async (userId) => {
        const dateNow = Date.now()
        const taskData = [
            {
                date: dateNow + 1000 * 3600 * 19,
                message: "Тик-так. До конца задания — 5 часов.",
                image: "./assets/images/5.webp",
            },
            {
                date: dateNow + 1000 * 3600 * 22,
                message: "Тик-так. До конца задания — 2 часа.",
                image: "./assets/images/2.webp",

            },
            {
                date: dateNow + 1000 * 3600 * 23,
                message: "Тик-так. До конца задания — 1 час.",
                image: "./assets/images/1.webp",

            },
            {
                date: dateNow + 1000 * 3600 * 24,
                message: "Тик-так. Время вышло.",
                image: "./assets/images/1.webp",

            }
        ]
        await this.saveTask(userId, taskData)
        for (let info of taskData) {
            const { date, message, image } = info;
            this.createJob(userId, date, message, image)
        }
    }
}
module.exports = new FormJobs();