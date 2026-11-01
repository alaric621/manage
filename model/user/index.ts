import { http, HttpResponse } from 'msw'

export default [
      http.get('/api/user', () => {
            return HttpResponse.json({ id: 1, name: '张三' })
      })

]
