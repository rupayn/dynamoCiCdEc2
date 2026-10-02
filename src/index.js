import express from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { AWS_REGION, PORT, TABLE_NAME } from './envs.js';
import cors from 'cors';
import dotenv from 'dotenv';

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { messageGenerator } from './message.js';

dotenv.config();

const app = express();

app.use(express.json())
app.use(cors())

const client = new DynamoDBClient({
  region: AWS_REGION,

});

const dynamoDB = DynamoDBDocumentClient.from(client);



app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.put('/update', async (req, res) => {
    const {id,...data} = req.body;
    
    try {
      const command = new UpdateCommand({
      TableName: TABLE_NAME,

      Key: {
        id,
      },

      UpdateExpression: 'SET #name = :name, #age = :age',

      ExpressionAttributeNames: {
        '#name': 'name',
        '#age': 'age',
      },

      ExpressionAttributeValues: {
        ':name': data.name,
        ':age': data.age,
      },

      ReturnValues: 'ALL_NEW',
    });

    const data = await dynamoDB.send(command);
      res.json(messageGenerator(200,"User updated successfully",data));
    } catch (err) {
      res.status(500).send(err);
    }
})


app.post('/create', async (req, res) => {
  const { id, name, age } = req.body;

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id,
        name,
        age,
      },
    });

    const data = await dynamoDB.send(command);
    res.json(messageGenerator(200,"User created successfully",data));
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/:id', async (req, res) => {
  const { id } = req.params;
 

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id,
      },
    });
    const data = await dynamoDB.send(command);
    res.json(messageGenerator(200,"User fetched successfully",data));
  } catch (err) {
    res.status(500).send(err);
  }
});


app.delete('/:id', async (req, res) => {
  const { id } = req.params;
  

  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,

      Key: {
        id,
      },
    });

    const data = await dynamoDB.send(command);
    res.json(messageGenerator(200,"User deleted successfully",data));
  } catch (err) {
    res.status(500).send(err);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});