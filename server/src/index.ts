import { app } from "./app.js";
import connectDb from "./db/index.js";

connectDb().then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
}).catch((err) => {
    console.error("MongoDB connection FAILED!!! ", err);
})