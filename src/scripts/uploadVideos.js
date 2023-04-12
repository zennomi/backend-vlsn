require("dotenv").config();
const mongoose = require("../configs/mongoose")

const Video = require("../models/video.model")
const Course = require("../models/course.model")

const inputs = [
  {
    file: "./data/daodongco.json",
    name: "Dao Động Cơ"
  },
  {
    file: "./data/songco.json",
    name: "Sóng Cơ"
  },
  {
    file: "./data/machlc.json",
    name: "Mạch LC - Sóng điện từ"
  },
  {
    file: "./data/dienxoaychieu.json",
    name: "Điện Xoay Chiều"
  },
  {
    file: "./data/songanhsang.json",
    name: "Sóng Ánh Sáng"
  },
  {
    file: "./data/luongtu.json",
    name: "Lượng Tử Ánh Sáng"
  },
  {
    file: "./data/hatnhan.json",
    name: "Vật Lý Hạt Nhân"
  }
]
const input = inputs[6]
const data = require(input.file)
const courseName = input.name;

(async () => {
  const videos = await Promise.all(data.map(video => {
    return (() => {
      return Video.create({
        title: video.title,
        url: video.url,
        description: video.description,
        isPublic: true,
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
  console.log("Done")
})()
