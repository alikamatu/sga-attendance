require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("pg");

const app = express();
app.use(cors());  
app.use(express.json());