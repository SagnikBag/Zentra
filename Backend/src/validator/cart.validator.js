import {param,body,validationResult} from 'express-validator'

const validateRequest = (req,res,next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array()
        })
    }
    next()
}

// export const validateAddToCart = [
//     param('productId').isMongoId().withMessage("Invalid product ID"),
//     param('variantId').isMongoId().withMessage('Invalid variant ID'),
//     body('quantity').optional().isInt({min:1}).withMessage('Quantity must be atleast 1'),

//     validateRequest
// ]
// export const validateAddToCart = [
//     param('productId')
//         .isMongoId()
//         .withMessage("Invalid product ID"),

//     param('variantId')
//         .custom((value) => {
//             // Allow Base Model
//             if (value === "null" || value === "undefined") {
//                 return true;
//             }

//             // Otherwise it must be a valid MongoDB ObjectId
//             return mongoose.Types.ObjectId.isValid(value);
//         })
//         .withMessage('Invalid variant ID'),

//     body('quantity')
//         .optional()
//         .isInt({ min: 1 })
//         .withMessage('Quantity must be atleast 1'),

//     validateRequest
// ];

// export const validateAddToCart = [
//     param('productId')
//         .isMongoId()
//         .withMessage("Invalid product ID"),

//     param('variantId')
//         .custom((value) => {
//             if (
//                 value === "null" ||
//                 value === "undefined" ||
//                 value === ""
//             ) {
//                 return true;
//             }

//             return mongoose.Types.ObjectId.isValid(value);
//         })
//         .withMessage("Invalid variant ID"),

//     body('quantity')
//         .optional()
//         .isInt({ min: 1 })
//         .withMessage('Quantity must be atleast 1'),

//     validateRequest
// ];



export const validateAddToCart = [
    param("productId")
        .isMongoId()
        .withMessage("Invalid product ID"),

    param("variantId")
        .isMongoId()
        .withMessage("Invalid variant ID"),

    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log("❌ VALIDATION ERRORS:", errors.array());

            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array()
            });
        }

        next();
    }
];

export const validateIncrementCartitemQuantity = [
    param('productId').isMongoId().withMessage("Invalid product Id"),
    param('variantId').optional().isMongoId().withMessage("Invalid variant Id"),

    validateRequest
]