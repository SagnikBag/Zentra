import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user",
        required:true
    },
    price:{
        amount:{
            type:String,
            required: true
        },
        currency:{
            type:String,
            enum: ["USD","GBP","INR","JPY","EUR"],
            default:"INR"
        }
    },
    images:[
        {
            url:{
                type: String,
                required :true
            }
            

        }
    ],
    varient:[
        {
            images: [
                {
                    url:{
                        type: String,
                        required: true
                    }
                }
            ],
             stock:{
                type:Number,
                default:0
            },
            attridutes:{
                type:Map,
                of: String
            },
            price:{
                amount:{
                    type:Number,
                    required: true
                },
                currency:{
                    type:String,
                    enum:["USD","EUR","GBP","JPY","INR"],
                    default: "INR"
                }
            }
        }   
       
    ]


}, {timestamps: true})

const productModel = mongoose.model("product",productSchema)

export default productModel