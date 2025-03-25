const {Schema,model}=require('mongoose')

const signUpSchema=new Schema({
    userName:{
        type:String,
        required:true
    },
    UserEmail:{
            type:String,
            required:true
    },
    UserPassword:{
        type:String,
        required:true
    },
    UserConfirmPassword:{
        type:String,
        required:true
    }

})
const signUp= new model("userinfo",signUpSchema)
module.exports={signUp}