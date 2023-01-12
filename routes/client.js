import express from "express";
const router = express.Router();
import {
  registerClient,
  getClient,
  getClients,
  deleteClient,
  updateClient,
} from "../controllers/client.js";

import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/").post(protect, registerClient).get(protect, getClients);
router
  .route("/:id")
  .get(protect, getClient)
  .delete(protect, admin, deleteClient)
  .put(protect, updateClient);

export default router;
