// BACKEND INITIALIZATION
import { initServer } from "./app"

async function init() {
   const app = await initServer()
   
   app.listen(8000, () => {
      console.log("Server started on port 8000")
   })
}

init()
