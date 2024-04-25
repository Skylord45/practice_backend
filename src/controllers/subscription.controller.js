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


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
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
        throw new ApiError(200, "you can not subscribe your channel")
   }

//    check for channel already subscribe or not ?

 const alredySubscribe = await Subscription.findOne({
    channel : channel._id,
    subscriber : req.user?._id
})

if(alredySubscribe){
    throw new ApiError(400, "you already suscribe this channel")
}


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}