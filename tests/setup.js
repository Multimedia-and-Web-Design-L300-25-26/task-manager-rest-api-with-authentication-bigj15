import path from "node:path";
import dns from "node:dns";
import dotenv from "dotenv";
import mongoose from "mongoose";

const testEnvPath = path.resolve(process.cwd(), ".env.test");
const appEnvPath = path.resolve(process.cwd(), ".env");

const testEnv = dotenv.config({ path: testEnvPath }).parsed || {};
const appEnv = dotenv.config({ path: appEnvPath }).parsed || {};

// Keep first value only while preserving order.
const candidateUris = [
	testEnv.MONGO_URI,
	appEnv.MONGO_URI,
	process.env.MONGO_URI,
].filter((uri, index, arr) => uri && arr.indexOf(uri) === index);

beforeAll(async () => {
	// Force stable public resolvers for Atlas SRV DNS lookups in test runs.
	dns.setServers(["1.1.1.1", "8.8.8.8"]);

	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET is missing. Add it to .env or .env.test for test runs.");
	}

	if (candidateUris.length === 0) {
		throw new Error("MONGO_URI is missing. Add it to .env or .env.test for test runs.");
	}

	let lastError;

	for (const uri of candidateUris) {
		try {
			await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
			await mongoose.connection.dropDatabase();
			return;
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError;
});

afterAll(async () => {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
	}
});