require("dotenv").config();
const mongoose = require("../configs/mongoose")

const Video = require("../models/video.model")
const Course = require("../models/course.model")

const input = [
    {
        file: "./data/daodongco.json",
        name: "Dao Động Cơ"
    },
    {
        file: "./data/songco.json",
        name: "Sóng Cơ"
    },
]

const data = require(input[1].file)
const courseName = input[1].name;

(async () => {
    const videos = await Promise.all(data.map(video => {
        return (() => {
            return Video.create({
                title: video.title,
                url: video.url,
                description: video.description,
                isPublic: false,
                grade: 12,
            })
        })()
    }))
    const course = await Course.create({
        title: courseName,
        grade: 12,
        description: courseName,
        coverURL: "https://i.imgur.com/4QKzSWl.jpeg",
        isPublished: true,
        isSale: false,
        videos: videos.map((v, index) => ({ id: v._id, index })),
        price: 200000
    })
})()