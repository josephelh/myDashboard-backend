import mongoose from 'mongoose';

const clientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
        type: String,
        required: true,
      },
    address: {
      type: String,
      required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },    
  },
  {
    timestamps: true,
  }
)


const Client = mongoose.model('Client', clientSchema)

export default Client
