import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import Client from '../models/clientModel.js'
import User from '../models/userModel.js'

// @desc    Register a new user
// @route   POST users
// @access  Public
const registerClient = asyncHandler(async (req, res) => {
    const {name,address,phone,user} = req.body

  const client = new Client({
    name,
    address,
    phone,
    user,
})
  
const createdClient = await client.save()
res.status(201).json(createdClient)

})

// @desc    Get client
// @route   GET clients/:id
// @access  Private
const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id) 

  if (client) {
    const user = await User.findById(client.user)
    res.json({
      _id: client._id,
      name: client.name,
      address: client.address,
      phone: client.phone,
      user:user.name,
    })
  } else {
    res.status(404)
    throw new Error('Client not found')
  }
})

// @desc    Get all clients
// @route   GET clients
// @access  Private/Admin
const getClients = asyncHandler(async (req, res) => {
    try {
      let keyword = {};
      if(req.query.keyword) {
          keyword = {
              $or: [
                  { name: { $regex: req.query.keyword, $options: 'i' } },
                  { address: { $regex: req.query.keyword, $options: 'i' } }
              ] 
          }
      }
        const clients = await Client.find(keyword).populate({
          path: 'user',
          select: 'name',
        });
    
        res.json(clients);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
})

// @desc    Delete client
// @route   DELETE clients/:id
// @access  Private/Admin
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id)

  if (client) {
    await client.remove()
    res.json({ message: 'client removed' })
  } else {
    res.status(404)
    throw new Error('client not found')
  }
})

// @desc    Update client
// @route   PUT clients/:id
// @access  Private
const updateClient = asyncHandler(async (req, res) => {
    const client = await Client.findById(req.params.id)
  
    if (client) {
      client.name = req.body.name || client.name
      client.address = req.body.address || client.address
      client.phone = req.body.phone || client.phone
      client.user = client.user     
  
     client.save()
     res.json({ message: 'Client updated' })
  
    } else {
      res.status(404)
      throw new Error('Client not found')
    }
  })

export {
  registerClient,
  getClient,
  getClients,
  deleteClient,
  updateClient,
  
}
