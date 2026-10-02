import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { AWS_REGION, PORT, TABLE_NAME } from "./envs.js";
import { messageGenerator } from "./message.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const client = new DynamoDBClient({
  region: AWS_REGION,
});

const dynamoDB = DynamoDBDocumentClient.from(client);

/* =========================
   Health Check
========================= */

app.get("/", (req, res) => {
  res.send("Hello World! 2222");
});

/* =========================
   Create User
========================= */

app.post("/create", async (req, res) => {
  const { id, username, age } = req.body;

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,

      Item: {
        id,
        username,
        age,
      },
    });

    const data = await dynamoDB.send(command);

    res.json(
      messageGenerator(
        200,
        "User created successfully",
        data
      )
    );
  } catch (err) {
    console.error("DynamoDB error:", err);

    res.status(500).json({
      message: err.message,
      name: err.name,
    });
  }
});



/* =========================
   Update User
========================= */

app.put("/update", async (req, res) => {
  const { id, username, age } = req.body;

  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,

      Key: {
        id,
      },

      UpdateExpression:
        "SET #username = :username, #age = :age",

      ExpressionAttributeNames: {
        "#username": "username",
        "#age": "age",
      },

      ExpressionAttributeValues: {
        ":username": username,
        ":age": age,
      },

      ReturnValues: "ALL_NEW",
    });

    const data = await dynamoDB.send(command);

    res.json(
      messageGenerator(
        200,
        "User updated successfully",
        data
      )
    );
  } catch (err) {
    console.error("DynamoDB error:", err);

    res.status(500).json({
      message: err.message,
      name: err.name,
    });
  }
});

/* =========================
   Delete User
========================= */

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id,
      },
    });

    const data = await dynamoDB.send(command);

    console.log("DynamoDB response:", data);

    if (!data.Item) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(
      messageGenerator(
        200,
        "User fetched successfully",
        data.Item
      )
    );
  } catch (err) {
    console.error("DynamoDB error:", err);

    return res.status(500).json({
      message: err.message,
      name: err.name,
    });
  }
});

/* =========================
   Start Server
========================= */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});