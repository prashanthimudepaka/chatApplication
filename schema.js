const {Schema,model}=require('mongoose')
const { stringify } = require('uuid')
const tokenSchema=new Schema({
    userToken:{
        type:String,
        require:true,

    },
    messages:[
        {
            username:{
                type:String,
                required:true
            },
            from:{
                type:String,
                required:true
        },
        message:{
            type:String,
            required:true,

        },
        time:{
            type:String,
            required:true
        }
    }
    ]
})
const tokenModel=model("messages",tokenSchema)
module.exports=tokenModel