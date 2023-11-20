"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "000";
class JWTService {
    static generateTokenForUser(user) {
        try {
            const payload = {
                id: user === null || user === void 0 ? void 0 : user.id,
                email: user === null || user === void 0 ? void 0 : user.email
            };
            const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET);
            return token;
        }
        catch (error) {
            console.error("Error generating token:", error);
            throw new Error("Unable to generate token");
        }
    }
    static decodeToken(token) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decodedToken;
        }
        catch (error) {
            console.error("Error decoding token:", error);
            throw new Error("Invalid token");
        }
    }
}
exports.default = JWTService;
