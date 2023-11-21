import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTuser } from "../interfaces";

const JWT_SECRET = "000";

export default class JWTService {
	public static generateTokenForUser(user: User): string {
		try {
			const payload: JWTuser = {
				id: user?.id,
				email: user?.email,
			};
			const token = JWT.sign(payload, JWT_SECRET);
			return token;
		} catch (error) {
			console.error("Error in generating token", error);
			throw new Error("Unable to generate token");
		}
	}
   
	public static decodeToken(token: string) {
		try {
			return JWT.verify(token, JWT_SECRET) as JWTuser;
		} catch (error) {
			return null;
		}
	}
}
