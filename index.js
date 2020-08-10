import express from "express";
import { promises as fs } from "fs";
import routerGrades from "./grades/grades.js";

global.fileName = "grades.json";
const app = express();
const { readFile, writeFile } = fs;

app.use(express.json());
app.use("/grades", routerGrades);

app.listen(3000, async () => {
    try {
        await readFile(global.fileName);
        console.log("API Started");
    } catch (err) {
        console.log(err);
    }
});