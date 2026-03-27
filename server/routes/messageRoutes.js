import  express  from "express";
import { textMessageController } from "../controllers/messaeController.js";
import { protect } from "../middlewares/Auth.js";


const messageRouter = express.Router();

messageRouter.post('/text', protect, textMessageController);


export default messageRouter;