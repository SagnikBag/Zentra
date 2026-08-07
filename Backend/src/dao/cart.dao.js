import cartModel from "../model/cart.model.js";
import mongoose from "mongoose";

export async function getCartDetails(userId){

        let cart = (await cartModel.aggregate(
  [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId)
      }
    },
    { $unwind: { path: '$items' } },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'items.product'
      }
    },
    { $unwind: { path: '$items.product' } },
    {
      $unwind: {
        path: '$items.product.variants',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        $expr: {
          $or: [
            { $eq: ['$items.variants', '$items.product.variants._id'] },
            { $eq: ['$items.variant', '$items.product.variants._id'] },
            { $eq: [{ $ifNull: ['$items.variants', '$items.variant'] }, null] },
            { $eq: ['$items.product.variants', null] }
          ]
        }
      }
    },
    {
      $addFields: {
        'items.price': {
          $ifNull: ['$items.price', '$items.product.variants.price', '$items.product.price']
        },
        itemPrice: {
          price: {
            $multiply: [
              '$items.quantity',
              {
                $ifNull: [
                  '$items.product.variants.price.amount',
                  '$items.product.price.amount',
                  '$items.price.amount',
                  0
                ]
              }
            ]
          },
          currency: {
            $ifNull: [
              '$items.product.variants.price.currency',
              '$items.product.price.currency',
              '$items.price.currency',
              'INR'
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        user: { $first: '$user' },
        totalPrice: { $sum: '$itemPrice.price' },
        currency: { $first: '$itemPrice.currency' },
        items: { $push: '$items' }
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
))[0];

  return cart;

}

