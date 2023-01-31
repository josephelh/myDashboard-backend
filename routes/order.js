import express from 'express'
const router = express.Router()
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getUserOrders,
  getCurrentUserOrders,
  getClientOrders,
  getProductOrderCountByMonth,
  getMonthlyOrderTotal,
  getOrders,
} from '../controllers/order.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders)
router.route('/products/:id').get(protect, getProductOrderCountByMonth)
router.route('/orderstotal/:id').get(protect, getMonthlyOrderTotal)
router.route('/user/:id').get(protect,admin, getUserOrders)
router.route('/myorders').get(protect, getCurrentUserOrders)
router.route('/client/:id').get(protect, getClientOrders)
router.route('/:id').get(protect, getOrderById) 
router.route('/pay/:id').put(protect, updateOrderToPaid)
router.route('/:id/deliver').put(protect,updateOrderToDelivered) 

export default router