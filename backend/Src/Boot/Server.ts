import express from "express";
import Node from "#Node";
import fs from "fs";
import cors from "cors";
import path from "path";
import url from "url";
import jwt from "jsonwebtoken";
import * as socket from "socket.io";
import mongoose from "mongoose";
import morgan from "morgan"
import Joi from "joi"
import bcrypt from "bcrypt"

Node.Fs = fs;
Node.Path = path;
Node.URL = url;
Node.Jwt = jwt;
Node.Socket = socket;
Node.JOI=Joi
Node.Mongoose = mongoose;
Node.Bcrypt =bcrypt
Node.Express = express();
Node.Router = express.Router();

Node.Express.use(morgan("dev"))
Node.Express.use(express.urlencoded({limit:"5mb"}))
Node.Express.use(express.json({limit:"5mb"}))
Node.Express.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);

Node.Initialize=async(port="8080")=>{
    process.env.PORT=port || process.env.PORT || "8080"

    await (await import ("#Library/http")).load()
    await (await import ("#Library/mongo")).load()
    await (await import ("#Library/Routes"))
     await (await import("#Library/Socket")).load();

    Node.HttpServer.listen(process.env.PORT,()=>{
        console.log(`Servver Started on port :${process.env.PORT}`)
    })
}

