import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import clientRoutes from "./routes/client.js";
import userRoutes from "./routes/user.js";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import {notFound , errorHandler} from "./middleware/errorMiddleware.js"; 



/* configuration*/ 
 
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


/* Routes*/

app.use("/users", userRoutes);
app.use("/clients", clientRoutes);
app.use("/products", productRoutes);
app.use("/order", orderRoutes);
app.use('/upload', uploadRoutes);



app.use(notFound)
app.use(errorHandler)


/* setting up mongo DB Connection */

const PORT = process.env.PORT || 9000;
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_CONNECTION).then(()=> {
 app.listen(PORT, ()=> console.log(`Server Port : ${PORT}`));
}).catch((error) => console.log(`${error} did not connect `));