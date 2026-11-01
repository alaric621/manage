import { http, HttpResponse } from 'msw'
import { ws } from 'msw/ws'
import users from "./user"

const chat = ws.link('wss://api.example.com/chat')

export const handlers = [
   ...users
]