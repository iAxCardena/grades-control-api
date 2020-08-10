import express from "express";
import { promises as fs, read } from "fs";

const { readFile, writeFile } = fs;
const router = express.Router();

//Endpoint para criar uma grade. Recebe como parametros os campos student, subject, type, value e salva no arquivo grades.json.
router.post("/", async (req, res) => {
    try {
        let grade = req.body;

        if (!grade.student || !grade.subject || !grade.type || !grade.value) {
            throw new Error("Os campos Student, Subject, Type e Value sao obrigatorios");
        }

        const data = JSON.parse(await readFile(global.fileName));

        grade = {
            id: data.nextId++,
            student: grade.student,
            subject: grade.subject,
            type: grade.type,
            value: grade.value,
            timestamp: new Date()
        };

        data.grades.push(grade);

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.send(grade);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

//Endpoint para atualizar uma grade. Recebe como parametros o id da grade a ser alterada e os campos student, subject, type e value. Valida se a grade informada existe.
router.put("/updateGrade", async (req, res) => {
    try {
        const grade = req.body;

        if (!grade.id || !grade.student || !grade.subject || !grade.type || !grade.value) {
            throw new Error("Os campos ID, Student, Subject, Type, Value sao obrigatorios");
        }

        const data = JSON.parse(await readFile(global.fileName));
        const index = data.grades.findIndex(a => a.id === grade.id);

        if (index === -1) {
            throw new Error("Registro nao encontrado");
        }

        data.grades[index].student = grade.student;
        data.grades[index].subject = grade.subject;
        data.grades[index].type = grade.type;
        data.grades[index].value = grade.value;

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.send(grade);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

//Endpoint para excluir uma grade. Recebe como parametro o id da grade e realiza sua exclusao do arquivo grades.json
router.delete("/:id", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));

        data.grades = data.grades.filter(grade => grade.id !== parseInt(req.params.id));

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.end();
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

//Endpoint para consultar uma grade em especifico. Recebe como parametro o id da grade e retorna suas informacoes
router.get("/:id", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const grade = data.grades.find(grade => {
            return grade.id === parseInt(req.params.id);
        });

        res.send(grade);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

/*Endpoint para consultar a nota total de um aluno em uma disciplina. Recebe como parametro o student e o subject, e realiza a soma de todas as notas de atividades correspondentes
a aquele subject para aquele student. Retorna a soma da propriedade value dos registros encontrados*/
router.get("/total/:student/:subject", async (req, res) => {
    try {
        const student = req.params.student;
        const subject = req.params.subject;
        const data = JSON.parse(await readFile(global.fileName));

        const studentGrades = data.grades.filter(grade => {     //retorna apenas as entradas que sejam iguais em Student e Subject
            return grade.student === student && grade.subject === subject;
        });


        const sum = studentGrades.reduce((acc, curr) => {   //realiza a soma dos Value de cada grade
            return acc + curr.value;
        }, 0);

        res.send("Soma das notas: " + JSON.stringify(sum));
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

/**Endpoint para consultar a media das grades de determinado subject e type. Recebe como parametro um subject e um type, e retorna a media*/
router.get("/media/:subject/:type", async (req, res) => {
    const subject = req.params.subject;
    const type = req.params.type;
    const data = JSON.parse(await readFile(global.fileName));
    let count = 0;

    const subjectType = data.grades.filter(grade => {   //retorna apenas as entradas que sejam iguais em Subject e Type
        if (grade.subject === subject && grade.type === type) {
            count++;    //contador de grades
            return grade;
        }
    })

    let media = subjectType.reduce((acc, curr) => {     //realiza a soma dos Value de cada grade
        return acc + curr.value;
    }, 0);

    media = media / count;   //divide a soma pelo total de grades

    console.log(subjectType);
    res.send("Media das notas: " + parseFloat(media));
});

/**Endpoint para retornar as tres melhores grades de acordo com determinado subject e type. Recebe como parametro um subject e um type, e retorna um array com os tres registros de maior value
daquele subject e type em ordem decrescente */
router.get("/maior/:subject/:type", async (req, res) => {
    const subject = req.params.subject;
    const type = req.params.type;
    const data = JSON.parse(await readFile(global.fileName));
    let maioresGrades = [];

    let subjectType = data.grades.filter(grade => {     //retorna apenas as entradas que sejam iguais em Subject e Type
        return grade.subject === subject && grade.type === type;
    });

    subjectType = subjectType.sort((a, b) => {      //ordena o array com os maiores Values
        return b.value - a.value;
    });

    for (let i = 0; i < 3; i++) {       //passa os primeiros tres valores para outro array
        maioresGrades.push(subjectType[i]);
    }

    res.send(maioresGrades);
});

export default router;