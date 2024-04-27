import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// controller to subscribe or unsubscribe 
/*
(1) req.params mathi channelId levi
(2) user find karvo db ma valid che ke nai
(3) jo valid hoy to subscription ma jovu subscribe che ke nai

*/


// means if subscribe than unsubscribe and viseversa !!
const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    
   try {
     const {channelId} = req.params
 
     if(!isValidObjectId(channelId)){
         throw new ApiError(400, "Invalid channel Id") 
     }
 
    const channel = await User.findById(channelId);
 
    if(!channel){
         throw new ApiError(400, "channel not found")
    }
 
 //    check for user select his channel or not..
    if(channel._id.toString() === req.user?._id.toString()){
         throw new ApiError(200, "you can not subscribe your own channel")
    }
 
 //    check for channel already subscribe or not ?
  const alredySubscribe = await Subscription.findOne({
         channel : channel._id,
         subscriber : req.user?._id
 })
 
     if(alredySubscribe){
         await Subscription.findByIdAndDelete(alredySubscribe);
 
         return res
         .status(200)
         .json(new ApiResponse(200, {}, "channel unsubscribe successfully !!"))
     }
     else {
         await Subscription.create({
             subscriber : req.user?._id,
             channel : channel._id
         })
     }
     return res
     .status(200)
     .json(new ApiResponse(200, {}, "channel subscribe succesfully !!"))
 
   } catch (error) {
    throw new ApiError(500, error ,error?.message || "something went wrong while toggleing your susbcription ")
   }

})

// controller to return subscriber list of a channel => find in channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const {channelId} = req.params

   try {

     if(!isValidObjectId(channelId)){
         throw new ApiError(400, "Invalid user channel_id")
     }
 
     const channel = await User.findOne(channelId)

     if(!channel){
         throw new ApiError(400, "channel cannot found")
     }
 
     // have list devanu che to aapde return array karavi sakay ka to pipeline lakhi sakay
 
     // (1) by array method 
 
     // const channelSubscription = await Subscription.find({
     //     channel : channelId,
     // })
 
     // if(!channelSubscription || channelSubscription.length === 0){
     //     throw new ApiError(400, "no channel subscriber found !!")
     // }
     // const subscriberId = channelSubscription.map(Subscription => Subscription.subscriber)
 
 
     // (2) by aggrigation pipelines
 
     const Subscribers = await Subscription.aggregate([
         {
             $match : {
                 channel : new mongoose.Types.ObjectId(channelId)
             }
         },
         {
             $lookup : {
                 from : "User",
                 localField : "channel",
                 foreignField : "_id",
                 as : "subscriber"
             }
         },
         {
             $project : {
                 Subscribers : {
                     _id : 1,
                     userName : 1,
                     email : 1
                 }
             }
         }
     ])
 
     return res
     .status(200)
     .json( new ApiResponse(200, Subscribers, "Subscriber fatched successfully"))
   } catch (error) {
     throw new ApiError(500, error ,error?.message || "something went wrong while fatching subscriber  ")
   }
})

// controller to return channel list to which user has subscribed => find in subscriber
const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    const { subscriberId } = req.params

    try {
        
    
        if(!isValidObjectId(subscriberId)){
            throw new ApiError(400, "Invalid subscriber_id")
        }
    
        const subscriber = await User.findById(subscriberId)
        if(!subscriber){
            throw new ApiError(400, "subscriber couldnot found")
        }
    
        const subscribedChannel = await Subscription.aggregate([
            {
                $match:{
                    subscriber : new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                // left join from user
                $lookup:{
                    from:"user",
                    localField:"subscriber",
                    foreignField:"_id",
                    as:"subscribed"
                }
            },
            {
                // what to show user
                $project:{
                    subscribedChannel:{
                        _id : 1,
                        fullName : 1,
                        userName : 1,
                        email : 1,
                    }
                }
    
            }
        ])
    
        if(!subscribedChannel.length){
            throw new ApiError(400, "No channel subscribed")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannel, "channel subscribed successfully fetched !!")
        )
    
    } catch (error) {
        throw new ApiError(500, error ,error?.message || "something went wrong while fatching channe's subscribed")
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}