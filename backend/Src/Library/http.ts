import Node from "#Node"
import http from "http"
import "dotenv/config"
import "../Boot/Server"

export function load(){
    Node.HttpServer=http.createServer(Node.Express)
    console.log("HTTP server created")
}