import jwt from "jsonwebtoken"


export async function genToken(userId) {
    return jwt.sign({
        id: userId
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )
}