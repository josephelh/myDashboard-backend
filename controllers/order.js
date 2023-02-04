import asyncHandler from "express-async-handler";
import Order from "../models/orederModel.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, itemsPrice, taxPrice, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
    return;
  } else {
    const order = new Order({
      orderItems,
      user: req.body.user,
      client: req.body.client,
      itemsPrice,
      taxPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name _id")
    .populate({
      path: "client",
      select: "name _id",
    });

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name _id")
    .populate({
      path: "client",
      select: "name _id",
    });

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name _id")
    .populate({
      path: "client",
      select: "name _id",
    });

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get  user orders
// @route   GET /api/orders/userorders
// @access  Private
const getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, pageSize = 15, id} = req.query;

    const orders = await Order.find({user: id}).populate({
      path: "client",
      select: "name _id",
    }).sort({createdAt: -1}).skip(page * pageSize).limit(pageSize);

    const total = await Order.countDocuments({user: id})


    if (!orders) {
      res.status(404).json({ message: "No orders found for the user" });
    } else {
      res.json({orders,total,pages: Math.ceil(total / pageSize)});
    }
  } catch (err) {
    next(err);
  } 
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getCurrentUserOrders = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, pageSize = 15, id} = req.query;
    const orders = await Order.find({ user: id })
      .populate({
        path: "client",
        select: "name _id",
      })
      .sort({ createdAt: -1 }).sort({createdAt: -1}).skip(page * pageSize).limit(pageSize);

      const total = await Order.countDocuments(id)

    if (!orders) {
      res.status(404).json({ message: "No orders found " });
    } else {
      res.json({orders, pages: Math.ceil(total / pageSize) , total});
    }
  } catch (err) {
    next(err);
  }
});


// @desc    Get Client Orders
// @route   GET /api/orders/cleint/:id
// @access  Private
const getClientOrders = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, pageSize = 15, id} = req.query;

    const orders = await Order.find({ client: id })
      .populate("user", "name _id")
      .sort({createdAt: -1}).skip(page * pageSize).limit(pageSize)  
      

    const total = await Order.countDocuments({client:id});

    if (!orders) {
      res.status(404).json({ message: "No orders found for the client" });
    } else {
      res.json({orders, total, pages: Math.ceil(total / pageSize)});
    }
  } catch (err) {
    next(err);
  }
});



const getOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 15, sort = null, keyword = "" } = req.query;

    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };

      return sortFormatted;
    };
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    const orders = await Order.find({
      $or: [
        { orderItems: { $elemMatch: { name: { $regex: new RegExp(keyword, "i") } } } },
      ],
    }).populate("user", "name _id").populate({path: "client",select: "name _id"}).sort({ createdAt: -1 })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Order.countDocuments({
      $or: [
        { "orderItems.name": { $regex: new RegExp(keyword, "i") } },
      ],
    })

    res.status(200).json({
      orders,
      total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getMonthlyOrderTotal = async (req, res) => {
  try {
    const year = req.params.id;
    const aggregatePipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000`),
            $lt: new Date(`${year}-12-31T23:59:59.999`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          total: {
            $sum: "$totalPrice",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    const orderTotals = await Order.aggregate(aggregatePipeline);
    res.json(orderTotals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getYearlyOrdersTotal = async (req, res) => {
  try {
    const year = req.params.id;
    const aggregatePipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000`),
            $lt: new Date(`${year}-12-31T23:59:59.999`),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalPrice",
          },
        },
      },
    ];
    const orderTotal = await Order.aggregate(aggregatePipeline);
    if (orderTotal.length === 0) {
      res.json({total:0});
    } else {
      res.json({ total: orderTotal[0].total });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductOrderCountByMonth = asyncHandler(async (req, res, next) => {
  try {
    const year = req.params.id;
    const month = req.query.month;

    const aggregatePipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-${month ? month : '01'}-01`),
            $lt: new Date(`${year}-${month ? month : '12'}-31`),
          },
        },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: {
            product: "$orderItems.product",
            month: { $month: "$createdAt" },
          },
          name: { $first: "$orderItems.name" },
          totalPurshases: { $sum: "$orderItems.qty" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "product_detail",
        },
      },
      {
        $unwind: "$product_detail",
      },
      {
        $sort: {
          "_id.month": -1,
          total: -1,
        },
      },
    ];

    const productOrderCount = await Order.aggregate(aggregatePipeline);
    if (productOrderCount.length === 0) {
      res.json([]);
  } else {
      res.json(productOrderCount);
  }
  } catch (err) {
    next(err);
  }
});

const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.remove();
    res.json({ message: "Order removed" });
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getUserOrders,
  getClientOrders,
  getCurrentUserOrders,
  getProductOrderCountByMonth,
  getMonthlyOrderTotal,
  getOrders,
  deleteOrder, 
  getYearlyOrdersTotal
}; 
