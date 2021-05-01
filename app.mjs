import express from 'express';
import log from '@ajar/marker';
import morgan from 'morgan';
import usersRouter from "./routes/usersRouter.mjs";

const { PORT, HOST } = process.env;

const app = express()

app.use(morgan('dev'));
app.use(express.json());

app.get('/',  (req, res) => {
    res.status(200).send('Hello Express!')
})
app.use('/users',usersRouter);

app.use('*',(req,res)=> {
    res.status(404).send(`<h1>path ${req.url} was not found...</h1>`)
})
app.listen(PORT, HOST,  ()=> {
    log.magenta(`🌎  listening on`,`http://${HOST}:${PORT}`);
});