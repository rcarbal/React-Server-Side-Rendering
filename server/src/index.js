import 'babel-polyfill';
import express from 'express';
import renderer from './helpers/renderer';
import { matchRoutes } from 'react-router-config';
import proxy from 'express-http-proxy';
import Routes from './client/Routes'
import createStore from './helpers/createStore';

const app = express();

// The third parameter is only for the course so we can work on the this specific API server.
// It is so you don't run into some security errors with the Oauth flow.
app.use(
    '/api',
    proxy('http://react-ssr-api.herokuapp.com', {
        proxyReqOptDecorator(opts) {
            opts.headers['x-forwarded-host'] = 'localhost:3000';
            return opts;
        }
    })
);

app.use(express.static("public"));

app.get('*', (req, res) => {
    const store = createStore(req);

    const promises = matchRoutes(Routes, req.path).map(({ route }) => {
        return route.loadData ? route.loadData(store) : null;
    }).map(promise => {
        if (promise){
            return new Promise((resolve, reject)=>{
                promise.then(resolve).catch(resolve);
            });
        }
    });

    Promise.all(promises).then(() => {
        const context = {};
        const content = renderer(req, store, context);

        if (context.url){
            return res.redirect(301, context.url);
        }

        if (context.notFound){
            res.status(404);
        }

        res.send(content);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Listening in port: ${PORT}`);
});